import { Module } from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';
import { SocialPostsController } from './social-posts.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';

@Module({
  controllers: [SocialPostsController],
  providers: [
    SocialPostsService,
    PrismaService,
    NotificationsService,
    NotificationUsersService,
  ],
})
export class SocialPostsModule {}
