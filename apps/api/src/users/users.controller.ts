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
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto, UpdateUserDto } from './dto/users.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/config/pagination';
import {
  PaginationRequest,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
import { UserQuery } from '@biosfera/types';
import { SortingParams } from '../config/sorting';
import { ExtendedUserResponse, ShortUserResponse } from '@biosfera/types';
import { PostResponse } from '@biosfera/types';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { Role } from '@prisma/client';

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
    console.log('idhfidsf');
    try {
      const item = await this.usersService.findOne(id);

      const posts: PostResponse[] = item.Posts.map((post) => {
        return {
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
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        posts: posts,
        location: item.location,
        likedPosts: likedPosts,
        followingCount: item._count.following,
        hasProfileImage: item.hasProfileImage,
        likeCount: item.Posts.reduce((agg, curr) => agg + curr._count.Likes, 0),
      };

      return mapped;
    } catch (e) {
      console.log(e, 1);
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async adminUpdate(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new UnauthorizedException();
    }

    return (await this.usersService.update(id, updateUserDto)) !== null;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async adminDelete(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== Role.ADMIN) {
      throw new UnauthorizedException();
    }

    return (await this.usersService.remove(id)) !== null;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    return (
      (await this.usersService.update(req.user.id, updateUserDto)) !== null
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete()
  async remove(@Req() req: any) {
    return (await this.usersService.remove(req.user.id)) !== null;
  }
}
