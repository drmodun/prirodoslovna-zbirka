import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(followerId: string, followeeId: string) {
    return this.prisma.userFollows.create({
      data: {
        followerId,
        followeeId,
      },
    });
  }

  async delete(followerId: string, followeeId: string) {
    return this.prisma.userFollows.delete({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });
  }

  async isFollowing(followerId: string, followeeId: string) {
    const follows = await this.prisma.userFollows.findUnique({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    return follows != null;
  }

  async toggleFollow(followerId: string, followeeId: string) {
    const isFollowing = this.isFollowing(followerId, followeeId);
    return isFollowing
      ? await this.delete(followerId, followeeId)
      : await this.create(followerId, followeeId);
  }

  async getFollowers(userId: string) {
    return this.prisma.userFollows.findMany({
      where: {
        followeeId: userId,
      },
      include: {
        follower: {
          include: {
            _count: {
              select: { Posts: true, followers: true, following: true },
            },
          },
        },
      },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.userFollows.findMany({
      where: {
        followerId: userId,
      },
      include: {
        followee: {
          include: {
            _count: {
              select: { Posts: true, followers: true, following: true },
            },
          },
        },
      },
    });
  }
}
