import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavouriteOrganisationsService {
  constructor(private readonly prisma: PrismaService) {}

  async exists(userId: string, organisationId: string) {
    const connection = await this.prisma.userOrganisationFollower.findFirst({
      where: {
        userId,
        organisationId,
      },
    });

    return connection;
  }

  async create(userId: string, organisationId: string) {
    const connection = await this.prisma.userOrganisationFollower.create({
      data: {
        userId,
        organisationId,
      },
    });

    return connection;
  }

  async delete(userId: string, organisationId: string) {
    const deletion = await this.prisma.userOrganisationFollower.delete({
      where: {
        userId,
        organisationId,
      },
    });

    return deletion;
  }

  async findAllForUser(userId: string) {
    const organisations = await this.prisma.userOrganisationFollower.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },

      include: {
        organisation: {
          include: {
            Exponats: {
              select: {
                _count: {
                  select: {
                    FavouriteExponat: true,
                  },
                },
              },
            },
            _count: {
              select: {
                UserOrganisationFollowers: true,
                OrganisationUsers: true,
                Exponats: true,
              },
            },
          },
        },
      },
    });

    return organisations;
  }

  async findAllForOrganisation(organisationId: string) {
    const users = await this.prisma.userOrganisationFollower.findMany({
      where: {
        organisationId,
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
  async toggle(userId: string, organisationId: string) {
    const check = await this.exists(userId, organisationId);

    const action =
      check !== null
        ? await this.delete(userId, organisationId)
        : await this.create(userId, organisationId);

    return action;
  }
}
