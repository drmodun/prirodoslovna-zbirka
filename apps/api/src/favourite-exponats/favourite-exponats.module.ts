import { Module } from '@nestjs/common';
import { FavouriteExponatsService } from './favourite-exponats.service';
import { FavouriteExponatsController } from './favourite-exponats.controller';

@Module({
  controllers: [FavouriteExponatsController],
  providers: [FavouriteExponatsService]
})
export class FavouriteExponatsModule {}
