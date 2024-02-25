import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateCategorizationDto,
  UpdateCategorizationDto,
  CategorizationQuery,
} from './dto/categorizations.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginationRequest,
  SortingRequest,
  sortCategorizationQueryBuilderWithComplexFilters,
} from '@biosfera/types';
@Injectable()
export class CategorizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategorizationDto: CreateCategorizationDto) {
    return await this.prisma.categorization.create({
      data: createCategorizationDto,
    });
  }

  async findByName(name: string) {
    const item = await this.prisma.categorization.findFirst({
      where: {
        species: {
          search: name.split(' ').join(' | '),
          mode: 'insensitive',
        },
      },
    });

    if (!item) {
      throw new NotFoundException();
    }

    return item;
  }

  async findAll(
    filter?: CategorizationQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
  ) {
    const sort =
      sorting && sortCategorizationQueryBuilderWithComplexFilters(sorting);
    return await this.prisma.categorization.findMany({
      where: {
        ...(filter?.genus && {
          genus: {
            search: filter.genus.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.phylum && {
          phylum: {
            search: filter.phylum.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.order && {
          order: {
            search: filter.order.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.domain && {
          domain: {
            search: filter.domain.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.family && {
          family: {
            search: filter.family.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.kingdom && {
          kingdom: {
            search: filter.kingdom.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
      },
      include: {
        _count: {
          select: {
            Exponat: true,
          },
        },
      },
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
      ...(sort && { orderBy: sort }),
    });
  }
  async findOne(id: string) {
    return await this.prisma.categorization.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            Exponat: true,
          },
        },
        Exponat: {
          include: {
            _count: {
              select: {
                Posts: true,
                FavouriteExponats: true,
              },
            },
            Organisation: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            Posts: {
              _count: 'desc',
            },
          },
        },
      },
    });
  }

  async update(id: string, request: UpdateCategorizationDto) {
    await this.prisma.categorization.update({
      where: {
        id,
      },
      data: request,
    });
  }

  async remove(id: string) {
    await this.prisma.categorization.delete({
      where: {
        id,
      },
    });
  }
}
