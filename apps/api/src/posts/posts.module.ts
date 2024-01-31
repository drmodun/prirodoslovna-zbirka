import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembersService } from 'src/members/members.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MembersModule } from 'src/members/members.module';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { ExponatsService } from 'src/exponats/exponats.service';

@Module({
  controllers: [PostsController],
  providers: [
    PostsService,
    PrismaService,
    MembersService,
    OrganisationsService,
    ExponatsService,
  ],
  imports: [PrismaModule, MembersModule],
})
export class PostsModule {}
