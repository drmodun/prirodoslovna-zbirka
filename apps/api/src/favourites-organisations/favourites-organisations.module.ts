import { Module } from '@nestjs/common';
import { FavouriteOrganisationsService } from './favourites-organisations.service';
import { FavouriteOrgranisationsController } from './favourites-organisations.controller';

@Module({
  controllers: [FavouriteOrgranisationsController],
  providers: [FavouriteOrganisationsService],
})
export class FavouritesOrganisationsModule {}
