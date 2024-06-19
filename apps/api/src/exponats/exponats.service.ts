import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateExponatDto,
  ExponatQuery,
  ExponatSQL,
  UpdateExponatDto,
} from './dto/exponats.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginationRequest,
  SortingRequest,
  sortExponatQueryBuilderWithComplexFilters,
} from '@biosfera/types';
import { Exponat, ExponatKind, Organisation, Role } from '@prisma/client';
import { MemberRoleType } from 'src/members/members.dto';
import {
  anonymousExponatsDiscover,
  personalizedExponatsDiscover,
} from './rawQueries';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';
import { env } from 'process';

@Injectable()
export class ExponatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationUsersService: NotificationUsersService,
  ) {}

  async create(createExponatDto: CreateExponatDto, userId: string) {
    const check = await this.checkForValidity(
      userId,
      createExponatDto.authorId,
    );

    const adminCheck = await this.checkForValidity(
      userId,
      createExponatDto.authorId,
      true,
    );

    if (!check) throw new UnauthorizedException();

    const creation = await this.prisma.exponat.create({
      data: {
        alternateName: createExponatDto.alternateName,
        attributes: createExponatDto.attributes,
        description: createExponatDto.description,
        name: createExponatDto.name,
        thirdDimensionalModel: createExponatDto.thirdDimensionalModel,
        video: createExponatDto.video,
        mainImage: createExponatDto.mainImage,
        ...(createExponatDto.categorizationId && {
          Categorization: {
            connect: {
              id: createExponatDto.categorizationId,
            },
          },
        }),
        funFacts: createExponatDto.funFacts,
        ExponatKind: createExponatDto.ExponatKind as ExponatKind,
        Organisation: {
          connect: {
            id: createExponatDto.authorId,
          },
        },
        ...(createExponatDto.authorshipInfoId && {
          AuthorshipInfo: {
            connect: {
              id: createExponatDto.authorshipInfoId,
            },
          },
        }),
        isApproved: adminCheck,
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

    if (adminCheck) {
      const organisation = await this.prisma.organisation.findFirst({
        where: {
          id: createExponatDto.authorId,
        },
        include: {
          OrganisationUsers: {
            select: {
              userId: true,
            },
          },
        },
      });

      await this.makeNewExponatNotification({
        ...creation,
        Organisation: {
          ...organisation,
          OrganisationUsers: organisation.OrganisationUsers,
        },
      });
    } else {
      const organisation = await this.prisma.organisation.findFirst({
        where: {
          id: createExponatDto.authorId,
        },
        include: {
          OrganisationUsers: {
            where: {
              OR: [
                {
                  role: MemberRoleType.OWNER,
                },
                {
                  role: MemberRoleType.ADMIN,
                },
              ],
            },
            select: {
              userId: true,
            },
          },
        },
      });

      await this.makeNewExponatRequestNotification({
        ...creation,
        Organisation: {
          ...organisation,
          OrganisationUsers: organisation.OrganisationUsers,
        },
      });
    }

    return creation;
  }

  async makeNewExponatRequestNotification(
    exponat: Exponat & {
      Organisation: Organisation & {
        OrganisationUsers: {
          userId: string;
        }[];
      };
    },
  ) {
    const notification = await this.notificationsService.create(
      {
        text: `Novi zahtev za eksponat ${exponat.name} (${exponat.alternateName}) organizacije ${exponat.Organisation.name}`,
        title: `Organizacija ${exponat.Organisation.name} je dobila novi zahtev za eksponat ${exponat.name}`,
        link: `${env.WEB_URL}/exponat/${exponat.id}/admin`,
        type: 'NEW_EXPONAT_REQUEST',
        notificationImage: exponat.mainImage,
      },
      exponat.Organisation.OrganisationUsers.map((user) => user.userId),
    );

    await this.notificationUsersService.publishManyNotifications(
      exponat.Organisation.OrganisationUsers.map((user) => user.userId),
      notification,
    );
  }

  async makeNewExponatNotification(
    exponat: Exponat & {
      Organisation: Organisation & {
        OrganisationUsers: {
          userId: string;
        }[];
      };
    },
  ) {
    const notification = await this.notificationsService.create(
      {
        title: `Novi eksponat organizacije ${exponat.Organisation.name}`,
        text: `Organizacija ${exponat.Organisation.name} je dodala novi eksponat ${exponat.name}`,
        link: `${env.WEB_URL}/exponat/${exponat.id}`,
        type: 'EXPONAT_BY_FOLLOWED_ORGANISATION',
        notificationImage: exponat.mainImage,
      },
      exponat.Organisation.OrganisationUsers.map((user) => user.userId),
    );

    await this.notificationUsersService.publishManyNotifications(
      exponat.Organisation.OrganisationUsers.map((user) => user.userId),
      notification,
    );
  }

  async discoverExponats(page: number = 1, size: number, userId?: string) {
    const results = userId
      ? await personalizedExponatsDiscover(page, size, userId, this.prisma)
      : await anonymousExponatsDiscover(page, size, this.prisma);
    const data = results as ExponatSQL[];
    console.log(data);
    return data;
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
            search: filter.name.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.alternateName && {
          alternateName: {
            search: filter.alternateName.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.organisationId && {
          organisationId: filter.organisationId,
        }),
        ...(filter?.class && {
          search: filter.class.split(' ').join(' <-> '),
          Categorization: {
            is: {
              class: {
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(filter?.family && {
          Categorization: {
            is: {
              family: {
                search: filter.family.split(' ').join(' <-> '),
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(filter?.genus && {
          Categorization: {
            is: {
              genus: {
                search: filter.genus.split(' ').join(' <-> '),
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(filter?.order && {
          Categorization: {
            is: {
              order: {
                search: filter.order.split(' ').join(' <-> '),
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(filter?.kingdom && {
          Categorization: {
            is: {
              kingdom: {
                search: filter.kingdom.split(' ').join(' <-> '),
                mode: 'insensitive',
              },
            },
          },
        }),

        ...(filter?.phylum && {
          Categorization: {
            is: {
              phylum: {
                search: filter.phylum.split(' ').join(' <-> '),
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(filter?.species && {
          Categorization: {
            is: {
              species: {
                search: filter.species.split(' ').join(' <-> '),
                mode: 'insensitive',
              },
            },
          },
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
        Categorization: true,
        Organisation: {
          select: {
            name: true,
            id: true,
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

    return check;
  }

  async findOne(id: string, approval?: boolean) {
    return await this.prisma.exponat.findUniqueOrThrow({
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
        AuthorshipInfo: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
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
                username: true,
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

    if (!exponat) throw new NotFoundException();

    const check = await this.checkForValidity(
      userId,
      exponat.organisationId,
      true,
    );

    if (!check) throw new UnauthorizedException();

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

    if (!exponat) throw new NotFoundException();

    const check = await this.checkForValidity(
      userId,
      exponat.organisationId,
      true,
    );
    if (!check) throw new UnauthorizedException();

    const current = await this.prisma.exponat.findFirst({
      where: {
        id,
      },
      include: {
        Organisation: {
          include: {
            OrganisationUsers: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!current) throw new NotFoundException();

    if (!current.IsNotificationMade && !current.isApproved) {
      await this.makeNewExponatNotification(current);
      await this.prisma.exponat.update({
        where: {
          id,
        },
        data: {
          IsNotificationMade: true,
        },
      });
    }

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

    const checkForSuper = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (checkForSuper.role === Role.SUPER) {
      return true;
    }

    if (adminOnly) {
      return (
        connection.role === MemberRoleType.ADMIN ||
        connection.role === MemberRoleType.OWNER
      );
    }

    return true;
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

  async getIdBySerialNumber(serialNumber: number) {
    const exponat = await this.prisma.exponat.findFirst({
      where: {
        serialNumber,
      },
    });

    if (!exponat) throw new NotFoundException();

    return exponat.id;
  }
}
