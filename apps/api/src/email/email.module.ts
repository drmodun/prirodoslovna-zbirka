import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

// Global so that every module providing NotificationUsersService can mail.
@Global()
@Module({
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
