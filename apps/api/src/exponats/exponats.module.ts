import { Module } from '@nestjs/common';
import { ExponatsService } from './exponats.service';
import { ExponatsController } from './exponats.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [ExponatsController],
  providers: [
    ExponatsService,
    PrismaService,
    NotificationUsersService,
    NotificationsService,
  ],
  exports: [ExponatsService],
})
export class ExponatsModule {}
