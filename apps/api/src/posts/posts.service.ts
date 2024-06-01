import { Injectable } from '@nestjs/common';
import { CreatePostDto, PostQuery, PostSQL, UpdatePostDto } from './posts.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  getEnumValue,
  NotificationPromise,
  NotificationType,
  sortQueryBuilder,
} from '@biosfera/types';
import {
  anonymousPostsDiscover,
  personalizedPostsDiscover,
} from './rawQueries';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';
import { Post } from '@prisma/client';
import { env } from 'process';
import { NotificationsService } from 'src/notifications/notifications.service';
import { FollowsService } from 'src/follows/follows.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
    private readonly notificationUsersService: NotificationUsersService,
    private readonly followsService: FollowsService,
  ) {}

  async discover(page: number, size: number, userId?: string) {
    const posts = userId
      ? await personalizedPostsDiscover(page, size, userId, this.prisma)
      : await anonymousPostsDiscover(page, size, this.prisma);
    return posts as PostSQL[];
  }

  async findAllWithoutApproval(organiastionId: string) {
    return await this.prisma.post.findMany({
      where: {
        isApproved: false,
        Exponat: {
          organisationId: organiastionId,
        },
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            hasProfileImage: true,
            username: true,
          },
        },
        Exponat: {
          select: {
            name: true,
            organisationId: true,
          },
        },
        _count: {
          select: {
            Likes: true,
          },
        },
      },
    });
  }

  async findAll(filter: PostQuery) {
    const sort = sortQueryBuilder({
      attribute: filter.attribute,
      direction: filter.direction,
    });

    const exponatIds = await this.prisma.exponat.findMany({
      where: {
        organisationId: filter.organisationId,
      },
      select: {
        id: true,
      },
    });

    const posts = this.prisma.post.findMany({
      where: {
        ...(!filter.isAdmin && { isApproved: true }),
        ...(filter?.title && {
          title: {
            search: filter.title.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.userId && { authorId: filter.userId }),
        ...(filter?.organisationId && {
          exponatId: {
            in: exponatIds.map((exponat) => exponat.id),
          },
        }),
        ...(filter?.exponatId && { ExponatId: filter.exponatId }),
        ...(filter?.userName && { author: { firstName: filter.userName } }),
        ...(filter?.exponatName && {
          Exponat: { name: filter.exponatName },
        }),
      },
      orderBy: {
        ...(sort
          ? sort
          : filter.title
          ? {
              _relevance: {
                fields: ['title'],
                search: filter.title.split(' ').join(' <-> '),
                sort: 'desc',
              },
            }
          : null),
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            hasProfileImage: true,
          },
        },
        AuthorshipInfo: true,
        Exponat: {
          select: {
            name: true,
            organisationId: true,
          },
        },
        _count: {
          select: {
            Likes: true,
          },
        },
      },
      skip: (filter?.page - 1) * filter?.size,
      take: filter?.size,
    });

    return posts;
  }

  async create(createPostDto: CreatePostDto) {
    return await this.prisma.post.create({
      data: createPostDto,
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    return await this.prisma.post.update({
      where: {
        id,
      },
      data: updatePostDto,
    });
  }

  async checkValidity(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    return post.authorId === userId;
  }

  async remove(id: string) {
    return await this.prisma.post.delete({
      where: {
        id,
      },
    });
  }

  async findOne(id: string, approval?: boolean) {
    return await this.prisma.post.findFirstOrThrow({
      where: {
        id,
        ...(approval && { isApproved: approval }),
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        AuthorshipInfo: true,
        Exponat: {
          select: {
            name: true,
            organisationId: true,
          },
        },
        _count: {
          select: {
            Likes: true,
          },
        },
      },
    });
  }

  async makeApprovalNotification(
    post: Post,
    userId: string,
  ): NotificationPromise {
    const notificationText = post.isApproved
      ? `Vaša objava ${post.title} je odobrena`
      : `Vaša objava ${post.title} je odbijena`;

    const makeNotification = await this.notificationService.create(
      {
        text: notificationText,
        type: getEnumValue(NotificationType, NotificationType.POST_APPROVAL),
        link: `${env.WEB_URL ?? 'localhost:3000'}/post/${post.id}`,
        title: 'Obavijest o objavi',
        notificationImage: post.thumbnailImage,
      },
      [userId],
    );

    await this.notificationUsersService.publishNotification(
      userId,
      makeNotification,
    );

    return makeNotification;
  }

  makeNewPostNotification = async (
    posterId: string,
    post: Post,
    followerIds: string[],
  ): NotificationPromise => {
    const splitText = post.text.split(' ');
    const notification = await this.notificationService.create(
      {
        text:
          splitText.length > 20
            ? `${splitText.slice(0, 20).join(' ')}...`
            : post.text,
        type: getEnumValue(
          NotificationType,
          NotificationType.POST_BY_FOLLOWED_ACCOUNT,
        ),
        notificationImage: post.thumbnailImage,
        link: `${env.WEB_URL ?? 'localhost:3000'}/posts/${post.id}`,
        title: `Nova objava od korisnika ${posterId}: ${post.title}`,
      },
      followerIds,
    );

    await this.prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        IsNotificationMade: true,
      },
    });

    return notification;
  };

  async toggleApproval(id: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    await this.makeApprovalNotification(
      { ...post, isApproved: !post.isApproved },
      post.author.id,
    );

    if (!post.isApproved && !post.IsNotificationMade) {
      const users = await this.followsService.getFollowers(post.author.id);

      const notification = await this.makeNewPostNotification(
        post.author.username,
        post,
        users.map((user) => user.followerId),
      );

      await this.notificationUsersService.publishManyNotifications(
        users.map((user) => user.followerId),
        notification,
      );
    }

    return await this.prisma.post.update({
      where: {
        id,
      },
      data: {
        isApproved: !post.isApproved,
      },
    });
  }
}
