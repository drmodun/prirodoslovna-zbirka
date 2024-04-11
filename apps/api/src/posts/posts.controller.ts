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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { ExponatsService } from 'src/exponats/exponats.service';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth-guard';
import { PaginationParams } from 'src/config/pagination';
import {
  PaginationRequest,
  PostResponse,
  PostResponseExtended,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
import { SortingParams } from 'src/config/sorting';
@ApiTags('posts')
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
    createPostDto.ExponatId = exponatId;

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
    @Req() req?: any,
  ) {
    filter.attribute = sorting?.attribute;
    filter.direction = sorting?.direction;

    filter.page = paginationParam?.page;
    filter.size = paginationParam?.size;

    if (req.user?.role === 'super') filter.isAdmin = true;

    const posts = await this.postsService.findAll(filter);

    const mapped: PostResponse[] = posts.map((post) => {
      return {
        authorId: post.authorId,
        authorName: post.author.username,
        exponatId: post.ExponatId,
        exponatName: post.Exponat.name,
        id: post.id,
        thumbnail: post.thumbnailImage,
        likeScore: post._count.Likes,
        title: post.title,
        updatedAt: post.updatedAt,
        organisationId: post.Exponat.organisationId,
      } as PostResponse;
    });

    return mapped;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @Get('discover')
  async discover(
    @PaginationParams() paginationParam?: PaginationRequest,
    @Req() req?: any,
  ) {
    const items = await this.postsService.discover(
      paginationParam.page,
      paginationParam.size,
      req?.user?.id,
    );

    const mapped = items.map((post) => {
      return {
        authorId: post.authorId,
        authorName: post.authorName,
        exponatId: post.ExponatId,
        exponatName: post.exponatName,
        id: post.id,
        thumbnail: post.thumbnailImage,
        likeScore: post.amountOfLikes,
        title: post.title,
        organisationId: post.organisationId,
        updatedAt: post.updatedAt,
        hasProfilePicture: post.hasProfileImage,
      } as PostResponse;
    });
    return mapped;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req?: any) {
    const check =
      req.user && (await this.membersService.hasAdminRights(req.user?.id, id));

    const post = await this.postsService.findOne(id, !check);

    return {
      authorId: post.authorId,
      authorName: post.author.username,
      exponatId: post.ExponatId,
      exponatName: post.Exponat.name,
      id: post.id,
      likeScore: post._count.Likes,
      title: post.title,
      authorFullName: post.author.firstName + ' ' + post.author.lastName,
      content: post.text,
      image: post.image,
      updatedAt: post.updatedAt,
      organisationId: post.Exponat.organisationId,
      thumbnail: post.thumbnailImage,
    } as PostResponseExtended;
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
        "You cannot update this post because it is not yours and you don't have admin rights",
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
        "You cannot delete this post because it is not yours and you don't have admin rights",
      );

    return this.postsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/approval')
  async toggleApproval(@Param('id') id: string, @Req() req: any) {
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
        "You cannot approve or disapprove this post because it is not yours and you don't have admin rights",
      );

    return await this.postsService.toggleApproval(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get('/:organisationId')
  async findAllByOrganisation(
    @Param('organisationId') organisationId: string,
    @Req() req?: any,
  ) {
    const adminCheck = await this.membersService.hasAdminRights(
      req.user.id,
      organisationId,
    );

    const posts = await this.postsService.findAll({
      organisationId,
      isAdmin: adminCheck,
    });

    const mapped: PostResponse[] = posts.map((post) => {
      return {
        authorId: post.authorId,
        authorName: post.author.username,
        exponatId: post.ExponatId,
        exponatName: post.Exponat.name,
        organisationId: post.Exponat.organisationId,
        updatedAt: post.updatedAt,
        id: post.id,
        thumbnail: post.thumbnailImage,
        likeScore: post._count.Likes,
        title: post.title,
      } as PostResponse;
    });

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':organisationId/hidden')
  async findAllNotApproved(
    @Param('organisationId') organisationId: string,
    @Req() req: any,
  ) {
    const adminCheck = await this.membersService.hasAdminRights(
      req.user.id,
      organisationId,
    );

    if (!adminCheck && !(req.user.role === 'super'))
      throw new UnauthorizedException(
        "You cannot see unapproved posts because you don't have admin rights",
      );

    const posts = await this.postsService.findAllWithoutApproval(
      organisationId,
    );

    const mapped: PostResponse[] = posts.map((post) => {
      return {
        authorId: post.authorId,
        authorName: post.author.username,
        exponatId: post.ExponatId,
        exponatName: post.Exponat.name,
        id: post.id,
        thumbnail: post.thumbnailImage,
        likeScore: post._count.Likes,
        organisationId: post.Exponat.organisationId,
        title: post.title,
        hasProfilePicture: post.author.hasProfileImage,
        isApproved: post.isApproved,
        updatedAt: post.updatedAt,
      } as PostResponse;
    });

    return mapped;
  }
}
