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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
