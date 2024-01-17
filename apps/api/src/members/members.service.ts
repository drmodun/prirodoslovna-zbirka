import { MemberRole } from '@biosfera/types';
import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberRoleType } from './members.dto';
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

    return membership?.role == MemberRole.ADMIN.toString();
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

    if (memberCheck) return;

    const membership = await this.prisma.organisationUser.create({
      data: {
        userId,
        organisationId,
        role: MemberRoleType.MEMBER,
      },
    });

    return membership;
  }

  async removeMember(userId: string, organisationId: string) {
    const membership = await this.prisma.organisationUser.deleteMany({
      where: {
        userId,
        organisationId,
      },
    });

    return membership;
  }

  async editMemberRole(
    userId: string,
    organisationId: string,
    role: MemberRoleType, //TODO: check why enums are acting weird
  ) {
    const membership = await this.prisma.organisationUser.updateMany({
      where: {
        userId,
        organisationId,
      },
      data: {
        role,
      },
    });

    return membership;
  }

  async makeRequest(userId: string, organisationId: string) {
    const memberCheck = await this.checkForMember(userId, organisationId);

    if (memberCheck) return;

    const membership = await this.prisma.organisationUser.create({
      data: {
        userId,
        organisationId,
      },
    });

    return membership;
  }

  async leaveOrganisation(userId: string, organisationId: string) {
    const membership = await this.prisma.organisationUser.deleteMany({
      where: {
        userId,
        organisationId,
      },
    });

    return membership;
  }
}
