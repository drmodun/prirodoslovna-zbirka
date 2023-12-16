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
} from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';
import { CreateSocialPostDto } from './dto/create-social-post.dto';
import { UpdateSocialPostDto } from './dto/update-social-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ShortSocialPostResponse } from '@biosfera/types';

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
  findAll() {
    return this.socialPostsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.socialPostsService.findOne(+id);
  }

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
}
