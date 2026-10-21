import { Module } from '@nestjs/common';
import { ExponatsService } from './exponats.service';
import { ExponatsController } from './exponats.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationUsersModule } from 'src/notification-users/notification-users.module';

@Module({
  imports: [NotificationsModule, NotificationUsersModule],
  controllers: [ExponatsController],
  providers: [ExponatsService],
  exports: [ExponatsService],
})
export class ExponatsModule {}
