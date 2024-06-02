import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MembersService } from 'src/members/members.service';
import { MembersModule } from 'src/members/members.module';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';

@Module({
  controllers: [OrganisationsController],
  providers: [
    OrganisationsService,
    PrismaService,
    MembersService,
    NotificationsService,
    NotificationUsersService,
  ],
  imports: [PrismaModule, MembersModule],
})
export class OrganisationsModule {}
