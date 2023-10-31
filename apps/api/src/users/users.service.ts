import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/Prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserQuery } from '../../../../packages/types/user/userRequests';
import {
  PaginationRequest,
  SortingRequest,
  sortQueryBuilder,
} from '../../../../packages/types/query';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
          name: { search: filter.name, mode: 'insensitive' },
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

  async findOne(id: string) {
    console.log(id);
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: id },
      include: {
        _count: true,
        Posts: {
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
        FavouriteExponat: {
          include: {
            Exponat: true,
          },
        },
      },
    });
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
}
