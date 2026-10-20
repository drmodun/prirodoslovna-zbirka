import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { MemberRoleType } from './members.dto';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('MembersService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { create: jest.Mock };
  let notificationUsers: {
    publishNotification: jest.Mock;
    publishManyNotifications: jest.Mock;
  };
  let service: MembersService;

  const user = { id: 'u1', username: 'ana' };
  const org = { id: 'o1', name: 'Org', mainImage: 'img' };

  beforeEach(() => {
    prisma = createPrismaMock();
    notifications = { create: jest.fn().mockResolvedValue({ id: 'n1' }) };
    notificationUsers = {
      publishNotification: jest.fn(),
      publishManyNotifications: jest.fn(),
    };
    service = new MembersService(
      prisma as any,
      notifications as any,
      notificationUsers as any,
    );
  });

  describe('permission checks', () => {
    const setup = (globalRole: string | null, memberRole: string | null) => {
      prisma.user.findFirst.mockResolvedValue(
        globalRole ? { role: globalRole } : null,
      );
      prisma.organisationUser.findFirst.mockResolvedValue(
        memberRole ? { role: memberRole } : null,
      );
    };

    it.each([
      ['SUPER', null, true],
      ['USER', 'OWNER', true],
      ['USER', 'ADMIN', true],
      ['USER', 'MEMBER', false],
      ['USER', 'REQUESTED', false],
      ['USER', null, false],
      [null, null, false],
    ])(
      'hasAdminRights(global=%s, member=%s) = %s',
      async (globalRole, memberRole, expected) => {
        setup(globalRole, memberRole);
        await expect(service.hasAdminRights('u1', 'o1')).resolves.toBe(
          expected,
        );
      },
    );

    it.each([
      ['SUPER', null, true],
      ['USER', 'OWNER', true],
      ['USER', 'ADMIN', false],
      ['USER', 'MEMBER', false],
      ['USER', null, false],
    ])(
      'hasOwnerRights(global=%s, member=%s) = %s',
      async (globalRole, memberRole, expected) => {
        setup(globalRole, memberRole);
        await expect(service.hasOwnerRights('u1', 'o1')).resolves.toBe(
          expected,
        );
      },
    );

    it.each([
      ['SUPER', null, true],
      ['ADMIN', null, true],
      ['USER', 'OWNER', true],
      ['USER', 'ADMIN', true],
      ['USER', 'MEMBER', false],
      ['USER', null, false],
    ])(
      'hasModerationRights(global=%s, member=%s) = %s',
      async (globalRole, memberRole, expected) => {
        setup(globalRole, memberRole);
        await expect(service.hasModerationRights('u1', 'o1')).resolves.toBe(
          expected,
        );
      },
    );

    it('a platform ADMIN gets no organisation admin or owner rights', async () => {
      setup('ADMIN', null);
      await expect(service.hasAdminRights('u1', 'o1')).resolves.toBe(false);
      await expect(service.hasOwnerRights('u1', 'o1')).resolves.toBe(false);
    });

    it('a missing user id never passes (findFirst would match any user)', async () => {
      setup('SUPER', 'OWNER');
      await expect(service.hasAdminRights(undefined, 'o1')).resolves.toBe(
        false,
      );
      await expect(service.hasOwnerRights(undefined, 'o1')).resolves.toBe(
        false,
      );
      await expect(service.hasModerationRights(undefined, 'o1')).resolves.toBe(
        false,
      );
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('SUPER users short-circuit without a membership lookup', async () => {
      setup('SUPER', null);
      await service.hasAdminRights('u1', 'o1');
      expect(prisma.organisationUser.findFirst).not.toHaveBeenCalled();
    });
  });

  it('checkForMember looks up by user and organisation', async () => {
    prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
    await expect(service.checkForMember('u1', 'o1')).resolves.toEqual({
      id: 'm',
    });
    expect(prisma.organisationUser.findFirst).toHaveBeenCalledWith({
      where: { userId: 'u1', organisationId: 'o1' },
    });
  });

  describe('addMember', () => {
    it('is a no-op for existing members', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      await expect(service.addMember('u1', 'o1')).resolves.toBeUndefined();
      expect(prisma.organisationUser.create).not.toHaveBeenCalled();
    });

    it('creates a MEMBER and notifies them', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue(null);
      prisma.organisationUser.create.mockResolvedValue({
        user,
        organisation: org,
      });
      await service.addMember('u1', 'o1');

      expect(prisma.organisationUser.create.mock.calls[0][0].data).toEqual({
        userId: 'u1',
        organisationId: 'o1',
        role: 'MEMBER',
      });
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'MEMBERSHIP_CHANGE',
          link: '/organisation/o1',
          text: expect.stringContaining('member'),
        }),
        ['u1'],
      );
      expect(notificationUsers.publishNotification).toHaveBeenCalledWith('u1', {
        id: 'n1',
      });
    });
  });

  describe('makeRequest', () => {
    it('throws BadRequestException for existing members', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      await expect(service.makeRequest('u1', 'o1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.organisationUser.create).not.toHaveBeenCalled();
    });

    it('creates a request and notifies every owner/admin', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue(null);
      prisma.organisationUser.create.mockResolvedValue({
        user,
        organisation: {
          ...org,
          OrganisationUsers: [{ userId: 'a1' }, { userId: 'a2' }],
        },
      });

      await service.makeRequest('u1', 'o1');

      const arg = prisma.organisationUser.create.mock.calls[0][0];
      expect(arg.data).toEqual({ userId: 'u1', organisationId: 'o1' });
      expect(arg.include.organisation.include.OrganisationUsers.where).toEqual({
        OR: [{ role: 'OWNER' }, { role: 'ADMIN' }],
      });
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MEMBERSHIP_REQUEST' }),
        ['a1', 'a2'],
      );
      expect(notificationUsers.publishManyNotifications).toHaveBeenCalledWith(
        ['a1', 'a2'],
        { id: 'n1' },
      );
    });
  });

  describe.each([
    ['removeMember', 'Member not found'],
    ['leaveOrganisation', 'You are not a member'],
  ] as const)('%s', (method, message) => {
    it('throws NotFoundException when there is no membership', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue(null);
      const call = service[method]('u1', 'o1');
      await expect(call).rejects.toBeInstanceOf(NotFoundException);
      await expect(call).rejects.toThrow(message);
      expect(prisma.organisationUser.deleteMany).not.toHaveBeenCalled();
    });

    it('deletes the membership', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      prisma.organisationUser.deleteMany.mockResolvedValue({ count: 1 });
      await expect(service[method]('u1', 'o1')).resolves.toEqual({ count: 1 });
      expect(prisma.organisationUser.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', organisationId: 'o1' },
      });
    });
  });

  describe('editMemberRole', () => {
    it('throws NotFoundException for non members', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue(null);
      await expect(
        service.editMemberRole('u1', 'o1', MemberRoleType.ADMIN),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.organisationUser.update).not.toHaveBeenCalled();
    });

    it('only updates REQUESTED/MEMBER rows, so owners and admins are protected', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      prisma.organisationUser.update.mockResolvedValue({
        user,
        organisation: org,
      });
      await service.editMemberRole('u1', 'o1', MemberRoleType.ADMIN);

      const arg = prisma.organisationUser.update.mock.calls[0][0];
      expect(arg.where).toEqual({
        organisationId_userId: { organisationId: 'o1', userId: 'u1' },
        OR: [{ role: 'REQUESTED' }, { role: 'MEMBER' }],
      });
      expect(arg.data).toEqual({ role: 'ADMIN' });
      expect(notifications.create.mock.calls[0][0].text).toContain('admin');
    });
  });

  describe('ownerEditMemberRole', () => {
    it('throws NotFoundException for non members', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue(null);
      await expect(
        service.ownerEditMemberRole('u1', 'o1', MemberRoleType.ADMIN),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates any role and notifies', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      prisma.organisationUser.update.mockResolvedValue({
        user,
        organisation: org,
      });
      const result = await service.ownerEditMemberRole(
        'u1',
        'o1',
        MemberRoleType.ADMIN,
      );
      const arg = prisma.organisationUser.update.mock.calls[0][0];
      expect(arg.where.OR).toBeUndefined();
      expect(arg.data).toEqual({ role: 'ADMIN' });
      expect(notificationUsers.publishNotification).toHaveBeenCalled();
      expect(result).toMatchObject({ user, organisation: org });
    });
  });

  describe('transferOwnership', () => {
    it('refuses when the new owner is not a member', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue(null);
      await expect(
        service.transferOwnership('old', 'o1', 'new'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.organisationUser.updateMany).not.toHaveBeenCalled();
      expect(prisma.organisationUser.update).not.toHaveBeenCalled();
    });

    it('demotes the old owner to MEMBER and promotes the new one', async () => {
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      prisma.organisationUser.updateMany.mockResolvedValue({ count: 1 });
      prisma.organisationUser.update.mockResolvedValue({
        user,
        organisation: org,
      });

      const result: any = await service.transferOwnership('old', 'o1', 'new');

      expect(prisma.organisationUser.findFirst).toHaveBeenCalledWith({
        where: { userId: 'new', organisationId: 'o1' },
      });
      expect(prisma.organisationUser.updateMany).toHaveBeenCalledWith({
        where: { userId: 'old', organisationId: 'o1' },
        data: { role: 'MEMBER' },
      });
      expect(prisma.organisationUser.update.mock.calls[0][0]).toMatchObject({
        where: {
          organisationId_userId: { organisationId: 'o1', userId: 'new' },
        },
        data: { role: 'OWNER' },
      });
      expect(notifications.create.mock.calls[0][0].text).toContain('owner');
      expect(result.membership).toEqual({ count: 1 });
      expect(result.newMembership.user).toBe(user);
    });
  });
});
