import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateExponatDto, UpdateExponatDto } from './dto/exponats.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ExponatQuery,
  PaginationRequest,
  SortingRequest,
  sortExponatQueryBuilderWithComplexFilters,
} from '@biosfera/types';
import { Role } from '@prisma/client';
import { MemberRoleType } from 'src/members/members.dto';

@Injectable()
export class ExponatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExponatDto: CreateExponatDto, userId: string) {
    const check = await this.checkForValidity(
      userId,
      createExponatDto.authorId,
    );

    if (!check) throw new UnauthorizedException();

    return await this.prisma.exponat.create({
      data: {
        alternateName: createExponatDto.alternateName,
        attributes: createExponatDto.attributes,
        description: createExponatDto.description,
        name: createExponatDto.name,
        mainImage: createExponatDto.mainImage,
        Categorization: {
          connect: {
            id: createExponatDto.categorizationId,
          },
        },
        funFacts: createExponatDto.funFacts,
        ExponatKind: createExponatDto.ExponatKind,
        Organisation: {
          connect: {
            id: createExponatDto.authorId,
          },
        },
        isApproved: false,
      },
      include: {
        Organisation: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }

  async findAll(
    filter?: ExponatQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
    approval?: boolean,
  ) {
    const sort = sorting && sortExponatQueryBuilderWithComplexFilters(sorting);
    return await this.prisma.exponat.findMany({
      where: {
        ...(filter?.name && {
          name: {
            search: filter.name.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.alternateName && {
          alternateName: {
            search: filter.alternateName.replace(/(\w)\s+(\w)/g, '$1 <-> $2'),
            mode: 'insensitive',
          },
        }),
        ...(filter?.organisationId && {
          organisationId: filter.organisationId,
        }),

        ...(filter.minFavoriteCount && {
          _count: {
            FavouriteExponats: {
              gte: filter.minFavoriteCount,
            },
          },
        }),
        ...(filter.maxFavoriteCount && {
          _count: {
            FavouriteExponats: {
              lte: filter.maxFavoriteCount,
            },
          },
        }),
        ...(filter.createdAt && {
          createdAt: {
            gte: filter.createdAt,
          },
        }),
        ...(approval && {
          isApproved: approval,
        }),
      },
      include: {
        _count: {
          select: {
            FavouriteExponats: true,
            Posts: true,
          },
        },
        Categorization: {
          select: {
            genus: true,
            family: true,
          },
        },
        Organisation: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      ...(sort && { orderBy: sort }),
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
    });
  }

  async checkUserRole(userId: string, exponatId: string) {
    const exponat = await this.prisma.exponat.findFirst({
      where: {
        id: exponatId,
      },
    });

    if (!exponat) return false;

    const check = await this.checkForValidity(
      userId,
      exponat.organisationId,
      true,
    );

    if (!check) return false;

    return true;
  }

  async findOne(id: string, approval?: boolean) {
    return await this.prisma.exponat.findUnique({
      where: {
        id,
        ...(approval && { isApproved: approval }),
      },
      include: {
        _count: {
          select: {
            FavouriteExponats: true,
            Posts: true,
          },
        },
        Categorization: true,
        Organisation: {
          select: {
            name: true,
            location: true,
            id: true,
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
            author: {
              select: {
                firstName: true,
                lastName: true,
                hasProfileImage: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, request: UpdateExponatDto, userId: string) {
    const exponat = await this.prisma.exponat.findFirst({
      where: {
        id,
      },
    });

    if (!exponat) return false;

    const check = await this.checkForValidity(
      userId,
      exponat.organisationId,
      true,
    );

    if (!check) return false;

    await this.prisma.exponat.update({
      where: {
        id,
      },
      data: request,
    });
  }

  async remove(id: string) {
    await this.prisma.exponat.delete({
      where: {
        id,
      },
    });
  }

  async changeApprovalStatus(id: string, userId: string) {
    const exponat = await this.prisma.exponat.findFirst({
      where: {
        id,
      },
    });

    if (!exponat) return false;

    const check = await this.checkForValidity(
      userId,
      exponat.organisationId,
      true,
    );
    if (!check) return false;
    const current = await this.prisma.exponat.findFirst({
      where: {
        id,
      },
    });
    await this.prisma.exponat.update({
      where: {
        id,
      },
      data: {
        isApproved: !current.isApproved,
      },
    });
  }

  private async checkForValidity(
    userId: string,
    organisationId: string,
    adminOnly: boolean = false,
  ) {
    const connection = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId,
      },
    });

    if (!connection) {
      const checkForSuper = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (checkForSuper.role !== Role.SUPER) return false;
      return true;
    }

    return !(
      (adminOnly && connection.role !== MemberRoleType.ADMIN) ||
      (adminOnly && connection.role !== MemberRoleType.OWNER)
    );
  }

  async findExponatByPostId(postId: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
      },
      select: {
        ExponatId: true,
      },
    });

    if (!post) return null;

    return post.ExponatId;
  }
}
