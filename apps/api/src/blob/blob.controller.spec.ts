import { BadRequestException, StreamableFile } from '@nestjs/common';
import { Readable } from 'stream';
import { BlobController } from './blob.controller';

describe('BlobController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: BlobController;
  const file = (mimetype: string) =>
    ({ buffer: Buffer.from('data'), mimetype }) as Express.Multer.File;

  beforeEach(() => {
    svc = { upload: jest.fn(), find: jest.fn(), readLocal: jest.fn() };
    controller = new BlobController(svc as any);
  });

  it('file streams a local file with its stored mimetype', async () => {
    svc.readLocal.mockResolvedValue({
      stream: Readable.from(['x']),
      mimetype: 'image/png',
    });
    const res = await controller.file('user', 'abc');
    expect(res).toBeInstanceOf(StreamableFile);
    expect(res.options.type).toBe('image/png');
    expect(svc.readLocal).toHaveBeenCalledWith('user', 'abc');
  });

  describe.each([
    ['upload', (c: BlobController, f: any) => c.upload('user' as any, f)],
    ['pdfUpload', (c: BlobController, f: any) => c.pdfUpload('user' as any, f)],
    [
      'modelUpload',
      (c: BlobController, f: any) => c.modelUpload('user' as any, f),
    ],
    [
      'videoUpload',
      (c: BlobController, f: any) => c.videoUpload('user' as any, f),
    ],
  ])('%s', (_n, call) => {
    it('stores the file under a random UUID and returns its URL', async () => {
      svc.upload.mockResolvedValue('http://x/user/uuid');
      const f = file('image/png');
      await expect(call(controller, f)).resolves.toBe('http://x/user/uuid');
      const [dir, name, buffer, mimetype] = svc.upload.mock.calls[0];
      expect(dir).toBe('user');
      expect(name).toMatch(/^[0-9a-f-]{36}$/);
      expect(buffer).toBe(f.buffer);
      expect(mimetype).toBe('image/png');
    });

    it('fails when the service returns no URL', async () => {
      svc.upload.mockResolvedValue(undefined);
      await expect(call(controller, file('image/png'))).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('generates a different name every time', async () => {
      svc.upload.mockResolvedValue('u');
      await call(controller, file('x/y'));
      await call(controller, file('x/y'));
      expect(svc.upload.mock.calls[0][1]).not.toBe(svc.upload.mock.calls[1][1]);
    });
  });

  it('namedAudioUpload keeps the client supplied name', async () => {
    svc.upload.mockResolvedValue('http://x/audio/clip');
    await expect(
      controller.namedAudioUpload('audio' as any, 'clip', file('audio/mpeg')),
    ).resolves.toBe('http://x/audio/clip');
    expect(svc.upload.mock.calls[0].slice(0, 2)).toEqual(['audio', 'clip']);
  });

  it('findAudio returns the URL or 404s', async () => {
    svc.find.mockResolvedValueOnce('http://x/a').mockResolvedValueOnce(null);
    await expect(controller.findAudio('audio', 'a')).resolves.toBe(
      'http://x/a',
    );
    await expect(controller.findAudio('audio', 'b')).rejects.toMatchObject({
      status: 404,
    });
  });

  // SECURITY: every upload endpoint is anonymous and the model endpoint has no
  // content-type validation, so anyone can store up to 200MB of arbitrary data.
  it.failing.each([
    'upload',
    'pdfUpload',
    'namedAudioUpload',
    'modelUpload',
    'videoUpload',
  ] as const)('%s requires authentication', (method) => {
    const guards = Reflect.getMetadata(
      '__guards__',
      BlobController.prototype[method],
    );
    expect(guards?.length).toBeGreaterThan(0);
  });
});
