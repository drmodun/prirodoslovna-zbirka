import { Module } from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';
import { SocialPostsController } from './social-posts.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationUsersModule } from 'src/notification-users/notification-users.module';

@Module({
  imports: [NotificationsModule, NotificationUsersModule],
  controllers: [SocialPostsController],
  providers: [SocialPostsService],
})
export class SocialPostsModule {}
