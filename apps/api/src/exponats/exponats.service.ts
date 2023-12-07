import { Injectable } from '@nestjs/common';
import { CreateExponatDto, UpdateExponatDto } from './dto/exponats.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ExponatQuery,
  PaginationRequest,
  SortingRequest,
  sortQueryBuilder,
} from '@biosfera/types';

@Injectable()
export class ExponatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExponatDto: CreateExponatDto) {
    return await this.prisma.exponat.create({
      data: createExponatDto,
    });
  }

  async findAll(
    filter?: ExponatQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
  ) {
    const sort = sorting && sortQueryBuilder(sorting);
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
        ...(filter?.authorId && {
          authorId: filter.authorId,
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

  async findOne(id: string) {
    return await this.prisma.exponat.findUnique({
      where: {
        id,
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
        Posts: true,
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
}
