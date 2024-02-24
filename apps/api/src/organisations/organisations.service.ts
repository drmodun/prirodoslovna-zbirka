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
import { MemberRoleType } from 'src/members/members.dto';

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
          name: {
            search: filter.name.split(' ').join(' | '),
            mode: 'insensitive',
          },
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
                FavouriteExponats: true,
              },
            },
          },
        },
      },
      orderBy: {
        ...(sort
          ? sort
          : filter.name
          ? {
              _relevance: {
                fields: ['name'],
                search: filter?.name.split(' ').join(' <-> '),
                sort: 'desc',
              },
            }
          : null),
      },
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
            Posts: {
              where: {
                ...(approval && {
                  isApproved: approval,
                }),
              },
              include: {
                _count: {
                  select: {
                    Likes: true,
                  },
                },
                author: {
                  select: {
                    hasProfileImage: true,
                    username: true,
                    id: true,
                  },
                },
              },
            },
            _count: {
              select: {
                FavouriteExponats: true,
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
        OrganisationUsers: {
          where: {
            ...(approval && {
              role: { not: MemberRoleType.REQUESTED },
            }),
          },
          select: {
            user: {
              include: {
                _count: {
                  select: {
                    Posts: true,
                    followers: true,
                  },
                },
              },
            },
            role: true,
          },
        },
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

  async getJoinRequests(organisationId: string) {
    const requests = await this.prisma.organisationUser.findMany({
      where: {
        organisationId,
        role: MemberRoleType.REQUESTED,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            id: true,
          },
        },
      },
    });

    return requests;
  }

  async findOrganisationByExponatId(exponatId: string) {
    const exponat = await this.prisma.exponat.findFirst({
      where: {
        id: exponatId,
      },
      select: {
        organisationId: true,
      },
    });

    if (!exponat) return null;

    return exponat.organisationId;
  }
}
