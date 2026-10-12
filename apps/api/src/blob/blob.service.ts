import {
  DeleteObjectCommand,
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

const DEFAULT_S3_URL = 'https://biosfera-files.s3.eu-north-1.amazonaws.com';
// Keys are "<directory>/<name>"; neither part may leave the upload directory.
const SAFE_SEGMENT = /^[\w.-]+$/;

@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private bucket = process.env.AWS_S3_BUCKET;
  private url = process.env.AWS_S3_URL || DEFAULT_S3_URL;

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
    region: 'eu-north-1',
  });

  constructor() {
    if (!this.useS3)
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
