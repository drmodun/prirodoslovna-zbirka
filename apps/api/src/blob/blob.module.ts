import { Module } from '@nestjs/common';

import { BlobService } from './blob.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [],
  providers: [BlobService, PrismaService],
  exports: [BlobService],
})
export class BlobModule {}
