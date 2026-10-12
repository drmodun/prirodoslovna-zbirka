import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createReadStream, promises as fs } from 'fs';
import { join, resolve } from 'path';

const DEFAULT_REGION = 'eu-north-1';
// Keys are "<directory>/<name>"; neither part may leave the upload directory.
const SAFE_SEGMENT = /^[\w.-]+$/;

@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private bucket = process.env.AWS_S3_BUCKET;
  private region = process.env.AWS_REGION || DEFAULT_REGION;
  // Set for S3-compatible stores (MinIO, Garage, SeaweedFS, R2, ...); empty
  // means AWS itself.
  private endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/+$/, '');
  // Most self-hosted stores address buckets as <endpoint>/<bucket>, not
  // <bucket>.<endpoint>.
  private forcePathStyle = process.env.AWS_S3_FORCE_PATH_STYLE
    ? process.env.AWS_S3_FORCE_PATH_STYLE === 'true'
    : !!this.endpoint;
  // Where browsers read the files. AWS_S3_URL overrides, e.g. when the
  // endpoint above is only reachable from inside the network.
  private url = (
    process.env.AWS_S3_URL ||
    (this.endpoint
      ? `${this.endpoint}/${this.bucket}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com`)
  ).replace(/\/+$/, '');

  private useS3 =
    !!this.bucket &&
    !!process.env.AWS_ACCESS_KEY_ID &&
    !!process.env.AWS_SECRET_ACCESS_KEY;

  // Without S3 credentials files are kept on disk and served by
  // GET /blobs/file/:directory/:name.
  private localDirectory = resolve(process.env.UPLOAD_DIR || 'uploads');
  private localUrl = `${
    process.env.API_PUBLIC_URL || 'http://localhost:5500'
  }/blobs/file`;

  private client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: this.region,
    endpoint: this.endpoint,
    forcePathStyle: this.forcePathStyle,
    // Newer SDKs add CRC32 checksums to every request, which several
    // S3-compatible stores reject.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

  constructor() {
    if (this.useS3)
      this.logger.log(
        `Files are stored in bucket ${this.bucket} at ${
          this.endpoint ?? 'AWS'
        } and read from ${this.url}`,
      );
    else
      this.logger.warn(
        `AWS_* is not set, files are stored in ${this.localDirectory}`,
      );
  }

  async upload(
    directory: string,
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ) {
    const key = `${directory}/${filename}`;

    if (!this.useS3) {
      const path = this.localPath(directory, filename);
      await fs.mkdir(join(this.localDirectory, directory), { recursive: true });
      await fs.writeFile(path, buffer);
      await fs.writeFile(`${path}.type`, mimetype);
      return `${this.localUrl}/${key}`;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });

    try {
      await this.client.send(command);

      return `${this.url}/${key}`;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(key: string) {
    if (!this.useS3) {
      const [directory, filename] = key.split('/');
      const path = this.localPath(directory, filename);
      await fs.rm(path, { force: true });
      await fs.rm(`${path}.type`, { force: true });
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Public URL of a stored file, or null when there is none.
  async find(directory: string, filename: string) {
    const key = `${directory}/${filename}`;

    if (!this.useS3) {
      const exists = await fs
        .access(this.localPath(directory, filename))
        .then(() => true)
        .catch(() => false);
      return exists ? `${this.localUrl}/${key}` : null;
    }

    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return `${this.url}/${key}`;
    } catch {
      return null;
    }
  }

  // Only meaningful for locally stored files; S3 serves its own.
  async readLocal(directory: string, filename: string) {
    const path = this.localPath(directory, filename);

    try {
      const mimetype = await fs.readFile(`${path}.type`, 'utf8');
      await fs.access(path);
      return { stream: createReadStream(path), mimetype };
    } catch {
      throw new NotFoundException();
    }
  }

  private localPath(directory: string, filename: string) {
    if (!SAFE_SEGMENT.test(directory) || !SAFE_SEGMENT.test(filename))
      throw new BadRequestException('Invalid file name');
    if (filename.endsWith('.type'))
      throw new BadRequestException('Invalid file name');
    return join(this.localDirectory, directory, filename);
  }
}
