import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembersService } from 'src/members/members.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';

@Module({
  controllers: [QuizzesController],
  providers: [
    QuizzesService,
    PrismaService,
    MembersService,
    NotificationsService,
    NotificationUsersService,
  ],
})
export class QuizzesModule {}
