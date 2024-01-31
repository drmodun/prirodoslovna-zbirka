import { Injectable } from '@nestjs/common';
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
//TODO: Make error handling for non existing entities on search so it does not throw a 500 error when searcjing for related properties
@Injectable()
export class CategorizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategorizationDto: CreateCategorizationDto) {
    return await this.prisma.categorization.create({
      data: createCategorizationDto,
    });
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
            search: filter.genus.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.phylum && {
          phylum: {
            search: filter.phylum.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.order && {
          order: {
            search: filter.order.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.domain && {
          domain: {
            search: filter.domain.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.family && {
          family: {
            search: filter.family.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.kingdom && {
          kingdom: {
            search: filter.kingdom.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
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
      //TODO: Possibly add filtering based on nnumbers of exponats or something
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
      ...(sort && { orderBy: sort }),
    });
  }
  //TODO: Discuss wether to paginate related results or not
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
