import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ShortUserResponse } from '@biosfera/types';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':userId')
  async toggleFollow(@Req() req: any, @Param('userId') userId: string) {
    await this.followsService.toggleFollow(req.user?.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':userId/followers')
  async getFollowers(@Param('userId') userId: string) {
    const followers = await this.followsService.getFollowers(userId);

    const mapped: ShortUserResponse[] = followers.map((user) => {
      return {
        email: user.follower.email,
        firstName: user.follower.firstName,
        lastName: user.follower.lastName,
        location: user.follower.location,
        followerCount: user.follower._count.followers,
        postCount: user.follower._count.Posts,
        id: user.followerId,
      } as ShortUserResponse;
    });

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':userId/followers')
  async getFollowing(@Param('userId') userId: string) {
    const following = await this.followsService.getFollowing(userId);

    const mapped: ShortUserResponse[] = following.map((user) => {
      return {
        email: user.followee.email,
        firstName: user.followee.firstName,
        lastName: user.followee.lastName,
        location: user.followee.location,
        followerCount: user.followee._count.followers,
        postCount: user.followee._count.Posts,
        id: user.followerId,
      } as ShortUserResponse;
    });

    return mapped;
  }
}
