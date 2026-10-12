import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [MembersController],
  providers: [
    MembersService,
    PrismaService,
    NotificationUsersService,
    NotificationsService,
  ],
  exports: [MembersService],
  imports: [PrismaModule],
})
export class MembersModule {}
