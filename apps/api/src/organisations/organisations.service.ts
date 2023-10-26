import { Injectable, Query } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { PrismaService } from 'src/Prisma/prisma.service';
import { OrganisationQuery } from '../../../../packages/types/organisation/organisationRequest';
import {
  OrganisationResponseShort,
  ExtendedOrganisationResponse,
} from '../../../../packages/types/organisation/organisationResponses';
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

  async findAllShort(
    filter?: OrganisationQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
  ) {
    const sort = sortQueryBuilder(sorting);

    const result = await this.prisma.organisation.findMany({
      where: {
        ...(filter?.name && { name: filter.name }),
        ...(filter?.location && { location: filter.location as any }),
        //fix enums later;
      },
      select: {
        id: true,
        name: true,
        location: true,
        websiteUrl: true,
        mainImage: true,
        updatedAt: true,
        Exponat: {
          select: {
            _count: {
              select: {
                FavouriteExponat: true,
              },
            },
          },
        },
      },
      orderBy: sort,
      skip: pagination?.page - 1 * pagination?.size,
      take: pagination?.size,
    });

    return result;
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
