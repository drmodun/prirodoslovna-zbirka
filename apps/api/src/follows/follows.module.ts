import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationUsersModule } from 'src/notification-users/notification-users.module';

@Module({
  imports: [NotificationsModule, NotificationUsersModule],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
