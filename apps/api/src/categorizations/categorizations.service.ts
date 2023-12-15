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
  ž,
} from '@biosfera/types';

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
          genus: { search: filter.genus, mode: 'insensitive' },
        }),
        ...(filter?.phylum && {
          phylum: { search: filter.phylum, mode: 'insensitive' },
        }),
        ...(filter?.order && {
          order: { search: filter.order, mode: 'insensitive' },
        }),
        ...(filter?.domain && {
          domain: { search: filter.domain, mode: 'insensitive' },
        }),
        ...(filter?.family && {
          family: { search: filter.family, mode: 'insensitive' },
        }),
        ...(filter?.kingdom && {
          kingdom: { search: filter.kingdom, mode: 'insensitive' },
        }),
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
