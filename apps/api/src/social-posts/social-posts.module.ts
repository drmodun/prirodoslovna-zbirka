import { Module } from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';
import { SocialPostsController } from './social-posts.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SocialPostsController],
  providers: [SocialPostsService, PrismaService],
})
export class SocialPostsModule {}
