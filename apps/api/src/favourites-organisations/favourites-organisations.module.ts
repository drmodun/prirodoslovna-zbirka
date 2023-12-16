import { Module } from '@nestjs/common';
import { FavouriteOrganisationsService } from './favourites-organisations.service';
import { FavouriteOrgranisationsController } from './favourites-organisations.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FavouriteOrgranisationsController],
  providers: [FavouriteOrganisationsService, PrismaService],
})
export class FavouritesOrganisationsModule {}
