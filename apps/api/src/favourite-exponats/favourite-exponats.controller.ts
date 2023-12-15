import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FavouriteExponatsService } from './favourite-exponats.service';
import { CreateFavouriteExponatDto } from './dto/create-favourite-exponat.dto';
import { UpdateFavouriteExponatDto } from './dto/update-favourite-exponat.dto';

@Controller('favourite-exponats')
export class FavouriteExponatsController {
  constructor(
    private readonly favouriteExponatsService: FavouriteExponatsService,
  ) {}

  @Post()
  create(@Body() createFavouriteExponatDto: CreateFavouriteExponatDto) {
    return this.favouriteExponatsService.create(createFavouriteExponatDto);
  }

  @Get()
  findAll() {
    return this.favouriteExponatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favouriteExponatsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFavouriteExponatDto: UpdateFavouriteExponatDto,
  ) {
    return this.favouriteExponatsService.update(+id, updateFavouriteExponatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favouriteExponatsService.remove(+id);
  }
}
