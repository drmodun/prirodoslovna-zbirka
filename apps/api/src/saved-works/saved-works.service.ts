import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SavedWorksService {
  constructor(private readonly prisma: PrismaService) {}

  async exists(userId: string, workId: string) {
    const connection = await this.prisma.savedWorks.findFirst({
      where: {
        userId,
        workId,
      },
    });

    return connection;
  }

  async create(userId: string, workId: string) {
    const connection = await this.prisma.savedWorks.create({
      data: {
        userId,
        workId,
      },
    });

    return connection;
  }

  async delete(userId: string, workId: string) {
    const deletion = await this.prisma.savedWorks.delete({
      where: {
        workId_userId: {
          userId,
          workId,
        },
      },
    });

    return deletion;
  }

  async findAllForUser(userId: string) {
    const works = await this.prisma.savedWorks.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        work: {
          include: {
            approver: {
              select: {
                username: true,
                id: true,
                hasProfileImage: true,
              },
            },

            author: {
              select: {
                username: true,
                id: true,
              },
            },

            organisation: {
              select: {
                name: true,
                id: true,
                mainImage: true,
              },
            },

            _count: {
              select: {
                SavedWorks: true,
              },
            },
          },
        },
      },
    });

    return works;
  }

  async findAllForwork(workId: string) {
    const users = await this.prisma.savedWorks.findMany({
      where: {
        workId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: {
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
  async toggle(userId: string, workId: string) {
    const check = await this.exists(userId, workId);

    const action =
      check !== null
        ? await this.delete(userId, workId)
        : await this.create(userId, workId);

    return action;
  }
}
