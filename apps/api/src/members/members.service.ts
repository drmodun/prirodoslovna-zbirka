import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    return (
      membership?.role == MemberRoleType.ADMIN ||
      membership?.role == MemberRoleType.OWNER
    );
  }

  async hasOwnerRights(userId: string, organisationId: string) {
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

    return membership?.role == MemberRoleType.OWNER;
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

    if (memberCheck) return new BadRequestException('Already a member');

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
    const memberCheck = await this.checkForMember(userId, organisationId);

    if (!memberCheck) return new NotFoundException('Member not found');

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
    newRole: MemberRoleType,
  ) {
    const memberCheck = await this.checkForMember(userId, organisationId);

    if (!memberCheck) return new NotFoundException('Member not found');

    await this.prisma.organisationUser.updateMany({
      where: {
        userId,
        organisationId,
        OR: [
          {
            role: MemberRoleType.REQUESTED,
          },
          {
            role: MemberRoleType.MEMBER,
          },
        ],
      },
      data: {
        role: newRole,
      },
    });
  }

  async makeRequest(userId: string, organisationId: string) {
    const memberCheck = await this.checkForMember(userId, organisationId);

    if (memberCheck) return new BadRequestException('Already a member');

    const membership = await this.prisma.organisationUser.create({
      data: {
        userId,
        organisationId,
      },
    });

    return membership;
  }

  async leaveOrganisation(userId: string, organisationId: string) {
    const memberCheck = await this.checkForMember(userId, organisationId);

    if (!memberCheck) return new NotFoundException('You are not a member');

    const membership = await this.prisma.organisationUser.deleteMany({
      where: {
        userId,
        organisationId,
      },
    });

    return membership;
  }

  async ownerEditMemberRole(
    userId: string,
    organisationId: string,
    role: MemberRoleType,
  ) {
    const memberCheck = await this.checkForMember(userId, organisationId);

    if (!memberCheck) return new NotFoundException('Member not found');

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

  async transferOwnership(
    userId: string,
    organisationId: string,
    newOwnerId: string,
  ) {
    const memberCheck = await this.checkForMember(newOwnerId, organisationId);

    if (!memberCheck) return new NotFoundException('Member not found');

    const membership = await this.prisma.organisationUser.updateMany({
      where: {
        userId,
        organisationId,
      },
      data: {
        role: MemberRoleType.MEMBER,
      },
    });

    const newMembership = await this.prisma.organisationUser.updateMany({
      where: {
        userId: newOwnerId,
        organisationId,
      },
      data: {
        role: MemberRoleType.OWNER,
      },
    });

    return { membership, newMembership };
  }
}
