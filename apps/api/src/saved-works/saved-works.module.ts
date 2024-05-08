import { Module } from '@nestjs/common';
import { SavedWorksService } from './saved-works.service';
import { SavedWorksController } from './saved-works.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SavedWorksController],
  providers: [SavedWorksService, PrismaService],
})
export class SavedWorksModule {}
