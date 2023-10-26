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
import { OrganisationsService } from './organisations.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { PaginationParams } from 'src/config/pagination';
import {
  PaginationRequest,
  SortingEnum,
  SortingRequest,
} from '../../../../packages/types/query';
import { SortingParams } from 'src/config/sorting';
import {
  OrganisationQuery,
  UpdateOrganisationRequest,
  CreateOrganisationRequest,
} from '../../../../packages/types/organisation/organisationRequest';
import { OrganisationResponseShort } from '../../../../packages/types/organisation/organisationResponses';
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  create(@Body() createOrganisationDto: CreateOrganisationDto) {
    return this.organisationsService.create(createOrganisationDto);
  }

  @Get()
  async findAllShort(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([SortingEnum.NAME, SortingEnum.COUNTY, SortingEnum.POINTS])
    sorting?: SortingRequest,
    @Query() filter?: OrganisationQuery,
  ) {
    const items = await this.organisationsService.findAllShort(
      paginationParam,
      sorting,
      filter,
    );

    const mapped = items.map((org) => {
      return {
        id: org.id,
        name: org.name,
        location: org.location,
        websiteUrl: org.websiteUrl,
        mainImage: org.mainImage,
        exponatCount: org.Exponat.length,
        points: org.Exponat.reduce(
          (acc, curr) => acc + curr._count.FavouriteExponat,
          0,
        ),
        //possibly already make this in sql later
        isFavorite: false,
        updatedAt: org.updatedAt,
      } as OrganisationResponseShort;
    });

    return {
      data: mapped,
      pagination: {
        page: paginationParam?.page,
        pageSize: paginationParam?.size,
        totalItems: items.count,
        totalPages: Math.ceil(
          (await this.organisationsService.count(filter)) /

  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organisationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganisationDto: UpdateOrganisationDto,
  ) {
    return this.organisationsService.update(+id, updateOrganisationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organisationsService.remove(+id);
  }
}
