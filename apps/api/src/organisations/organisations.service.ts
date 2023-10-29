import { Injectable } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrganisationQuery } from '../../../../packages/types/organisation/organisationRequests';
import {
  PaginationRequest,
  SortingRequest,
  sortQueryBuilder,
} from '../../../../packages/types/query';

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
        ...(filter?.name && {
          name: { search: filter.name, mode: 'insensitive' },
        }),
        ...(filter?.location && { location: filter.location as any }),
        //fix enums later;
      },
      include: {
        _count: {
          select: {
            Exponats: true,
            OrganisationUsers: true,
            UserOrganisationFollowers: true,
          },
        },
        Exponats: {
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
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
    });

    return result;
  }

  async findOne(id: string) {
    const item = await this.prisma.organisation.findFirstOrThrow({
      where: {
        id,
      },
      include: {
        Exponats: {
          include: {
            _count: {
              select: {
                FavouriteExponat: true,
              },
            },
          },
        },
        _count: true,
        OrganisationPosts: true,
        UserOrganisationFollowers: true,
        OrganisationUsers: true,
      },
    });

    return item;
  }

  async update(id: string, updateOrganisationDto: UpdateOrganisationDto) {
    await this.prisma.organisation.update({
      where: {
        id,
      },
      data: updateOrganisationDto,
    });
  }

  async remove(id: string) {
    await this.prisma.organisation.delete({
      where: {
        id,
      },
    });
  }
}
