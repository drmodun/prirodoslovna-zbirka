import { Module } from '@nestjs/common';
import { AuthorshipInfoService } from './authorship-info.service';
import { AuthorshipInfoController } from './authorship-info.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AuthorshipInfoController],
  providers: [AuthorshipInfoService, PrismaService],
})
export class AuthorshipInfoModule {}
