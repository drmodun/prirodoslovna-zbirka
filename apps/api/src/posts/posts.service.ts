import { Injectable } from '@nestjs/common';
import { CreatePostDto, PostQuery, PostSQL, UpdatePostDto } from './posts.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { sortQueryBuilder } from '@biosfera/types';
import {
  anonymousPostsDiscover,
  personalizedPostsDiscover,
} from './rawQueries';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async toggleApproval(id: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

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
