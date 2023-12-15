import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavouriteExponatsService {
  constructor(private readonly prisma: PrismaService) {}

  async exists(userId: string, exponatId: string) {
    const connection = await this.prisma.favouriteExponat.findFirst({
      where: {
        userId,
        ExponatId: exponatId,
      },
    });

    return connection;
  }

  async create(userId: string, exponatId: string) {
    const connection = await this.prisma.favouriteExponat.create({
      data: {
        userId,
        ExponatId: exponatId,
      },
    });

    return connection;
  }

  async delete(userId: string, exponatId: string) {
    const deletion = await this.prisma.favouriteExponat.delete({
      where: {
        userId,
        ExponatId: exponatId,
      },
    });

    return deletion;
  }

  async findAllForUser(userId: string) {
    const exponats = await this.prisma.favouriteExponat.findMany({
      where: {
        userId,
      },
      include: {
        Exponat: {
          include: {
            Organisation: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                FavouriteExponat: true,
                Posts: true,
              },
            },
          },
        },
      },
    });

    return exponats;
  }

  async findAllForExponat(exponatId: string) {
    const users = await this.prisma.favouriteExponat.findMany({
      where: {
        ExponatId: exponatId,
      },
      include: {
        user: {
          select: {
            _count: {
              select: {
                followers: true,
                Posts: true,
              },
            },
          },
        },
      },
    });

    return users;
  }
  async toggle(userId: string, exponatId: string) {
    const check = await this.exists(userId, exponatId);

    const action =
      check !== null
        ? await this.delete(userId, exponatId)
        : await this.create(userId, exponatId);

    return action;
  }
}
