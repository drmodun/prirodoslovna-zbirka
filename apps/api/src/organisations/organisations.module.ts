import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { PrismaService } from 'src/Prisma/prisma.service';

@Module({
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  imports: [PrismaService],
})
export class OrganisationsModule {}
