import { Injectable } from '@nestjs/common';
import { CreateSocialPostDto } from './dto/create-social-post.dto';
import { UpdateSocialPostDto } from './dto/update-social-post.dto';

@Injectable()
export class SocialPostsService {
  create(createSocialPostDto: CreateSocialPostDto) {
    return 'This action adds a new socialPost';
  }

  findAll() {
    return `This action returns all socialPosts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} socialPost`;
  }

  update(id: number, updateSocialPostDto: UpdateSocialPostDto) {
    return `This action updates a #${id} socialPost`;
  }

  remove(id: number) {
    return `This action removes a #${id} socialPost`;
  }
}
