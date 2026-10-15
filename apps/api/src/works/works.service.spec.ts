import { SortingEnum, SortType } from '@biosfera/types';
import { WorksService } from './works.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('WorksService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: WorksService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new WorksService(prisma as any);
  });

  it.each([
    [{ id: 'm' }, true],
    [null, false],
  ])(
    'checkMembership excludes pending requests (%p -> %s)',
    async (row, expected) => {
      prisma.organisationUser.findFirst.mockResolvedValue(row);
      await expect(service.checkMembership('u', 'o')).resolves.toBe(expected);
      expect(prisma.organisationUser.findFirst).toHaveBeenCalledWith({
        where: { organisationId: 'o', userId: 'u', NOT: { role: 'REQUESTED' } },
      });
    },
  );

  it('create whitelists the persisted fields', async () => {
    prisma.work.create.mockResolvedValue({ id: 'w' });
    await service.create({
      description: 'd',
      type: 'PAPER',
      title: 't',
      document: 'doc',
      presentation: 'pres',
      poster: 'p',
      authorId: 'a',
      tags: ['x'],
      organisationId: 'o',
      isApproved: true,
      approvedBy: 'someone',
    } as any);
    const data = prisma.work.create.mock.calls[0][0].data;
    expect(data).toEqual({
      description: 'd',
      type: 'PAPER',
      title: 't',
      document: 'doc',
      presentation: 'pres',
      poster: 'p',
      authorId: 'a',
      tags: ['x'],
      organisationId: 'o',
    });
  });

  describe('findAll', () => {
    it('applies filters and defaults approval to true', async () => {
      await service.findAll({
        title: 'Bears',
        authorId: 'a',
        approvedBy: 'b',
        organisationId: 'o',
        tags: ['x', 'y'],
        type: 'PAPER',
      } as any);
      expect(prisma.work.findMany.mock.calls[0][0].where).toEqual({
        title: 'Bears',
        authorId: 'a',
        approvedBy: 'b',
        organisationId: 'o',
        tags: { hasSome: ['x', 'y'] },
        isApproved: true,
        type: 'PAPER',
      });
    });

    it('does not constrain approval when approval=false', async () => {
      await service.findAll({} as any, undefined, undefined, false);
      expect(prisma.work.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('paginates and sorts', async () => {
      await service.findAll(
        {} as any,
        { attribute: SortingEnum.TITLE, direction: SortType.DESCENDING },
        { page: 2, size: 3 },
      );
      const arg = prisma.work.findMany.mock.calls[0][0];
      expect(arg.orderBy).toEqual({ title: 'desc' });
      expect(arg.skip).toBe(3);
      expect(arg.take).toBe(3);
    });

    it('orders title searches by relevance', async () => {
      await service.findAll({ title: 'brown bear' } as any);
      expect(prisma.work.findMany.mock.calls[0][0].orderBy._relevance).toEqual({
        fields: ['title'],
        search: 'brown <-> bear',
        sort: 'desc',
      });
    });
  });

  it('findOne only returns approved works by default', async () => {
    await service.findOne('w');
    await service.findOne('w', false);
    expect(prisma.work.findFirst.mock.calls[0][0].where).toEqual({
      id: 'w',
      isApproved: true,
    });
    expect(prisma.work.findFirst.mock.calls[1][0].where).toEqual({ id: 'w' });
  });

  it('update / remove address the work by id', async () => {
    await service.update('w', { title: 'n' } as any);
    await service.remove('w');
    expect(prisma.work.update).toHaveBeenCalledWith({
      where: { id: 'w' },
      data: { title: 'n' },
    });
    expect(prisma.work.delete).toHaveBeenCalledWith({ where: { id: 'w' } });
  });

  it.each([
    [{ id: 'm' }, true],
    [null, false],
  ])('checkIsAdmin: %p -> %s', async (row, expected) => {
    prisma.organisationUser.findFirst.mockResolvedValue(row);
    await expect(service.checkIsAdmin('u', 'o')).resolves.toBe(expected);
    expect(prisma.organisationUser.findFirst.mock.calls[0][0].where.OR).toEqual(
      [{ role: 'ADMIN' }, { role: 'OWNER' }],
    );
  });

  describe('checkRights', () => {
    it('the author always has rights', async () => {
      prisma.work.findFirst.mockResolvedValue({
        authorId: 'u',
        organisationId: 'o',
      });
      await expect(service.checkRights('u', 'w')).resolves.toBe(true);
    });

    // SECURITY BUG: `checkSuper` / `checkAdmin` are Promises that are never
    // awaited, and the user lookup is not constrained to role SUPER, so the
    // method returns a (truthy) Promise for every non-author.
    it.failing(
      'denies a user who is neither author, admin nor super',
      async () => {
        prisma.work.findFirst.mockResolvedValue({
          authorId: 'author',
          organisationId: 'o',
        });
        prisma.user.findFirst.mockResolvedValue({ id: 'u', role: 'USER' });
        prisma.organisationUser.findFirst.mockResolvedValue(null);
        const result = await service.checkRights('u', 'w');
        expect(result).toBeFalsy();
      },
    );

    it.failing('grants organisation admins', async () => {
      prisma.work.findFirst.mockResolvedValue({
        authorId: 'author',
        organisationId: 'o',
      });
      prisma.user.findFirst.mockResolvedValue({ id: 'u', role: 'USER' });
      prisma.organisationUser.findFirst.mockResolvedValue({ role: 'ADMIN' });
      expect(await service.checkRights('u', 'w')).toBe(true);
    });
  });

  describe('approval', () => {
    it('toggleApproval approves unapproved works and records the approver', async () => {
      prisma.work.findFirst.mockResolvedValue({ isApproved: false });
      await service.toggleApproval('w', 'boss');
      expect(prisma.work.update).toHaveBeenCalledWith({
        where: { id: 'w' },
        data: { isApproved: true, approvedBy: 'boss' },
      });
    });

    it('toggleApproval disapproves approved works and clears the approver', async () => {
      prisma.work.findFirst.mockResolvedValue({ isApproved: true });
      await service.toggleApproval('w', 'boss');
      expect(prisma.work.update).toHaveBeenCalledWith({
        where: { id: 'w' },
        data: { isApproved: false, approvedBy: null },
      });
    });
  });
});
