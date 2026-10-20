import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ExponatsService } from './exponats.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('ExponatsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { create: jest.Mock };
  let notificationUsers: { publishManyNotifications: jest.Mock };
  let service: ExponatsService;

  /** Configure who the acting user is and how they relate to the organisation. */
  const actor = (globalRole: string, memberRole: string | null) => {
    prisma.user.findFirst.mockResolvedValue({ role: globalRole });
    prisma.organisationUser.findFirst.mockResolvedValue(
      memberRole ? { role: memberRole } : null,
    );
  };

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    prisma = createPrismaMock();
    notifications = { create: jest.fn().mockResolvedValue({ id: 'n1' }) };
    notificationUsers = { publishManyNotifications: jest.fn() };
    service = new ExponatsService(
      prisma as any,
      notifications as any,
      notificationUsers as any,
    );
  });
  afterEach(() => jest.restoreAllMocks());

  describe('create', () => {
    const dto = (extra: any = {}) =>
      ({
        name: 'Fox',
        alternateName: 'Vulpes',
        description: 'd',
        authorId: 'o1',
        ExponatKind: 'ANIMAL',
        ...extra,
      }) as any;

    const created = {
      id: 'e1',
      name: 'Fox',
      alternateName: 'Vulpes',
      mainImage: 'm',
    };

    it('approves immediately and notifies everyone for org admins', async () => {
      actor('USER', 'ADMIN');
      prisma.exponat.create.mockResolvedValue({
        ...created,
        Organisation: { id: 'o1', name: 'Org' },
      });
      prisma.organisation.findFirst.mockResolvedValue({
        id: 'o1',
        name: 'Org',
        OrganisationUsers: [{ userId: 'a' }, { userId: 'b' }],
      });

      await service.create(dto(), 'me');

      expect(prisma.exponat.create.mock.calls[0][0].data.isApproved).toBe(true);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'EXPONAT_BY_FOLLOWED_ORGANISATION' }),
        ['a', 'b'],
      );
      expect(notificationUsers.publishManyNotifications).toHaveBeenCalledWith(
        ['a', 'b'],
        { id: 'n1' },
      );
    });

    it('super users are approved even without a membership', async () => {
      actor('SUPER', null);
      prisma.exponat.create.mockResolvedValue(created);
      prisma.organisation.findFirst.mockResolvedValue({
        id: 'o1',
        name: 'Org',
        OrganisationUsers: [],
      });
      await service.create(dto(), 'me');
      expect(prisma.exponat.create.mock.calls[0][0].data.isApproved).toBe(true);
    });

    it('plain members create unapproved exponats and only notify owners/admins', async () => {
      actor('USER', 'MEMBER');
      prisma.exponat.create.mockResolvedValue({
        ...created,
        Organisation: { id: 'o1', name: 'Org' },
      });
      prisma.organisation.findFirst.mockResolvedValue({
        id: 'o1',
        name: 'Org',
        OrganisationUsers: [{ userId: 'boss' }],
      });

      await service.create(dto(), 'me');

      expect(prisma.exponat.create.mock.calls[0][0].data.isApproved).toBe(
        false,
      );
      expect(
        prisma.organisation.findFirst.mock.calls[0][0].include.OrganisationUsers
          .where,
      ).toEqual({
        OR: [{ role: 'OWNER' }, { role: 'ADMIN' }],
      });
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'NEW_EXPONAT_REQUEST' }),
        ['boss'],
      );
    });

    it('connects categorization and authorship info only when provided', async () => {
      actor('SUPER', null);
      prisma.exponat.create.mockResolvedValue(created);
      prisma.organisation.findFirst.mockResolvedValue({
        OrganisationUsers: [],
      });

      await service.create(dto(), 'me');
      let data = prisma.exponat.create.mock.calls[0][0].data;
      expect(data.Categorization).toBeUndefined();
      expect(data.AuthorshipInfo).toBeUndefined();
      expect(data.Organisation).toEqual({ connect: { id: 'o1' } });

      await service.create(
        dto({ categorizationId: 'c1', authorshipInfoId: 'ai1' }),
        'me',
      );
      data = prisma.exponat.create.mock.calls[1][0].data;
      expect(data.Categorization).toEqual({ connect: { id: 'c1' } });
      expect(data.AuthorshipInfo).toEqual({ connect: { id: 'ai1' } });
    });

    it('rejects a non member with UnauthorizedException', async () => {
      actor('USER', null);
      await expect(service.create(dto(), 'me')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('discoverExponats', () => {
    it('uses the anonymous query without a user id', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 'x' }]);
      await expect(service.discoverExponats(1, 5)).resolves.toEqual([
        { id: 'x' },
      ]);
      expect(prisma.$queryRaw.mock.calls[0].slice(1)).toEqual([5, 5, 1]);
    });

    it('uses the personalised query with a user id', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      await service.discoverExponats(2, 5, 'u1');
      expect(prisma.$queryRaw.mock.calls[0].slice(1)).toContain('u1');
    });

    it('defaults page to 1', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      await service.discoverExponats(undefined, 7);
      expect(prisma.$queryRaw.mock.calls[0].slice(1)).toEqual([7, 7, 1]);
    });
  });

  describe('findAll', () => {
    it('combines filter, approval, ordering and pagination', async () => {
      await service.findAll(
        { name: 'fox', organisationId: 'o1' } as any,
        { attribute: 'favourites', direction: 'desc' } as any,
        { page: 3, size: 10 },
        true,
      );
      const arg = prisma.exponat.findMany.mock.calls[0][0];
      expect(arg.where).toMatchObject({
        organisationId: 'o1',
        isApproved: true,
      });
      expect(arg.orderBy).toEqual({ FavouriteExponats: { _count: 'desc' } });
      expect(arg.skip).toBe(20);
      expect(arg.take).toBe(10);
    });

    it('falls back to name relevance when no sort is given', async () => {
      await service.findAll({ name: 'fox' } as any);
      expect(
        prisma.exponat.findMany.mock.calls[0][0].orderBy._relevance,
      ).toBeDefined();
    });
  });

  describe('checkUserRole', () => {
    it('is false for unknown exponats', async () => {
      prisma.exponat.findFirst.mockResolvedValue(null);
      await expect(service.checkUserRole('u', 'e')).resolves.toBe(false);
    });

    it.each([
      ['USER', 'ADMIN', true],
      ['USER', 'OWNER', true],
      ['USER', 'MEMBER', false],
      ['SUPER', null, true],
    ])('global=%s member=%s -> %s', async (g, m, expected) => {
      prisma.exponat.findFirst.mockResolvedValue({ organisationId: 'o1' });
      actor(g, m);
      await expect(service.checkUserRole('u', 'e')).resolves.toBe(expected);
    });
  });

  describe('findOne', () => {
    it('constrains to approved items and posts when approval is set', async () => {
      await service.findOne('e1', true);
      const arg = prisma.exponat.findUniqueOrThrow.mock.calls[0][0];
      expect(arg.where).toEqual({ id: 'e1', isApproved: true });
      expect(arg.include.Posts.where).toEqual({ isApproved: true });
    });

    it('does not constrain without approval', async () => {
      await service.findOne('e1');
      const arg = prisma.exponat.findUniqueOrThrow.mock.calls[0][0];
      expect(arg.where).toEqual({ id: 'e1' });
      expect(arg.include.Posts.where).toEqual({});
    });
  });

  describe('update', () => {
    it('404s for unknown exponats', async () => {
      prisma.exponat.findFirst.mockResolvedValue(null);
      await expect(service.update('e', {} as any, 'u')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('401s for plain members', async () => {
      prisma.exponat.findFirst.mockResolvedValue({ organisationId: 'o1' });
      actor('USER', 'MEMBER');
      await expect(service.update('e', {} as any, 'u')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.exponat.update).not.toHaveBeenCalled();
    });

    it('updates for org admins', async () => {
      prisma.exponat.findFirst.mockResolvedValue({ organisationId: 'o1' });
      actor('USER', 'ADMIN');
      await service.update('e', { name: 'new' } as any, 'u');
      expect(prisma.exponat.update).toHaveBeenCalledWith({
        where: { id: 'e' },
        data: { name: 'new' },
      });
    });

    it('401s (not 500) for users who are not members at all', async () => {
      prisma.exponat.findFirst.mockResolvedValue({ organisationId: 'o1' });
      actor('USER', null);
      await expect(service.update('e', {} as any, 'u')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  it('remove deletes by id', async () => {
    await service.remove('e1');
    expect(prisma.exponat.delete).toHaveBeenCalledWith({ where: { id: 'e1' } });
  });

  describe('changeApprovalStatus', () => {
    const current = (over: any = {}) => ({
      id: 'e1',
      name: 'Fox',
      mainImage: 'm',
      organisationId: 'o1',
      isApproved: false,
      IsNotificationMade: false,
      Organisation: { name: 'Org', OrganisationUsers: [{ userId: 'a' }] },
      ...over,
    });

    it('404s for unknown exponats', async () => {
      prisma.exponat.findFirst.mockResolvedValue(null);
      await expect(
        service.changeApprovalStatus('e', 'u'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('401s for plain members', async () => {
      prisma.exponat.findFirst.mockResolvedValue(current());
      actor('USER', 'MEMBER');
      await expect(
        service.changeApprovalStatus('e', 'u'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.exponat.update).not.toHaveBeenCalled();
    });

    it('first approval notifies once and marks the notification as made', async () => {
      prisma.exponat.findFirst.mockResolvedValue(current());
      actor('USER', 'ADMIN');
      await service.changeApprovalStatus('e1', 'u');

      expect(notifications.create).toHaveBeenCalledTimes(1);
      const updates = prisma.exponat.update.mock.calls.map((c) => c[0].data);
      expect(updates).toEqual([
        { IsNotificationMade: true },
        { isApproved: true },
      ]);
    });

    it('does not notify again when a notification was already made', async () => {
      prisma.exponat.findFirst.mockResolvedValue(
        current({ IsNotificationMade: true }),
      );
      actor('USER', 'ADMIN');
      await service.changeApprovalStatus('e1', 'u');
      expect(notifications.create).not.toHaveBeenCalled();
      expect(prisma.exponat.update.mock.calls.map((c) => c[0].data)).toEqual([
        { isApproved: true },
      ]);
    });

    it('un-approving flips the flag without notifying', async () => {
      prisma.exponat.findFirst.mockResolvedValue(
        current({ isApproved: true, IsNotificationMade: true }),
      );
      actor('USER', 'OWNER');
      await service.changeApprovalStatus('e1', 'u');
      expect(notifications.create).not.toHaveBeenCalled();
      expect(prisma.exponat.update).toHaveBeenCalledWith({
        where: { id: 'e1' },
        data: { isApproved: false },
      });
    });
  });

  describe('lookups', () => {
    it('findExponatByPostId returns the exponat id or null', async () => {
      prisma.post.findFirst.mockResolvedValueOnce({ ExponatId: 'e9' });
      prisma.post.findFirst.mockResolvedValueOnce(null);
      await expect(service.findExponatByPostId('p')).resolves.toBe('e9');
      await expect(service.findExponatByPostId('p')).resolves.toBeNull();
    });

    it('getIdBySerialNumber returns the id or 404s', async () => {
      prisma.exponat.findFirst.mockResolvedValueOnce({ id: 'e5' });
      prisma.exponat.findFirst.mockResolvedValueOnce(null);
      await expect(service.getIdBySerialNumber(5)).resolves.toBe('e5');
      expect(prisma.exponat.findFirst).toHaveBeenCalledWith({
        where: { serialNumber: 5 },
      });
      await expect(service.getIdBySerialNumber(6)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
