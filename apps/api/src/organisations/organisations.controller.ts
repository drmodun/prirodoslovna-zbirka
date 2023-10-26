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
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  create(@Body() createOrganisationDto: CreateOrganisationDto) {
    return this.organisationsService.create(createOrganisationDto);
  }

  @Get()
  async findAll(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([SortingEnum.NAME, SortingEnum.COUNTY, SortingEnum.POINTS])
    sorting?: SortingRequest,
    @Query() filter?: OrganisationQuery,
  ) {
    return this.organisationsService.findAll();
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
