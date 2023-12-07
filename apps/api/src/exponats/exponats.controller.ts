import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExponatsService } from './exponats.service';
import { CreateExponatDto, UpdateExponatDto } from './dto/exponats.dto';
import { ExponatResponseShort } from '@biosfera/types';

@Controller('exponats')
export class ExponatsController {
  constructor(private readonly exponatsService: ExponatsService) {}

  @Post()
  async create(@Body() createOrganisationDto: CreateExponatDto) {
    const item = await this.exponatsService.create(createOrganisationDto);

    const mapped = {
      id: item.id,
      name: item.name,
      mainImage: item.mainImage,
      updatedAt: item.updatedAt,
      favouriteCount: 0,
      postCount: 0,
      alternateName: item.alternateName,
      description: item.description,
      organizationId: item.organisationId,
      organizationName: item.Organisation.name,
    } as ExponatResponseShort;

    return mapped;
  }

  @Get()
  findAll() {
    return this.exponatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exponatsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExponatDto: UpdateExponatDto) {
    return this.exponatsService.update(id, updateExponatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exponatsService.remove(id);
  }
}
