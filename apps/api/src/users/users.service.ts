import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
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
import { Language, User } from '@prisma/client';
import { activeTokenWhere } from 'src/api-tokens/api-token';

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

// Only a hash of the reset token is stored, so a leaked database row cannot
// be used to reset the password.
export const hashResetToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

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

    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    await this.sendVefificationEmail(user);

    return user;
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
            search: filter.name.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(filter?.location && { location: filter.location as any }),
        ...(filter?.organisation && {
          OrganisationUser: { some: { organisationId: filter.organisation } },
        }),
        ...(filter?.role && { role: filter.role as any }),
      },
      orderBy: {
        ...(sort
          ? sort
          : filter.name
            ? {
                _relevance: {
                  fields: ['username'],
                  search: filter?.name.split(' ').join(' <-> '),
                  sort: 'desc',
                },
              }
            : null),
      },
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
                organisationId: true,
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
        SavedWorks: {
          where: {
            ...(approval && {
              work: {
                isApproved: approval,
              },
            }),
          },
          include: {
            work: {
              include: {
                organisation: {
                  select: {
                    name: true,
                  },
                },
                _count: {
                  select: {
                    SavedWorks: true,
                  },
                },
              },
            },
          },
        },
        Works: {
          where: {
            ...(approval && { isApproved: approval }),
          },
          include: {
            organisation: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                SavedWorks: true,
              },
            },
          },
        },
        SavedLiterature: true,
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

  async updateLanguage(id: string, language: Language) {
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: { language },
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

  async sendVefificationEmail(user: User) {
    const baseUrl = process.env.WEB_URL || 'http://localhost:3000';

    const link = `${baseUrl}/activateUser/${user.activationCode}`;
    const [subject, text] =
      user.language === Language.HR
        ? [
            `${user.firstName}, verificirajte e-mail adresu`,
            `${user.firstName} ${user.lastName}, molimo vas da verificirate vašu e-mail adresu (${user.email}) klikom na link ${link}`,
          ]
        : [
            `${user.firstName}, verify your e-mail address`,
            `${user.firstName} ${user.lastName}, please verify your e-mail address (${user.email}) by following the link ${link}`,
          ];
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
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Unknown addresses get the same answer as known ones, so the endpoint
    // does not reveal which e-mails have an account.
    if (!user) return;

    const token = randomBytes(32).toString('hex');

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken: hashResetToken(token),
        passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    const baseUrl = process.env.WEB_URL || 'http://localhost:3000';
    const link = `${baseUrl}/resetPassword/${token}`;
    const [subject, text] =
      user.language === Language.HR
        ? [
            `Resetiranje lozinke na biosfera.trema`,
            `Poštovani, molimo vas da resetirate lozinku klikom na link: ${link}. Link vrijedi jedan sat.`,
          ]
        : [
            `Password reset on biosfera.trema`,
            `Hello, you can reset your password by following the link: ${link}. The link is valid for one hour.`,
          ];
    await this.email.sendMail(email, subject, text);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        passwordResetToken: hashResetToken(token),
      },
    });

    if (
      !user ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    )
      throw new BadRequestException('Reset link is invalid or has expired');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Clearing the token makes the link single-use.
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });
  }

  // A password reset keeps the user's API tokens; the web app offers to
  // revoke them.
  async countActiveApiTokens(userId: string) {
    return await this.prisma.apiToken.count({
      where: { userId, ...activeTokenWhere() },
    });
  }
}
