import { Module } from '@nestjs/common';
import { FavouriteExponatsService } from './favourite-exponats.service';
import { FavouriteExponatsController } from './favourite-exponats.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FavouriteExponatsController],
  providers: [FavouriteExponatsService, PrismaService],
})
export class FavouriteExponatsModule {}
