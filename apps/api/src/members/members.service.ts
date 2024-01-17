import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async hasAdminRights(userId: string, organisationId: string) {
    const userIsAdmin = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (userIsAdmin?.role === Role.SUPER) return true;

    const membership = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId,
      },
    });

    return membership?.role == Role.ADMIN;
  }

  async checkForMember(userId: string, organisationId: string) {
    const membership = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId,
      },
    });

    return membership;
  }

  async addMember(userId: string, organisationId: string) {
    const memberCheck = await this.checkForMember(userId, organisationId);
    const rightsCheck = await this.hasAdminRights(userId, organisationId);

    if (check || !rightsCheck) return;

    const membership = await this.prisma.organisationUser.create({
      data: {
        userId,
        organisationId,
      },
    });

    return membership;
  }

  async removeMember(userId: string, organisationId: string) {
    const rightsCheck = await this.hasAdminRights(userId, organisationId);

    if (!rightsCheck) return;

    const membership = await this.prisma.organisationUser.deleteMany({
      where: {
        userId,
        organisationId,
      },
    });

    return membership;
  }
}
