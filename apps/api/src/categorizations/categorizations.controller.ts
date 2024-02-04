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
import { CategorizationsService } from './categorizations.service';
import {
  CreateCategorizationDto,
  CategorizationQuery,
  UpdateCategorizationDto,
} from './dto/categorizations.dto';
import {
  CategorizationExtendedResponse,
  CategorizationResponseShort,
  ExponatResponseShort,
  PaginationRequest,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
import { PaginationParams } from 'src/config/pagination';
import { SortingParams } from 'src/config/sorting';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('categorizations')
@Controller('categorizations')
export class CategorizationsController {
  constructor(
    private readonly categorizationsService: CategorizationsService,
  ) {}

  @Post()
  async create(@Body() createOrganisationDto: CreateCategorizationDto) {
    const item = await this.categorizationsService.create(
      createOrganisationDto,
    );

    const mapped = {
      family: item.family,
      id: item.id,
      numberOfExponats: 0,
    } as CategorizationResponseShort;

    return mapped;
  }

  @Get()
  async findAll(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([
      SortingEnum.FAMILY,
      SortingEnum.GENUS,
      SortingEnum.EXPONAT_AMOUNT,
      SortingEnum.KINGDOM,
      SortingEnum.CLASS,
      SortingEnum.DOMAIN,
      SortingEnum.ORDER,
      SortingEnum.PHYLUM,
    ])
    sorting?: SortingRequest,
    @Query() filter?: CategorizationQuery,
  ) {
    const items = await this.categorizationsService.findAll(
      filter,
      sorting,
      paginationParam,
    );

    const mapped = items.map((item) => {
      return {
        family: item.family,
        numberOfExponats: item._count.Exponat,
        id: item.id,
      } as CategorizationResponseShort;
    });

    return mapped;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.categorizationsService.findOne(id);

    const exponats: ExponatResponseShort[] = item.Exponat.map((exponat) => {
      return {
        alternateName: exponat.alternateName,
        description: exponat.description,
        favouriteCount: exponat._count.FavouriteExponats,
        organizationId: exponat.organisationId,
        mainImage: exponat.mainImage,
        exponatKind: exponat.ExponatKind,
        name: exponat.name,
        updatedAt: exponat.updatedAt,
        id: exponat.id,
        organizationName: exponat.organisationId,
        postCount: exponat._count.Posts,
      } as ExponatResponseShort;
    });

    const mapped = {
      class: item.class,
      domain: item.domain,
      family: item.family,
      order: item.order,
      id: item.id,
      kingom: item.kingdom,
      phylum: item.phylum,
      genus: item.genus,
      numberOfExponats: item._count.Exponat,
      exponats: exponats,
    } as CategorizationExtendedResponse;

    return mapped;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategorizationDto: UpdateCategorizationDto,
  ) {
    return await this.categorizationsService.update(
      id,
      updateCategorizationDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categorizationsService.remove(id);
  }

  @Get('/name/:name')
  async findByName(@Param('name') name: string) {
    const item = await this.categorizationsService.findByName(name);

    const mapped = {
      family: item.family,
      id: item.id,
      species: item.species,
    } as CategorizationResponseShort;

    return mapped;
  }
}
