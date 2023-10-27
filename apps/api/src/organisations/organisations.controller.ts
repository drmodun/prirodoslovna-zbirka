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
} from '../../../../packages/types/organisation/organisationRequests';
import {
  ExtendedOrganisationResponse,
  OrganisationResponseShort,
} from '../../../../packages/types/organisation/organisationResponses';
import { ExponatResponseShort } from '../../../../packages/types/exponat/exponatResponses';
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  create(@Body() createOrganisationDto: CreateOrganisationDto) {
    return this.organisationsService.create(createOrganisationDto);
  }

  @Get('/short')
  async findAllShort(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([SortingEnum.NAME, SortingEnum.COUNTY, SortingEnum.POINTS])
    sorting?: SortingRequest,
    @Query() filter?: OrganisationQuery,
  ) {
    const items = await this.organisationsService.findAllShort(
      filter,
      sorting,
      paginationParam,
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
        followerCount: org._count.UserOrganisationFollower,
        memberCount: org._count.OrganisationUser,
      } as OrganisationResponseShort;
    });

    return {
      data: mapped,
      pagination: {
        page: paginationParam?.page,
        pageSize: paginationParam?.size,
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const item = await this.organisationsService.findOne(id);

    const mappedExponats = item.Exponat.map((exponat) => {
      return {
        alternateName: exponat.alternateName,
        description: exponat.description,
        id: exponat.id,
        mainImage: exponat.mainImage,
        name: exponat.name,
        updatedAt: exponat.updatedAt,
        favouriteCount: exponat._count.FavouriteExponat,
        organizationId: item.id,
        organizationName: item.name,
        isFavorite: false,
      } as ExponatResponseShort;
    });

    const mapped = {
      createdAt: item.createdAt,
      description: item.description,
      email: item.email,
      exponats: mappedExponats,
      followersAmount: item._count.UserOrganisationFollower,
      points: item.Exponat.reduce(
        (acc, curr) => acc + curr._count.FavouriteExponat,
        0,
      ),
      id: item.id,
      isFollowing: false,
      location: item.location,
      mainImage: item.mainImage,
      membersAmount: item._count.OrganisationUser,
      name: item.name,
      otherImages: item.otherImages,
      updatedAt: item.updatedAt,
      websiteUrl: item.websiteUrl,
    } as ExtendedOrganisationResponse;
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
