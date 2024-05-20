import { getEnumValue, NotificationType } from '@biosfera/types';
import { Injectable } from '@nestjs/common';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationUsersService: NotificationUsersService,
  ) {}

  async makeNewFollowerNotification(
    follower: { id: string; username: string },
    followeeId: string,
  ) {
    const notification = await this.notificationsService.create(
      {
        title: 'Novi pratitelj',
        link: `/profile/${follower.id}`,
        type: getEnumValue(NotificationType, NotificationType.NEW_FOLLOWER),
        notificationImage: follower.id,
        text: `Korisnik ${follower.username} te sada prati`,
      },
      [followeeId],
    );

    this.notificationUsersService.publishNotification(followeeId, notification);
  }

  async create(followerId: string, followeeId: string) {
    const follow = await this.prisma.userFollows.create({
      data: {
        followerId,
        followeeId,
      },
      include: {
        follower: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    await this.makeNewFollowerNotification(follow.follower, followeeId);
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
    const isFollowing = await this.isFollowing(followerId, followeeId);
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
