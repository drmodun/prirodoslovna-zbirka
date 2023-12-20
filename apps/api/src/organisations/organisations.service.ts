import { Injectable } from '@nestjs/common';
import {
  CreateOrganisationDto,
  UpdateOrganisationDto,
} from './dto/organisations.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrganisationQuery } from '@biosfera/types';
import {
  PaginationRequest,
  SortingRequest,
  sortQueryBuilder,
} from '@biosfera/types';

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
    approval?: boolean,
  ) {
    const sort = sorting && sortQueryBuilder(sorting);

    const result = await this.prisma.organisation.findMany({
      where: {
        ...(filter?.name && {
          name: { search: filter.name, mode: 'insensitive' },
        }),
        ...(filter?.location && { location: filter.location as any }),
        ...(approval && {
          isApproved: approval,
        }),
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
      ...(sort && { orderBy: sort }),
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
    });

    return result;
  }

  async findOne(id: string, approval?: boolean) {
    const item = await this.prisma.organisation.findFirstOrThrow({
      where: {
        id,
        ...(approval && {
          isApproved: approval,
        }),
      },
      include: {
        Exponats: {
          where: {
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
          },
        },
        _count: true,
        OrganisationPosts: {
          where: {
            ...(approval && {
              isApproved: approval,
            }),
          },
        },
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

  async changeApprovalStatus(id: string) {
    const current = await this.prisma.organisation.findFirst({
      where: {
        id,
      },
    });
    await this.prisma.organisation.update({
      where: {
        id,
      },
      data: {
        isApproved: !current.isApproved,
      },
    });
  }
}
