import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { PrismaService } from 'src/Prisma/Prisma.service';
import { PrismaModule } from 'src/Prisma/Prisma.module';

@Module({
  controllers: [OrganisationsController],
  providers: [OrganisationsService, PrismaService],
  imports: [PrismaModule],
})
export class OrganisationsModule {}
