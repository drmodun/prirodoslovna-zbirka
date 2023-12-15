import { Injectable } from '@nestjs/common';
import { CreateFavouriteExponatDto } from './dto/create-favourite-exponat.dto';
import { UpdateFavouriteExponatDto } from './dto/update-favourite-exponat.dto';

@Injectable()
export class FavouriteExponatsService {
  create(createFavouriteExponatDto: CreateFavouriteExponatDto) {
    return 'This action adds a new favouriteExponat';
  }

  findAll() {
    return `This action returns all favouriteExponats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favouriteExponat`;
  }

  update(id: number, updateFavouriteExponatDto: UpdateFavouriteExponatDto) {
    return `This action updates a #${id} favouriteExponat`;
  }

  remove(id: number) {
    return `This action removes a #${id} favouriteExponat`;
  }
}
