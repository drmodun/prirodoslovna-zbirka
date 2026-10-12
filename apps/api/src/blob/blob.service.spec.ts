import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const ENV_KEYS = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'AWS_S3_URL',
  'AWS_REGION',
  'AWS_ENDPOINT_URL_S3',
  'AWS_S3_FORCE_PATH_STYLE',
  'UPLOAD_DIR',
  'API_PUBLIC_URL',
];

const send = jest.fn();
const S3Client = jest.fn().mockImplementation(() => ({ send }));
const command = (name: string) =>
  jest.fn().mockImplementation(function (this: any, input: any) {
    this.name = name;
    this.input = input;
  });
const PutObjectCommand = command('Put');
const DeleteObjectCommand = command('Delete');
const HeadObjectCommand = command('Head');

/** BlobService reads process.env when it is constructed, so load it fresh. */
function load(env: Record<string, string> = {}) {
  jest.resetModules();
  jest.doMock('@aws-sdk/client-s3', () => ({
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
  }));
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, env);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { BlobService } = require('./blob.service');
  return new BlobService();
}

describe('BlobService', () => {
  let root: string;
  let dir: string;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    // Nested so that a path escaping the upload directory (see the traversal
    // tests) still lands inside the throw-away root.
    root = mkdtempSync(join(tmpdir(), 'blob-spec-'));
    dir = join(root, 'uploads');
  });
  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });
  afterAll(() => {
    for (const k of ENV_KEYS) delete process.env[k];
  });

  describe('local storage (no S3 credentials)', () => {
    const local = () =>
      load({ UPLOAD_DIR: dir, API_PUBLIC_URL: 'http://api.test' });

    it('stores the file and its mimetype and returns the serving URL', async () => {
      const svc = local();
      const url = await svc.upload(
        'user',
        'abc',
        Buffer.from('hello'),
        'image/png',
      );
      expect(url).toBe('http://api.test/blobs/file/user/abc');
      expect(send).not.toHaveBeenCalled();

      const { stream, mimetype } = await svc.readLocal('user', 'abc');
      expect(mimetype).toBe('image/png');
      const chunks: Buffer[] = [];
      for await (const c of stream) chunks.push(c as Buffer);
      expect(Buffer.concat(chunks).toString()).toBe('hello');
    });

    it('defaults the public URL to localhost:5500', async () => {
      const svc = load({ UPLOAD_DIR: dir });
      await expect(
        svc.upload('user', 'a', Buffer.alloc(1), 'x/y'),
      ).resolves.toBe('http://localhost:5500/blobs/file/user/a');
    });

    it('find returns the URL for existing files and null otherwise', async () => {
      const svc = local();
      await svc.upload('audio', 'clip', Buffer.alloc(1), 'audio/mpeg');
      await expect(svc.find('audio', 'clip')).resolves.toBe(
        'http://api.test/blobs/file/audio/clip',
      );
      await expect(svc.find('audio', 'missing')).resolves.toBeNull();
    });

    it('delete removes the file and its type sidecar', async () => {
      const svc = local();
      await svc.upload('user', 'gone', Buffer.alloc(1), 'image/png');
      await svc.delete('user/gone');
      await expect(svc.find('user', 'gone')).resolves.toBeNull();
      await expect(svc.readLocal('user', 'gone')).rejects.toThrow('Not Found');
    });

    it('delete of a missing file is not an error', async () => {
      await expect(
        local().delete('user/never-existed'),
      ).resolves.toBeUndefined();
    });

    it('readLocal 404s for unknown files', async () => {
      await expect(local().readLocal('user', 'nope')).rejects.toMatchObject({
        status: 404,
      });
    });

    describe('path traversal protection', () => {
      it.each([
        ['user', '../../etc/passwd'],
        ['a/b', 'c'],
        ['user', 'name with space'],
        ['', 'x'],
        ['user', ''],
      ])('rejects %p / %p', async (directory, name) => {
        const svc = local();
        await expect(
          svc.upload(directory, name, Buffer.alloc(1), 'x/y'),
        ).rejects.toMatchObject({ status: 400 });
        await expect(svc.readLocal(directory, name)).rejects.toMatchObject({
          status: 400,
        });
      });

      // BUG: SAFE_SEGMENT (/^[\w.-]+$/) allows segments made only of dots, so
      // directory=".." resolves to the parent of the upload directory and
      // name=".." resolves to the directory itself. The guard has to reject
      // "." and ".." explicitly.
      it.failing.each([
        ['..', 'passwd'],
        ['user', '..'],
        ['.', 'x'],
      ])('rejects dot segments %p / %p', async (directory, name) => {
        const svc = local();
        await expect(
          svc.upload(directory, name, Buffer.alloc(1), 'x/y'),
        ).rejects.toMatchObject({ status: 400 });
      });

      it('refuses to read or write the .type sidecar files directly', async () => {
        const svc = local();
        await svc.upload('user', 'f', Buffer.alloc(1), 'image/png');
        await expect(svc.readLocal('user', 'f.type')).rejects.toMatchObject({
          status: 400,
        });
        await expect(
          svc.upload('user', 'f.type', Buffer.alloc(1), 'x/y'),
        ).rejects.toMatchObject({ status: 400 });
      });
    });
  });

  describe('S3 storage', () => {
    const s3 = (extra: Record<string, string> = {}) =>
      load({
        AWS_ACCESS_KEY_ID: 'id',
        AWS_SECRET_ACCESS_KEY: 'secret',
        AWS_S3_BUCKET: 'bucket',
        UPLOAD_DIR: dir,
        ...extra,
      });

    it('puts the object and returns the AWS virtual-hosted URL', async () => {
      send.mockResolvedValue({});
      const url = await s3({ AWS_REGION: 'eu-west-1' }).upload(
        'user',
        'abc',
        Buffer.from('x'),
        'image/png',
      );
      expect(url).toBe('https://bucket.s3.eu-west-1.amazonaws.com/user/abc');
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'bucket',
        Key: 'user/abc',
        Body: Buffer.from('x'),
        ContentType: 'image/png',
      });
    });

    it('defaults to eu-north-1', async () => {
      send.mockResolvedValue({});
      await expect(s3().upload('d', 'n', Buffer.alloc(1), 'x/y')).resolves.toBe(
        'https://bucket.s3.eu-north-1.amazonaws.com/d/n',
      );
    });

    it('uses path-style addressing for custom endpoints', async () => {
      send.mockResolvedValue({});
      const svc = s3({ AWS_ENDPOINT_URL_S3: 'http://minio:9000///' });
      await expect(svc.upload('d', 'n', Buffer.alloc(1), 'x/y')).resolves.toBe(
        'http://minio:9000/bucket/d/n',
      );
      expect(S3Client.mock.calls[0][0]).toMatchObject({
        endpoint: 'http://minio:9000',
        forcePathStyle: true,
      });
    });

    it('AWS_S3_FORCE_PATH_STYLE overrides the endpoint heuristic', () => {
      s3({
        AWS_ENDPOINT_URL_S3: 'http://minio:9000',
        AWS_S3_FORCE_PATH_STYLE: 'false',
      });
      expect(S3Client.mock.calls[0][0].forcePathStyle).toBe(false);
    });

    it.each([
      ['cdn.example.com', 'https://cdn.example.com'],
      ['https://cdn.example.com//', 'https://cdn.example.com'],
      ['http://cdn.example.com', 'http://cdn.example.com'],
    ])('AWS_S3_URL=%s -> public base %s', async (value, base) => {
      send.mockResolvedValue({});
      const url = await s3({ AWS_S3_URL: value }).upload(
        'd',
        'n',
        Buffer.alloc(1),
        'x/y',
      );
      expect(url).toBe(`${base}/d/n`);
    });

    it('ignores AWS_S3_URL values that are not http(s) URLs', async () => {
      send.mockResolvedValue({});
      const url = await s3({ AWS_S3_URL: 's3://bucket' }).upload(
        'd',
        'n',
        Buffer.alloc(1),
        'x/y',
      );
      expect(url).toBe('https://bucket.s3.eu-north-1.amazonaws.com/d/n');
    });

    it('wraps upload failures in a 500', async () => {
      send.mockRejectedValue(new Error('denied'));
      await expect(
        s3().upload('d', 'n', Buffer.alloc(1), 'x/y'),
      ).rejects.toMatchObject({ status: 500, message: 'denied' });
    });

    it('delete sends a DeleteObjectCommand and wraps failures', async () => {
      send.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('nope'));
      const svc = s3();
      await svc.delete('user/abc');
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'bucket',
        Key: 'user/abc',
      });
      await expect(svc.delete('user/abc')).rejects.toMatchObject({
        status: 500,
      });
    });

    it('find uses HeadObject: URL when present, null on error', async () => {
      send.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('404'));
      const svc = s3();
      await expect(svc.find('audio', 'a')).resolves.toBe(
        'https://bucket.s3.eu-north-1.amazonaws.com/audio/a',
      );
      await expect(svc.find('audio', 'b')).resolves.toBeNull();
      expect(HeadObjectCommand).toHaveBeenCalledWith({
        Bucket: 'bucket',
        Key: 'audio/a',
      });
    });

    it('does not write to the local disk', async () => {
      send.mockResolvedValue({});
      await s3().upload('d', 'n', Buffer.alloc(1), 'x/y');
      await expect(
        load({ UPLOAD_DIR: dir }).find('d', 'n'),
      ).resolves.toBeNull();
    });
  });

  it('needs the bucket AND both credentials to use S3', async () => {
    const svc = load({
      AWS_S3_BUCKET: 'b',
      AWS_ACCESS_KEY_ID: 'id',
      UPLOAD_DIR: dir,
    });
    await svc.upload('d', 'n', Buffer.alloc(1), 'x/y');
    expect(send).not.toHaveBeenCalled();
  });
});
