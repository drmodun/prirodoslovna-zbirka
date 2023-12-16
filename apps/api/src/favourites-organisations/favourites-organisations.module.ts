import { Module } from '@nestjs/common';
import { FavouriteOrganisationsService } from './favourites-organisations.service';
import { FavouritesOrganisationsController } from './favourites-organisations.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FavouritesOrganisationsController],
  providers: [FavouriteOrganisationsService, PrismaService],
})
export class FavouritesOrganisationsModule {}
