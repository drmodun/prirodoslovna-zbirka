import { Injectable, Query } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { PrismaService } from 'src/Prisma/prisma.service';
import { OrganisationQuery } from '../../../../packages/types/organisation/organisationRequest';
import {
  PaginationRequest,
  QueryResponse,
  SortingRequest,
  sortQueryBuilder,
} from '../../../../packages/types/query';
import { County } from '@prisma/client';

@Injectable()
export class OrganisationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrganisationDto: CreateOrganisationDto) {
    return await this.prisma.organisation.create({
      data: createOrganisationDto,
    });
  }

  async findAll(
    filter?: OrganisationQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
  ) {
    const sort = sortQueryBuilder(sorting);

    const result = await this.prisma.organisation.findMany({
      where: {
        name: filter?.name,
        location: filter?.location as any,
        //fix enums later;
      },
      orderBy: sort,
      skip: pagination?.page - 1 * pagination?.size,
      take: pagination?.size,
    });

    return {
      data: result,
      pagination: {
        page: pagination?.page,
        pageSize: pagination?.size,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / pagination?.size),
      },
    } as QueryResponse<Organisation>;
  }

  findOne(id: number) {
    return `This action returns a #${id} organisation`;
  }

  update(id: number, updateOrganisationDto: UpdateOrganisationDto) {
    return `This action updates a #${id} organisation`;
  }

  remove(id: number) {
    return `This action removes a #${id} organisation`;
  }
}
