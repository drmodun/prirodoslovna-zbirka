import { Module } from '@nestjs/common';
import { NotificationUsersModule } from 'src/notification-users/notification-users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ApiTokenRateLimiter } from './api-token-rate-limiter';
import { ApiTokensController } from './api-tokens.controller';
import { ApiTokensService } from './api-tokens.service';

@Module({
  imports: [NotificationsModule, NotificationUsersModule],
  controllers: [ApiTokensController],
  providers: [
    ApiTokensService,
    // One counter per process for every request.
    { provide: ApiTokenRateLimiter, useValue: new ApiTokenRateLimiter() },
  ],
  exports: [ApiTokensService, ApiTokenRateLimiter],
})
export class ApiTokensModule {}
