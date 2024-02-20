import { Injectable } from '@nestjs/common';
import { CreatePostDto, PostQuery, UpdatePostDto } from './posts.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { sortQueryBuilder } from '@biosfera/types';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

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
            search: filter.title.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
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
      ...(sort && { orderBy: sort }),
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

  async findAllNotApproved(organisationId: string) {
    const exponatIds = await this.prisma.exponat.findMany({
      where: {
        organisationId: organisationId,
      },
      select: {
        id: true,
      },
    });

    const posts = this.prisma.post.findMany({
      where: {
        isApproved: false,
        ExponatId: {
          in: exponatIds.map((exponat) => exponat.id),
        },
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
    });

    return posts;
  }
}
