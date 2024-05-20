import { Module } from '@nestjs/common';
import { NotificationUsersService } from './notification-users.service';
import { NotificationUsersController } from './notification-users.controller';

@Module({
  controllers: [NotificationUsersController],
  providers: [NotificationUsersService],
  exports: [NotificationUsersService],
})
export class NotificationUsersModule {}
