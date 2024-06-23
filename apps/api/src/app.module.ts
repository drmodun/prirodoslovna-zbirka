import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchemaForEnv } from './config/environment-variables';
import { PrismaModule } from './prisma/prisma.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ExponatsModule } from './exponats/exponats.module';
import { FavouritesOrganisationsModule } from './favourites-organisations/favourites-organisations.module';
import { SocialPostsModule } from './social-posts/social-posts.module';
import { CategorizationsModule } from './categorizations/categorizations.module';
import { FavouriteExponatsModule } from './favourite-exponats/favourite-exponats.module';
import { MembersModule } from './members/members.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { BlobModule } from './blob/blob.module';
import { EmailModule } from './email/email.module';
import { WorksModule } from './works/works.module';
import { SavedWorksModule } from './saved-works/saved-works.module';
import { LiteratureModule } from './literature/literature.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationUsersModule } from './notification-users/notification-users.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthorshipInfoModule } from './authorship-info/authorship-info.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'web', 'dist'),
      exclude: ['/api/(.*)'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchemaForEnv,
    }),
    PrismaModule,
    OrganisationsModule,
    UsersModule,
    AuthModule,
    ExponatsModule,
    FavouritesOrganisationsModule,
    SocialPostsModule,
    CategorizationsModule,
    FavouriteExponatsModule,
    MembersModule,
    PostsModule,
    LikesModule,
    FollowsModule,
    BlobModule,
    EmailModule,
    WorksModule,
    SavedWorksModule,
    LiteratureModule,
    NotificationsModule,
    NotificationUsersModule,
    EventEmitterModule.forRoot(),
    AuthorshipInfoModule,
    QuizzesModule,
    QuestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
