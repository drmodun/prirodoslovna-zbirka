import { Injectable } from '@nestjs/common';
import { RegisterUserDto, UpdateUserDto } from './dto/users.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserQuery } from '@biosfera/types';
import {
  PaginationRequest,
  SortingRequest,
  sortQueryBuilder,
} from '@biosfera/types';
import { MemberRoleType } from 'src/members/members.dto';
import { BlobService } from 'src/blob/blob.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blob: BlobService,
  ) {}

  async create(createUserDto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    createUserDto.password = hashedPassword;

    return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(
    filter?: UserQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
  ) {
    const sort = sorting && sortQueryBuilder(sorting);

    return await this.prisma.user.findMany({
      where: {
        ...(filter?.name && {
          firstName: {
            search: filter.name.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.location && { location: filter.location as any }),
        ...(filter?.organisation && {
          OrganisationUser: { some: { organisationId: filter.organisation } },
        }),
        ...(filter?.role && { role: filter.role as any }),
      },

      ...(sort && { orderBy: sort }),

      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,

      include: {
        _count: {
          select: {
            Posts: true,
            followers: true,
          },
        },
      },
    });
  }

  async findOne(id: string, approval?: boolean) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: id,
      },
      include: {
        _count: true,
        OrganisationUser: {
          select: {
            organisation: {
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
            },
            role: true,
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
            Exponat: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },

        Likes: {
          where: {
            ...(approval && {
              Post: {
                isApproved: approval,
              },
            }),
          },
          include: {
            Post: {
              include: {
                Exponat: true,
                author: true,
                _count: {
                  select: {
                    Likes: true,
                  },
                },
              },
            },
          },
        },
        FavouriteExponats: {
          where: {
            ...(approval && {
              Exponat: {
                isApproved: approval,
              },
            }),
          },
          include: {
            Exponat: {
              include: {
                _count: {
                  select: {
                    Posts: true,
                    FavouriteExponat: true,
                  },
                },
                Organisation: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }

  async getJoinRequests(userId: string) {
    return await this.prisma.organisationUser.findMany({
      where: {
        userId,
        role: MemberRoleType.REQUESTED,
      },
      include: {
        organisation: {
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
        },
      },
    });
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    const imageUrl = await this.blob.upload(
      'user',
      userId,
      file.buffer,
      file.mimetype,
    );

    const addedLogo = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hasProfileImage: true,
      },
    });

    return addedLogo;
  }
}
