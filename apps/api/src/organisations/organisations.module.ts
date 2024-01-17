import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MembersService } from 'src/members/members.service';
import { MembersModule } from 'src/members/members.module';

@Module({
  controllers: [OrganisationsController],
  providers: [OrganisationsService, PrismaService, MembersService],
  imports: [PrismaModule, MembersModule],
})
export class OrganisationsModule {}
