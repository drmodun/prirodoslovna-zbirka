import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [OrganisationsController],
  providers: [OrganisationsService, PrismaService],
  imports: [PrismaModule],
})
export class OrganisationsModule {}
