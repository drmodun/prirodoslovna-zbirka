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
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blob: BlobService,
    private readonly email: EmailService,
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
                        FavouriteExponats: true,
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
                    FavouriteExponats: true,
                  },
                },
                Organisation: {
                  select: {
                    id: true,
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
                    FavouriteExponats: true,
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
    await this.blob.upload('user', userId, file.buffer, file.mimetype);

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

  async sendVefificationEmail(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    const baseUrl = process.env.WEB_URL || 'http://localhost:3000';

    const subject = `${user.firstName}, verificirajte e-mail adresu`;
    //TODO: make random link for user verification
    const text = `${user.firstName} ${user.lastName}, molimo vas da verificirate vašu e-mail adresu (${user.email}) klikom na link ${baseUrl}/activate/${user.activationCode}`;

    const mail = await this.email.sendMail(user.email, subject, text);

    return mail;
  }

  async verifyUser(userActivationCode: string) {
    return await this.prisma.user.update({
      where: {
        activationCode: userActivationCode,
      },
      data: {
        isActivated: true,
      },
    });
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
    });
    const baseUrl = process.env.WEB_URL || 'http://localhost:3000';
    const subject = `Resetiranje lozinke na biosfera.trema`;
    const text = `Poštovani, molimo vas da resetirate lozinku klikom na link: ${baseUrl}/reset/${user.activationCode}`;
    const mail = await this.email.sendMail(email, subject, text);
    return mail;
  }

  async resetPassword(userActivationCode: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return await this.prisma.user.update({
      where: {
        activationCode: userActivationCode,
      },
      data: {
        password: hashedPassword,
      },
    });
  }
}
