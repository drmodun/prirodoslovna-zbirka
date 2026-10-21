import { Global, Module } from '@nestjs/common';
import { NotificationBusService } from './notification-bus.service';

// Global so that the one listener connection is shared by every module that
// imports NotificationUsersModule.
@Global()
@Module({
  providers: [NotificationBusService],
  exports: [NotificationBusService],
})
export class NotificationBusModule {}
