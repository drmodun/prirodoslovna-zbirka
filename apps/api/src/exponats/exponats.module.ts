import { Module } from '@nestjs/common';
import { ExponatsService } from './exponats.service';
import { ExponatsController } from './exponats.controller';

@Module({
  controllers: [ExponatsController],
  providers: [ExponatsService]
})
export class ExponatsModule {}
