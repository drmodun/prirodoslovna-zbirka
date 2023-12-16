import { Module } from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';
import { SocialPostsController } from './social-posts.controller';

@Module({
  controllers: [SocialPostsController],
  providers: [SocialPostsService]
})
export class SocialPostsModule {}
