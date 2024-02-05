import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth-guard';

@ApiTags('exponats')
@Controller('exponats')
export class ExponatsController {
  constructor(private readonly exponatsService: ExponatsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([
      SortingEnum.NAME,
      SortingEnum.CREATED_AT,
      SortingEnum.POST_AMOUNT,
      SortingEnum.FAVOURITES,
      SortingEnum.ALTERNATE_NAME,
    ])
    sorting?: SortingRequest,
    @Query() filter?: ExponatQuery,
    @Req() req?: any,
  ) {
    const isAdmin = req.user?.role === 'super';

    const items = await this.exponatsService.findAll(
      filter,
      sorting,
      paginationParam,
      !isAdmin,
    );

    const mapped = items.map((item) => {
      return {
        id: item.id,
        name: item.name,
        mainImage: item.mainImage,
        updatedAt: item.updatedAt,
        favouriteCount: item._count.FavouriteExponats,
        postCount: item._count.Posts,
        alternateName: item.alternateName,
        ...(isAdmin && { isApproved: item.isApproved }),
        description: item.description,
        organizationId: item.organisationId,
        organizationName: item.Organisation.name,
        isApproved: item.isApproved,
        exponatKind: item.ExponatKind,
      } as ExponatResponseShort;
    });

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organisationId')
  async create(
    @Param('organisationId') organisationId: string,
    @Body() createOrganisationDto: CreateExponatDto,
    @Req() req: any,
  ) {
    createOrganisationDto.authorId = organisationId;
    const item = await this.exponatsService.create(
      createOrganisationDto,
      req.user.id,
    );

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
      exponatKind: item.ExponatKind,
    } as ExponatResponseShort;

    return mapped;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req?: any) {
    const isAdmin =
      req.user && (await this.exponatsService.checkUserRole(req?.user?.id, id));
    const item = await this.exponatsService.findOne(id, !isAdmin);

    const posts: PostResponse[] = !item.Posts
      ? []
      : item.Posts?.map((post) => {
          return {
            authorId: post.authorId,
            authorName: post.author.firstName + ' ' + post.author.lastName,
            exponatId: item.id,
            exponatName: item.name,
            ...(isAdmin && { isApproved: post.isApproved }),
            id: post.id,
            images: post.images,
            hasProfilePicture: post.author.hasProfileImage,
            updatedAt: post.updatedAt,
            likeScore: post._count.Likes,
            title: post.title,
          } as PostResponse;
        });

    const mapped = {
      alternateName: item.alternateName,
      id: item.id,
      title: item.name,
      ...(isAdmin && { isApproved: item.isApproved }),
      attributes: item.attributes,
      categorization: {
        class: item.Categorization.class,
        domain: item.Categorization.domain,
        family: item.Categorization.family,
        genus: item.Categorization.genus,
        kingdom: item.Categorization.kingdom,
        order: item.Categorization.order,
        phylum: item.Categorization.phylum,
        species: item.Categorization.species,
        id: item.Categorization.id,
      },
      createdAt: item.createdAt,
      description: item.description,
      favouriteCount: item._count.FavouriteExponats,
      funFacts: item.funFacts,
      mainImage: item.mainImage,
      organizationId: item.organisationId,
      organizationName: item.Organisation.name,
      updatedAt: item.updatedAt,
      posts: posts,
    } as ExponatExtendedResponse;

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExponatDto: UpdateExponatDto,
    @Req() req: any,
  ) {
    return await this.exponatsService.update(
      id,
      updateExponatDto,
      req.user?.id,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.exponatsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/approval')
  async changeApprovalStatus(@Param('id') id: string, @Req() req: any) {
    return await this.exponatsService.changeApprovalStatus(id, req.user.id);
  }
}
