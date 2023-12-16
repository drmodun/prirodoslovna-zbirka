import { Module } from '@nestjs/common';
import { FavouritesOrganisationsService } from './favourites-organisations.service';
import { FavouritesOrganisationsController } from './favourites-organisations.controller';

@Module({
  controllers: [FavouritesOrganisationsController],
  providers: [FavouritesOrganisationsService]
})
export class FavouritesOrganisationsModule {}
