import { Module } from '@nestjs/common';
import { CategorizationsService } from './categorizations.service';
import { CategorizationsController } from './categorizations.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CategorizationsController],
  providers: [CategorizationsService, PrismaService],
  exports: [CategorizationsService],
})
export class CategorizationsModule {}
