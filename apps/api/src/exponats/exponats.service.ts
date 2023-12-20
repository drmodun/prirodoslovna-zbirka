import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateExponatDto, UpdateExponatDto } from './dto/exponats.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ExponatQuery,
  PaginationRequest,
  SortingRequest,
  sortExponatQueryBuilderWithComplexFilters,
} from '@biosfera/types';
import { Role } from '@prisma/client';

@Injectable()
export class ExponatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExponatDto: CreateExponatDto, userId: string) {
    const check = await this.checkForValidity(
      userId,
      createExponatDto.authorId,
    );

    if (!check) throw new UnauthorizedException();

    return await this.prisma.exponat.create({
      data: createExponatDto,
      include: {
        Organisation: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }

  async findAll(
    filter?: ExponatQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
    approval?: boolean,
  ) {
    const sort = sorting && sortExponatQueryBuilderWithComplexFilters(sorting);
    return await this.prisma.exponat.findMany({
      where: {
        ...(filter?.name && {
          name: { search: filter.name, mode: 'insensitive' },
        }),
        ...(filter?.alternateName && {
          alternateName: { search: filter.alternateName, mode: 'insensitive' },
        }),
        ...(filter?.organisationId && {
          organisationId: filter.organisationId,
        }),

        ...(filter.minFavoriteCount && {
          _count: {
            FavouriteExponat: {
              gte: filter.minFavoriteCount,
            },
          },
        }),
        ...(filter.maxFavoriteCount && {
          _count: {
            FavouriteExponat: {
              lte: filter.maxFavoriteCount,
            },
          },
        }),
        ...(filter.createdAt && {
          createdAt: {
            gte: filter.createdAt,
          },
        }),
        ...(approval && {
          isApproved: approval,
        }),
      },
      include: {
        _count: {
          select: {
            FavouriteExponat: true,
            Posts: true,
          },
        },
        Categorization: {
          select: {
            genus: true,
            family: true,
          },
        },
        Organisation: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      ...(sort && { orderBy: sort }),
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
    });
  }

  async findOne(id: string, approval?: boolean) {
    return await this.prisma.exponat.findUnique({
      where: {
        id,
        ...(approval && { isApproved: approval }),
      },
      include: {
        _count: {
          select: {
            FavouriteExponat: true,
            Posts: true,
          },
        },
        Categorization: true,
        Organisation: {
          select: {
            name: true,
            location: true,
            id: true,
          },
        },
        Posts: {
          where: {
            ...(approval && { isApproved: approval }),
          },
          include: {
            _count: {
              select: {
                Likes: true,
              },
            },
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, request: UpdateExponatDto) {
    await this.prisma.exponat.update({
      where: {
        id,
      },
      data: request,
    });
  }

  async remove(id: string) {
    await this.prisma.exponat.delete({
      where: {
        id,
      },
    });
  }

  async changeApprovalStatus(id: string, userId: string) {
    const exponat = await this.prisma.exponat.findFirst({
      where: {
        id,
      },
    });

    if (!exponat) return false;

    const check = await this.checkForValidity(
      userId,
      exponat.organisationId,
      true,
    );
    if (!check) return false;
    const current = await this.prisma.exponat.findFirst({
      where: {
        id,
      },
    });
    await this.prisma.exponat.update({
      where: {
        id,
      },
      data: {
        isApproved: !current.isApproved,
      },
    });
  }

  private async checkForValidity(
    userId: string,
    organisationId: string,
    adminOnly: boolean = false,
  ) {
    const connection = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId,
      },
    });

    if (!connection) {
      const checkForSuper = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (checkForSuper.role !== Role.SUPER) return false;
      return true;
    }
    if (adminOnly && connection.role !== Role.ADMIN) return false;
    return true;
  }
}
