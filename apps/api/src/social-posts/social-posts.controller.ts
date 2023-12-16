import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SocialPostsService } from './social-posts.service';
import { CreateSocialPostDto } from './dto/create-social-post.dto';
import { UpdateSocialPostDto } from './dto/update-social-post.dto';

@Controller('social-posts')
export class SocialPostsController {
  constructor(private readonly socialPostsService: SocialPostsService) {}

  @Post()
  create(@Body() createSocialPostDto: CreateSocialPostDto) {
    return this.socialPostsService.create(createSocialPostDto);
  }

  @Get()
  findAll() {
    return this.socialPostsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.socialPostsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSocialPostDto: UpdateSocialPostDto) {
    return this.socialPostsService.update(+id, updateSocialPostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.socialPostsService.remove(+id);
  }
}
