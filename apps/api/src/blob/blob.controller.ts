import {
  Controller,
  Get,
  Post,
  StreamableFile,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import {
  INTERNAL_KEY_HEADER,
  InternalKeyGuard,
} from 'src/auth/internal-key.guard';
import { BlobService } from './blob.service';
import { randomUUID } from 'crypto';
import { Directories } from '@biosfera/types';

// Recordings made by the web server: audio-<directory>/<id>-<12 hex chars>.
const AUDIO_DIRECTORY = /^audio-[a-z-]+$/;
const AUDIO_NAME = /^[\w-]+-[0-9a-f]{12}$/;

@ApiTags('blobs')
@Controller('blobs')
export class BlobController {
  constructor(private readonly blobService: BlobService) {}

  // Serves files kept on disk when S3 is not configured.
  @Get('file/:directory/:name')
  async file(
    @Param('directory') directory: string,
    @Param('name') name: string,
  ) {
    const { stream, mimetype } = await this.blobService.readLocal(
      directory,
      name,
    );
    return new StreamableFile(stream, { type: mimetype });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

    if (url) return url;
    else throw new BadRequestException('File upload failed');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/pdf/:directory')
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
  async pdfUpload(
    @Param('directory') directory: Directories,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/pdf' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 100 }),
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

    if (url) return url;
    else throw new BadRequestException('File upload failed');
  }

  //TODO: if needed add pptx upload possibility, currently because of file size and usage it is much more efficient and simple to use pdf for presentations

  // URL of an existing recording, so the web app synthesises each text once.
  @Get('/audio/:directory/:name')
  async findAudio(
    @Param('directory') directory: string,
    @Param('name') name: string,
  ) {
    const url = await this.blobService.find(directory, name);
    if (!url) throw new NotFoundException();
    return url;
  }

  @Post('/audio/:directory/:name')
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
  @ApiHeader({ name: INTERNAL_KEY_HEADER, description: 'INTERNAL_API_KEY' })
  @UseGuards(InternalKeyGuard)
  @UseInterceptors(FileInterceptor('file'))
  async namedAudioUpload(
    @Param('directory') directory: Directories,
    @Param('name') name: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'audio/*' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 100 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // The web server stores text-to-speech recordings here while rendering
    // pages for anyone, so there is no user to authenticate; it proves itself
    // with the internal key instead. The endpoint still only takes recording
    // names and never replaces a file.
    if (!AUDIO_DIRECTORY.test(directory) || !AUDIO_NAME.test(name))
      throw new BadRequestException('Invalid recording name');
    if (await this.blobService.find(directory, name))
      throw new ConflictException('Recording already exists');

    const url = await this.blobService.upload(
      directory,
      name,
      file.buffer,
      file.mimetype,
    );

    if (url) return url;
    else throw new BadRequestException('File upload failed');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/model/:directory')
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
  async modelUpload(
    @Param('directory') directory: Directories,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 200 })],
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
    if (url) return url;
    else throw new BadRequestException('File upload failed');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/video/:directory')
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
  async videoUpload(
    @Param('directory') directory: Directories,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'video/mp4' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 200 }),
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
    if (url) return url;
    else throw new BadRequestException('File upload failed');
  }
}
