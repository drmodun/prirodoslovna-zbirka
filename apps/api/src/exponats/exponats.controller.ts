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
  ExponatExtendedResponse,
  ExponatResponseShort,
  PaginationRequest,
  PostResponse,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
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
  async findOne(@Param('id') id: string) {
    const item = await this.exponatsService.findOne(id);

    const posts: PostResponse[] = item.Posts.map((post) => {
      return {
        authorId: post.authorId,
        authorName: post.author.firstName + ' ' + post.author.lastName,
        exponatId: item.id,
        exponatName: item.name,
        id: post.id,
        images: post.images,
        likeScore: post._count.Likes,
        title: post.title,
      } as PostResponse;
    });

    const mapped = {
      alternateName: item.alternateName,
      id: item.id,
      title: item.name,
      attributes: item.attributes,
      categorization: {
        class: item.Categorization.class,
        domain: item.Categorization.domain,
        family: item.Categorization.family,
        genus: item.Categorization.genus,
        kingdom: item.Categorization.kingdom,
        order: item.Categorization.order,
        phylum: item.Categorization.phylum,
      },
      createdAt: item.createdAt,
      description: item.description,
      favouriteCount: item._count.FavouriteExponat,
      funFacts: item.funFacts,
      mainImage: item.mainImage,
      organizationId: item.organisationId,
      organizationName: item.Organisation.name,
      updatedAt: item.updatedAt,
      posts: posts,
    } as ExponatExtendedResponse;

    return mapped;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExponatDto: UpdateExponatDto,
  ) {
    return await this.exponatsService.update(id, updateExponatDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.exponatsService.remove(id);
  }
}
