import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MembersModule } from 'src/members/members.module';
import { OrganisationsModule } from 'src/organisations/organisations.module';
import { FollowsModule } from 'src/follows/follows.module';
import { ExponatsModule } from 'src/exponats/exponats.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationUsersModule } from 'src/notification-users/notification-users.module';

@Module({
  imports: [
    MembersModule,
    OrganisationsModule,
    FollowsModule,
    ExponatsModule,
    NotificationsModule,
    NotificationUsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
