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
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/config/pagination';
import {
  PaginationRequest,
  SortingEnum,
  SortingRequest,
} from '../../../../packages/types/query';
import { UserQuery } from '../../../../packages/types/user/userRequests';
import { SortingParams } from '../config/sorting';
import {
  ExtendedUserResponse,
  ShortUserResponse,
} from '../../../../packages/types/user/userResponses';
import { PostResponse } from '../../../../packages/types/post/postResponse';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() registerUserDto: RegisterUserDto) {
    return (await this.usersService.create(registerUserDto)) !== null;
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'sorting', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'organisation', required: false })
  async findAll(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([
      SortingEnum.NAME,
      SortingEnum.COUNTY,
      SortingEnum.POST_AMOUNT,
      SortingEnum.POINTS,
      SortingEnum.FOLLOWERS,
      SortingEnum.FOLLOWERS_ORGANISATION,
      SortingEnum.FOLLOWING,
    ])
    sorting?: SortingRequest,
    @Query() filter?: UserQuery,
  ) {
    const users = await this.usersService.findAll(
      filter,
      sorting,
      paginationParam,
    );

    const mapped: ShortUserResponse[] = users.map((user) => {
      return {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location,
        followerCount: user._count.followers,
        postCount: user._count.Posts,
        id: user.id,
      };
    });

    return mapped;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.usersService.findOne(id);

    const posts: PostResponse[] = item.Posts.map((post) => {
      return {
        authorAvatar: item.profileImage,
        authorId: item.id,
        authorName: item.firstName + ' ' + item.lastName,
        id: post.id,
        images: post.images,
        likeScore: post._count.Likes,
        title: post.title,
        exponatId: post.Exponat.id,
        exponatName: post.Exponat.name,
      };
    });

    const likedPosts: PostResponse[] = item.Likes.map((like) => {
      return {
        authorAvatar: like.Post.author.profileImage,
        authorId: like.Post.author.id,
        authorName:
          like.Post.author.firstName + ' ' + like.Post.author.lastName,
        id: like.Post.id,
        images: like.Post.images,
        likeScore: like.Post._count.Likes,
        title: like.Post.title,
        exponatId: like.Post.Exponat.id,
        exponatName: like.Post.Exponat.name,
      };
    });
    const mapped: ExtendedUserResponse = {
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      followerCount: item._count.followers,
      id: item.id,
      avatar: item.profileImage,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      posts: posts,
      location: item.location,
      likedPosts: likedPosts,
      followingCount: item._count.following,
    };

    return mapped;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return (await this.usersService.update(id, updateUserDto)) !== null;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return (await this.usersService.remove(id)) !== null;
  }
}
