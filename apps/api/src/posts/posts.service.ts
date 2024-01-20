import { Injectable } from '@nestjs/common';
import { CreatePostRequest, PostQuery, UpdatePostRequest } from './posts.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembersService } from 'src/members/members.service';
import { sortQueryBuilder } from '@biosfera/types';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: PostQuery) {
    const sort = sortQueryBuilder({
      attribute: filter.attribute,
      direction: filter.direction,
    });

    const posts = this.prisma.post.findMany({
      where: {
        ...(!filter.isAdmin && { isApproved: true }),
        ...(filter?.title && {
          name: {
            search: filter.title.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.userId && { authorId: filter.userId }),
        ...(filter?.organisationId && {
          organisationId: filter.organisationId,
        }),
        ...(filter?.exponatId && { exponatId: filter.exponatId }),
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
          },
        },
        Exponat: {
          select: {
            name: true,
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

  async create(createPostDto: CreatePostRequest) {
    return await this.prisma.post.create({
      data: createPostDto,
    });
  }

  async update(id: string, updatePostDto: UpdatePostRequest) {
    return await this.prisma.post.update({
      where: {
        id,
      },
      data: updatePostDto,
    });
  }

  async delete(id: string) {
    return await this.prisma.post.delete({
      where: {
        id,
      },
    });
  }

  async findOne(id: string, approval?: boolean) {
    return await this.prisma.post.findUnique({
      where: {
        id,
        ...(approval && { isApproved: approval }),
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Exponat: {
          select: {
            name: true,
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
