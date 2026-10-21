import { SortingEnum, SortType } from '@biosfera/types';
import { OrganisationsService } from './organisations.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('OrganisationsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { create: jest.Mock };
  let notificationUsers: { publishManyNotifications: jest.Mock };
  let service: OrganisationsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    notifications = { create: jest.fn().mockResolvedValue({ id: 'n1' }) };
    notificationUsers = { publishManyNotifications: jest.fn() };
    service = new OrganisationsService(
      prisma as any,
      notifications as any,
      notificationUsers as any,
    );
  });

  it('create persists the dto', async () => {
    const dto = { name: 'Org' } as any;
    prisma.organisation.create.mockResolvedValue({ id: 'o' });
    await expect(service.create(dto)).resolves.toEqual({ id: 'o' });
    expect(prisma.organisation.create).toHaveBeenCalledWith({ data: dto });
  });

  describe('discover', () => {
    it('uses the anonymous query without a user', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 'a' }]);
      await expect(service.discover(2, 5)).resolves.toEqual([{ id: 'a' }]);
      const [strings, ...values] = prisma.$queryRaw.mock.calls[0];
      expect(strings.join('?')).not.toContain('UserOrganisationFollower" uo');
      expect(values).toEqual([5, 5, 2]); // limit size, offset size*(page-1)
    });

    it('uses the personalised query when a user is given', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      await service.discover(1, 10, 'user-1');
      const [strings, ...values] = prisma.$queryRaw.mock.calls[0];
      expect(strings.join('?')).toContain('UserOrganisationFollower" uo');
      expect(values).toEqual(['user-1', 'user-1', 10, 10, 1]);
    });
  });

  describe('findAllShort', () => {
    it('builds the filter, approval constraint and pagination', async () => {
      await service.findAllShort(
        { name: 'prirodo muzej', location: 'ZAGREB' } as any,
        undefined,
        { page: 2, size: 4 },
        true,
      );
      const arg = prisma.organisation.findMany.mock.calls[0][0];
      expect(arg.where).toEqual({
        name: { search: 'prirodo | muzej', mode: 'insensitive' },
        location: 'ZAGREB',
        isApproved: true,
      });
      expect(arg.skip).toBe(4);
      expect(arg.take).toBe(4);
      expect(arg.orderBy._relevance).toMatchObject({
        fields: ['name'],
        search: 'prirodo <-> muzej',
      });
    });

    it('does not constrain approval for admins (approval=false)', async () => {
      await service.findAllShort({} as any, undefined, undefined, false);
      expect(prisma.organisation.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('applies explicit sorting instead of relevance', async () => {
      await service.findAllShort({ name: 'x' } as any, {
        attribute: SortingEnum.NAME,
        direction: SortType.DESCENDING,
      });
      expect(prisma.organisation.findMany.mock.calls[0][0].orderBy).toEqual({
        name: 'desc',
      });
    });

    // KNOWN BUG (characterisation): `filter.name` has no optional chaining.
    it('throws when called with neither filter nor sorting', async () => {
      await expect(service.findAllShort()).rejects.toThrow(TypeError);
    });
  });

  describe('findOne', () => {
    it('hides unapproved content and pending requests when approval=true', async () => {
      await service.findOne('o1', true);
      const arg = prisma.organisation.findFirstOrThrow.mock.calls[0][0];
      expect(arg.where).toEqual({ id: 'o1', isApproved: true });
      expect(arg.include.Exponats.where).toEqual({ isApproved: true });
      expect(arg.include.Exponats.include.Posts.where).toEqual({
        isApproved: true,
      });
      expect(arg.include.OrganisationPosts.where).toEqual({ isApproved: true });
      expect(arg.include.OrganisationUsers.where).toEqual({
        role: { not: 'REQUESTED' },
      });
    });

    it('returns everything when approval is falsy', async () => {
      await service.findOne('o1', false);
      const arg = prisma.organisation.findFirstOrThrow.mock.calls[0][0];
      expect(arg.where).toEqual({ id: 'o1' });
      expect(arg.include.Exponats.where).toEqual({});
      expect(arg.include.OrganisationUsers.where).toEqual({});
    });

    it('propagates not-found errors', async () => {
      prisma.organisation.findFirstOrThrow.mockRejectedValue(new Error('nf'));
      await expect(service.findOne('x')).rejects.toThrow('nf');
    });
  });

  it('update / remove address the organisation by id', async () => {
    await service.update('o1', { name: 'n' } as any);
    await service.remove('o1');
    expect(prisma.organisation.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { name: 'n' },
    });
    expect(prisma.organisation.delete).toHaveBeenCalledWith({
      where: { id: 'o1' },
    });
  });

  describe('changeApprovalStatus', () => {
    const current = (isApproved: boolean) => ({
      id: 'o1',
      name: 'Org',
      mainImage: 'img',
      isApproved,
      OrganisationUsers: [{ userId: 'a' }, { userId: 'b' }],
    });

    it.each([
      [false, true],
      [true, false],
    ])('flips isApproved %s -> %s', async (before, after) => {
      prisma.organisation.findFirst.mockResolvedValue(current(before));
      await service.changeApprovalStatus('o1');
      expect(prisma.organisation.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: { isApproved: after },
      });
    });

    it('notifies the members/admins that were loaded', async () => {
      prisma.organisation.findFirst.mockResolvedValue(current(false));
      await service.changeApprovalStatus('o1');
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ORGANISATION_APPROVAL' }),
        ['a', 'b'],
      );
      expect(notificationUsers.publishManyNotifications).toHaveBeenCalledWith(
        ['a', 'b'],
        { id: 'n1' },
      );
    });

    it('only loads MEMBER and ADMIN users (owners are not notified)', async () => {
      prisma.organisation.findFirst.mockResolvedValue(current(false));
      await service.changeApprovalStatus('o1');
      const where =
        prisma.organisation.findFirst.mock.calls[0][0].include.OrganisationUsers
          .where;
      expect(where).toEqual({ OR: [{ role: 'MEMBER' }, { role: 'ADMIN' }] });
    });

    it('announces the approval when an unapproved organisation becomes approved', async () => {
      prisma.organisation.findFirst.mockResolvedValue(current(false));
      await service.changeApprovalStatus('o1');
      expect(notifications.create.mock.calls[0][0].messageKey).toBe(
        'organisationApproved',
      );
    });
  });

  it('getJoinRequests lists REQUESTED memberships with minimal user data', async () => {
    await service.getJoinRequests('o1');
    const arg = prisma.organisationUser.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ organisationId: 'o1', role: 'REQUESTED' });
    expect(arg.include.user.select).toEqual({
      firstName: true,
      lastName: true,
      email: true,
      id: true,
    });
  });

  describe('findOrganisationByExponatId', () => {
    it('returns the organisation id', async () => {
      prisma.exponat.findFirst.mockResolvedValue({ organisationId: 'o9' });
      await expect(service.findOrganisationByExponatId('e')).resolves.toBe(
        'o9',
      );
    });
    it('returns null for unknown exponats', async () => {
      prisma.exponat.findFirst.mockResolvedValue(null);
      await expect(
        service.findOrganisationByExponatId('e'),
      ).resolves.toBeNull();
    });
  });
});
