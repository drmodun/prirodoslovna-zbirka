import { Module } from '@nestjs/common';
import { ExponatsService } from './exponats.service';
import { ExponatsController } from './exponats.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ExponatsController],
  providers: [ExponatsService, PrismaService],
  exports: [ExponatsService],
})
export class ExponatsModule {}
