import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksController } from './works.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [WorksController],
  providers: [WorksService, PrismaService],
  exports: [WorksService],
})
export class WorksModule {}
