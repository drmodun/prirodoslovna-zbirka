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
import {
  CreateOrganisationDto,
  UpdateOrganisationDto,
} from './dto/organisations.dto';
import { PaginationParams } from 'src/config/pagination';
import {
  PaginationRequest,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
import { SortingParams } from 'src/config/sorting';
import { OrganisationQuery } from '@biosfera/types';
import {
  ExtendedOrganisationResponse,
  OrganisationResponseShort,
} from '@biosfera/types';
import { ExponatResponseShort } from '@biosfera/types';
import { ShortSocialPostResponse } from '@biosfera/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { County } from '@prisma/client';
@Controller('organisations')
@ApiTags('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  //creates brand new organisation and returns the created organisation
  @Post()
  async create(@Body() createOrganisationDto: CreateOrganisationDto) {
    const item = await this.organisationsService.create(createOrganisationDto);

    const mapped = {
      id: item.id,
      name: item.name,
      mainImage: item.mainImage,
      location: item.location,
      websiteUrl: item.websiteUrl,
      updatedAt: item.updatedAt,
      exponatCount: 0,
      memberCount: 0,
      followerCount: 0,
      points: 0,
    } as OrganisationResponseShort;

    return mapped;
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'location', required: false, enum: County })
  @ApiQuery({ name: 'attribute', required: false, enum: SortingEnum })
  @ApiQuery({ name: 'direction', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({
    name: 'isApproved',
    required: false,
    enum: ['true', 'false'],
  })
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
        exponatCount: org.Exponats.length,
        points: org.Exponats.reduce(
          (acc, curr) => acc + curr._count.FavouriteExponat,
          0,
        ),
        //possibly already make this in sql later
        isFavorite: false,
        updatedAt: org.updatedAt,
        followerCount: org._count.UserOrganisationFollowers,
        memberCount: org._count.OrganisationUsers,
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
  async findOne(@Param('id') id: string) {
    const item = await this.organisationsService.findOne(id);

    const mappedExponats = item.Exponats.map((exponat) => {
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

    const mappedPosts = item.OrganisationPosts.map((post) => {
      return {
        createdAt: post.createdAt,
        id: post.id,
        images: post.images,
        text: post.text,
        updatedAt: post.updatedAt,
        organisationId: item.id,
        organisationName: item.name,
        organisationMainImage: item.mainImage,
        title: post.title,
        isApproved: post.isApproved,
      } as ShortSocialPostResponse;
    });

    const mapped = {
      createdAt: item.createdAt,
      description: item.description,
      email: item.email,
      exponats: mappedExponats,
      followersAmount: item._count.UserOrganisationFollowers,
      points: item.Exponats.reduce(
        (acc, curr) => acc + curr._count.FavouriteExponat,
        0,
      ),
      id: item.id,
      isFollowing: false,
      location: item.location,
      mainImage: item.mainImage,
      membersAmount: item._count.OrganisationUsers,
      name: item.name,
      otherImages: item.otherImages,
      updatedAt: item.updatedAt,
      websiteUrl: item.websiteUrl,
      posts: mappedPosts,
    } as ExtendedOrganisationResponse;

    return mapped;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganisationDto: UpdateOrganisationDto,
  ) {
    return await this.organisationsService.update(id, updateOrganisationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.organisationsService.remove(id);
  }

  //TODO: add admin approval and disapproval and creation request endpoints
}
