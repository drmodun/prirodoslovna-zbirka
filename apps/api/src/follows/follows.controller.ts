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
        username: user.follower.username,
        followerCount: user.follower._count.followers,
        postCount: user.follower._count.Posts,
        id: user.followerId,
      } as ShortUserResponse;
    });

    return mapped;
  }

  @ApiBearerAuth()
  @Get(':userId/following')
  async getFollowing(@Param('userId') userId: string) {
    const following = await this.followsService.getFollowing(userId);

    const mapped: ShortUserResponse[] = following.map((user) => {
      return {
        email: user.followee.email,
        username: user.followee.username,
        firstName: user.followee.firstName,
        lastName: user.followee.lastName,
        location: user.followee.location,
        followerCount: user.followee._count.followers,
        postCount: user.followee._count.Posts,
        id: user.followeeId,
      } as ShortUserResponse;
    });

    return mapped;
  }
}
