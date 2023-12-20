import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';
import {
  CreateSocialPostDto,
  SocialPostQuery,
  UpdateSocialPostDto,
} from './dto/socialPost.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  PaginationRequest,
  ShortSocialPostResponse,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
import { PaginationParams } from 'src/config/pagination';
import { SortingParams } from 'src/config/sorting';

@ApiTags('social-posts')
@Controller('social-posts')
export class SocialPostsController {
  constructor(private readonly socialPostsService: SocialPostsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organizationId')
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createSocialPostDto: CreateSocialPostDto,
    @Req() req: any,
  ) {
    const socialPost = await this.socialPostsService.create(
      createSocialPostDto,
      organizationId,
      req.user.id,
    );

    const mapped: ShortSocialPostResponse = {
      createdAt: socialPost.createdAt,
      id: socialPost.id,
      images: socialPost.images,
      organisationId: organizationId,
      text: socialPost.text,
      organisationMainImage: socialPost.organisation.mainImage,
      organisationName: socialPost.organisation.name,
      title: socialPost.title,
      updatedAt: socialPost.updatedAt,
    };

    return mapped;
  }

  @Get()
  async findAll(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([SortingEnum.TITLE, SortingEnum.ORGANISATION])
    sorting?: SortingRequest,
    @Query() filter?: SocialPostQuery,
  ) {
    const posts = await this.socialPostsService.findAll(
      filter,
      sorting,
      paginationParam,
    );

    const mapped = posts.map((post) => {
      return {
        createdAt: post.createdAt,
        id: post.id,
        images: post.images,
        organisationId: post.authorId,
        text: post.text,
        organisationMainImage: post.organisation.mainImage,
        organisationName: post.organisation.name,
        title: post.title,
        updatedAt: post.updatedAt,
        isApproved: post.isApproved,
      };
    });
    return mapped;
  }

  @Get('approved')
  async findAllApproved(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([SortingEnum.TITLE, SortingEnum.ORGANISATION])
    sorting?: SortingRequest,
    @Query() filter?: SocialPostQuery,
  ) {
    const posts = await this.socialPostsService.findAll(
      filter,
      sorting,
      paginationParam,
    );

    const approved = posts.filter((post) => post.isApproved);

    const mapped = approved.map((post) => {
      return {
        createdAt: post.createdAt,
        id: post.id,
        images: post.images,
        organisationId: post.authorId,
        text: post.text,
        organisationMainImage: post.organisation.mainImage,
        organisationName: post.organisation.name,
        title: post.title,
        updatedAt: post.updatedAt,
      };
    });
    return mapped;
  }

  //TODO: Not sure if findOne is needed, also not sure if any extended responses are needed

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':organizationId/:id')
  async update(
    @Param('organizationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateSocialPostDto: UpdateSocialPostDto,
    @Req() req: any,
  ) {
    const socialPost = await this.socialPostsService.update(
      updateSocialPostDto,
      id,
      req.user.id,
      organisationId,
    );

    return socialPost !== null;
  }

  @Delete(':organizationId/:id')
  async remove(
    @Param('organizationId') organisationId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const socialPost = await this.socialPostsService.remove(
      id,
      req.user.id,
      organisationId,
    );

    return socialPost !== null;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':organizationId/:id/approval')
  async changeApprovalStatus(
    @Param('organizationId') organisationId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const socialPost = await this.socialPostsService.changeApprovalStatus(
      id,
      req.user.id,
      organisationId,
    );

    return socialPost !== null;
  }
}
