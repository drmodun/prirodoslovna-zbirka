import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ExponatsService } from './exponats.service';
import {
  CreateExponatDto,
  ExponatQuery,
  UpdateExponatDto,
} from './dto/exponats.dto';
import {
  ExponatResponseShort,
  PaginationRequest,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
import { ApiQuery } from '@nestjs/swagger';
import { PaginationParams } from 'src/config/pagination';
import { SortingParams } from 'src/config/sorting';

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
  async findAll(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([SortingEnum.NAME, SortingEnum.COUNTY, SortingEnum.POINTS])
    sorting?: SortingRequest,
    @Query() filter?: ExponatQuery,
  ) {
    const items = await this.exponatsService.findAll(
      filter,
      sorting,
      paginationParam,
    );

    const mapped = items.map((item) => {
      return {
        id: item.id,
        name: item.name,
        mainImage: item.mainImage,
        updatedAt: item.updatedAt,
        favouriteCount: item._count.FavouriteExponat,
        postCount: item._count.Posts,
        alternateName: item.alternateName,
        description: item.description,
        organizationId: item.organisationId,
        organizationName: item.Organisation.name,
      } as ExponatResponseShort;
    });

    return mapped;
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
