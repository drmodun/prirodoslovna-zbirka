import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Organisation, OrganisationUser, Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberRoleType } from './members.dto';
import { NotificationPromise } from '@biosfera/types';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';
@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationUsersService: NotificationUsersService,
  ) {}

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

  async makeMembershipChangeNotification(
    user: User,
    organisation: Organisation,
    status: MemberRoleType,
  ): NotificationPromise {
    const notification = await this.notificationsService.create(
      {
        title: 'Promjena statusa članstva',
        text: `Vaš status članstva u organizaciji ${
          organisation.name
        } je promijenjen u ${status.toLowerCase()}`,
        link: `/organisations/${organisation.id}`,
        notificationImage: organisation.mainImage,
        type: 'MEMBERSHIP_CHANGE',
      },
      [user.id],
    );

    await this.notificationUsersService.publishNotification(
      user.id,
      notification,
    );

    return notification;
  }

  async makeNewMembershipRequestNotification(
    user: User,
    organisation: Organisation & { OrganisationUsers: OrganisationUser[] },
  ): NotificationPromise {
    const notification = await this.notificationsService.create(
      {
        title: 'Zahtjev za članstvo',
        text: `Korisnik ${user.username} je poslao zahtjev za članstvo u organizaciji ${organisation.name}`,
        link: `/organisations/${user.id}`,
        notificationImage: user.id,
        type: 'MEMBERSHIP_REQUEST',
      },
      organisation.OrganisationUsers.map((member) => member.userId),
    );

    await this.notificationUsersService.publishManyNotifications(
      organisation.OrganisationUsers.map((member) => member.userId),
      notification,
    );

    return notification;
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
      include: {
        user: true,
        organisation: true,
      },
    });

    await this.makeMembershipChangeNotification(
      membership.user,
      membership.organisation,
      MemberRoleType.MEMBER,
    );

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

    const action = await this.prisma.organisationUser.update({
      where: {
        organisationId_userId: {
          organisationId,
          userId,
        },
        OR: [
          {
            role: MemberRoleType.REQUESTED,
          },
          {
            role: MemberRoleType.MEMBER,
          },
        ],
      },
      include: {
        user: true,
        organisation: true,
      },
      data: {
        role: newRole,
      },
    });

    await this.makeMembershipChangeNotification(
      action.user,
      action.organisation,
      newRole,
    );
  }

  async makeRequest(userId: string, organisationId: string) {
    const memberCheck = await this.checkForMember(userId, organisationId);

    if (memberCheck) return new BadRequestException('Already a member');

    const membership = await this.prisma.organisationUser.create({
      data: {
        userId,
        organisationId,
      },
      include: {
        user: true,
        organisation: {
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
            },
          },
        },
      },
    });

    await this.makeNewMembershipRequestNotification(
      membership.user,
      membership.organisation,
    );

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

    const membership = await this.prisma.organisationUser.update({
      where: {
        organisationId_userId: {
          organisationId,
          userId,
        },
      },
      include: {
        user: true,
        organisation: true,
      },
      data: {
        role,
      },
    });

    await this.makeMembershipChangeNotification(
      membership.user,
      membership.organisation,
      role,
    );

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

    const newMembership = await this.prisma.organisationUser.update({
      where: {
        organisationId_userId: {
          organisationId,
          userId: newOwnerId,
        },
      },
      data: {
        role: MemberRoleType.OWNER,
      },
      include: {
        user: true,
        organisation: true,
      },
    });

    await this.makeMembershipChangeNotification(
      newMembership.user,
      newMembership.organisation,
      MemberRoleType.OWNER,
    );

    return { membership, newMembership };
  }
}
