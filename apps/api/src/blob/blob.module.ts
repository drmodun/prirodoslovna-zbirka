import { Module } from '@nestjs/common';

import { BlobService } from './blob.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlobController } from './blob.controller';

@Module({
  controllers: [BlobController],
  providers: [BlobService, PrismaService],
  exports: [BlobService],
})
export class BlobModule {}
