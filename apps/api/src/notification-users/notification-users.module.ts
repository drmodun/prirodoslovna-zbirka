import { Module } from '@nestjs/common';
import { NotificationUsersService } from './notification-users.service';
import { NotificationUsersController } from './notification-users.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [NotificationUsersController],
  providers: [NotificationUsersService, PrismaService],
  exports: [NotificationUsersService],
})
export class NotificationUsersModule {}
