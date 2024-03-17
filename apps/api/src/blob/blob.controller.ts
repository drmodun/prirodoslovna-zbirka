import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BlobService } from './blob.service';
import { randomUUID } from 'crypto';
import { Directories } from '@biosfera/types';

@ApiTags('blobs')
@Controller('blobs')
export class BlobController {
  constructor(private readonly blobService: BlobService) {}

  @Post(':directory')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('directory') directory: Directories,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const name = randomUUID();
    const url = await this.blobService.upload(
      directory,
      name,
      file.buffer,
      file.mimetype,
    );

    if (url)
      return `https://biosfera-files.s3.eu-north-1.amazonaws.com/${directory}/${name}`;
    else throw new BadRequestException('File upload failed');
  }
}
