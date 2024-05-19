import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SavedLiteratureService {
  constructor(private readonly prisma: PrismaService) {}

  async exists(userId: string, literatureId: string) {
    const connection = await this.prisma.savedLiterature.findFirst({
      where: {
        userId,
        literatureId,
      },
    });

    return connection;
  }

  async create(userId: string, literatureId: string) {
    const connection = await this.prisma.savedLiterature.create({
      data: {
        userId,
        literatureId,
      },
    });

    return connection;
  }

  async delete(userId: string, literatureId: string) {
    const deletion = await this.prisma.savedLiterature.delete({
      where: {
        literatureId_userId: {
          userId,
          literatureId,
        },
      },
    });

    return deletion;
  }

  async findAllForUser(userId: string) {
    const literature = await this.prisma.savedLiterature.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return literature;
  }

  async findAllForLiterature(literatureId: string) {
    const literature = await this.prisma.savedLiterature.findMany({
      where: {
        literatureId,
      },
      include: {
        user: {
          include: {
            _count: {
              select: {
                followers: true,
                Likes: true,
                Posts: true,
              },
            },
          },
        },
      },
    });

    return literature;
  }

  async toggle(userId: string, literatureId: string) {
    const check = await this.exists(userId, literatureId);

    const action =
      check !== null
        ? await this.delete(userId, literatureId)
        : await this.create(userId, literatureId);

    return action;
  }
}
