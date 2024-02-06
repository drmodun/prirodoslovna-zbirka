import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, postId: string) {
    return this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  }

  async delete(userId: string, postId: string) {
    return this.prisma.like.delete({
      where: {
        postId_userId: {
          userId,
          postId,
        },
      },
    });
  }

  async isLiked(userId: string, postId: string) {
    const likes = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          userId,
          postId,
        },
      },
    });

    return likes != null;
  }

  async toggleLike(userId: string, postId: string) {
    const isLiked = await this.isLiked(userId, postId);
    return isLiked
      ? await this.delete(userId, postId)
      : await this.create(userId, postId);
  }
}
