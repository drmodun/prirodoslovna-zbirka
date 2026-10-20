import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { MembersModule } from 'src/members/members.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationUsersModule } from 'src/notification-users/notification-users.module';

@Module({
  imports: [MembersModule, NotificationsModule, NotificationUsersModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
