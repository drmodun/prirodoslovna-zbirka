import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { MembersModule } from 'src/members/members.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationUsersModule } from 'src/notification-users/notification-users.module';

@Module({
  imports: [MembersModule, NotificationsModule, NotificationUsersModule],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
