import { PartialType } from '@nestjs/swagger';
import { CreateFavouriteExponatDto } from './create-favourite-exponat.dto';

export class UpdateFavouriteExponatDto extends PartialType(CreateFavouriteExponatDto) {}
