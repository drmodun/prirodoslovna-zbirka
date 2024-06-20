import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembersService } from 'src/members/members.service';

@Module({
  controllers: [QuizzesController],
  providers: [QuizzesService, PrismaService, MembersService],
})
export class QuizzesModule {}
