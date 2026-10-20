import { Module } from '@nestjs/common';

import { BlobService } from './blob.service';
import { BlobController } from './blob.controller';

@Module({
  controllers: [BlobController],
  providers: [BlobService],
  exports: [BlobService],
})
export class BlobModule {}
