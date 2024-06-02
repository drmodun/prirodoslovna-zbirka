import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';

@Module({
  controllers: [FollowsController],
  providers: [
    FollowsService,
    PrismaService,
    NotificationsService,
    NotificationUsersService,
  ],
})
export class FollowsModule {}
