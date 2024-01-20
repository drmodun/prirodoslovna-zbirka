import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembersService } from 'src/members/members.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MembersModule } from 'src/members/members.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService, MembersService],
  imports: [PrismaModule, MembersModule],
})
export class PostsModule {}
