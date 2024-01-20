import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  Req,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, PostQuery, UpdatePostDto } from './posts.dto';
import { MembersService } from 'src/members/members.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { ExponatsService } from 'src/exponats/exponats.service';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth-guard';
import { PaginationParams } from 'src/config/pagination';
import {
  PaginationRequest,
  PostResponse,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
import { SortingParams } from 'src/config/sorting';
import { CategorizationQuery } from 'src/categorizations/dto/categorizations.dto';
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly membersService: MembersService,
    private readonly organisationsService: OrganisationsService,
    private readonly exponatsService: ExponatsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':exponatId')
  async create(
    @Body() createPostDto: CreatePostDto,
    @Param('exponatId') exponatId: string,
    @Req() req: any,
  ) {
    const organisationId =
      await this.organisationsService.findOrganisationByExponatId(exponatId);

    if (!organisationId) throw new BadRequestException("Exponat doesn't exist");

    const check = await this.membersService.checkForMember(
      req.user.id,
      organisationId,
    );

    if (!check) throw new UnauthorizedException('User is not a member');

    createPostDto.authorId = req.user.id;
    createPostDto.exponatId = exponatId;

    return this.postsService.create(createPostDto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([SortingEnum.TITLE, SortingEnum.CREATED_AT])
    sorting?: SortingRequest,
    @Query() filter?: PostQuery,
  ) {
    filter.attribute = sorting.attribute;
    filter.direction = sorting.direction;

    filter.page = paginationParam.page;
    filter.size = paginationParam.size;

    const posts = await this.postsService.findAll(filter);

    const mapped: PostResponse[] = posts.map((post) => {
      return {
        authorId: post.authorId,
        authorName: post.author.firstName + ' ' + post.author.lastName,
        exponatId: post.ExponatId,
        exponatName: post.Exponat.name,
        id: post.id,
        images: post.images,
        likeScore: post._count.Likes,
        title: post.title,
      } as PostResponse;
    });

    return mapped;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);

    return {
      authorId: post.authorId,
      authorName: post.author.firstName + ' ' + post.author.lastName,
      exponatId: post.ExponatId,
      exponatName: post.Exponat.name,
      id: post.id,
      images: post.images,
      likeScore: post._count.Likes,
      title: post.title,
    } as PostResponse;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
  ) {
    const exponat = await this.exponatsService.findExponatByPostId(id);
    const organisationId =
      await this.organisationsService.findOrganisationByExponatId(exponat);
    const check = await this.postsService.checkValidity(id, req.user.id);
    const admin = await this.membersService.hasAdminRights(
      req.user.id,
      organisationId,
    );

    if (!check && !admin && !(req.user.role === 'super'))
      throw new UnauthorizedException(
        "You cannor delete this pos because it is not yours and you don't have admin rights",
      );

    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const exponat = await this.exponatsService.findExponatByPostId(id);
    const organisationId =
      await this.organisationsService.findOrganisationByExponatId(exponat);
    const check = await this.postsService.checkValidity(id, req.user.id);
    const admin = await this.membersService.hasAdminRights(
      req.user.id,
      organisationId,
    );

    if (!check && !admin && !(req.user.role === 'super'))
      throw new UnauthorizedException(
        "You cannor delete this pos because it is not yours and you don't have admin rights",
      );

    return this.postsService.remove(id);
  }
}
