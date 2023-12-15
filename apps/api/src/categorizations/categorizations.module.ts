import { Module } from '@nestjs/common';
import { CategorizationsService } from './categorizations.service';
import { CategorizationsController } from './categorizations.controller';

@Module({
  controllers: [CategorizationsController],
  providers: [CategorizationsService],
})
export class CategorizationsModule {}
