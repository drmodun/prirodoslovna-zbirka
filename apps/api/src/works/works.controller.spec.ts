import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { WorksController } from './works.controller';

const date = new Date('2024-05-05T00:00:00Z');
const work = (over: any = {}) => ({
  id: 'w1',
  title: 'Title',
  description: 'd',
  document: 'doc',
  presentation: 'pres',
  poster: 'p',
  tags: ['t'],
  type: 'PAPER',
  authorId: 'a1',
  organisationId: 'o1',
  approvedBy: 'boss',
  isApproved: true,
  createdAt: date,
  updatedAt: date,
  author: { username: 'ana' },
  approver: { username: 'boss' },
  organisation: { name: 'Org' },
  _count: { SavedWorks: 2 },
  ...over,
});

describe('WorksController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: WorksController;
  const req = (role = 'user', id = 'me') => ({ user: { id, role } });

  beforeEach(() => {
    svc = {
      checkIsAdmin: jest.fn(),
      checkMembership: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      checkRights: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      toggleApproval: jest.fn(),
    };
    controller = new WorksController(svc as any);
  });

  describe('create', () => {
    it('rejects non members', async () => {
      svc.checkMembership.mockResolvedValue(false);
      svc.checkIsAdmin.mockResolvedValue(false);
      await expect(
        controller.create(req(), 'o1', {} as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(svc.create).not.toHaveBeenCalled();
    });

    it('stamps author and organisation from the request', async () => {
      svc.checkMembership.mockResolvedValue(true);
      svc.checkIsAdmin.mockResolvedValue(false);
      svc.create.mockResolvedValue({ id: 'w' });
      await controller.create(req('user', 'me'), 'o1', {
        authorId: 'spoofed',
      } as any);
      expect(svc.create).toHaveBeenCalledWith(
        expect.objectContaining({ authorId: 'me', organisationId: 'o1' }),
      );
    });

    it('super users are auto approved', async () => {
      svc.create.mockResolvedValue({ id: 'w' });
      svc.checkIsAdmin.mockResolvedValue(false);
      await controller.create(req('super', 'root'), 'o1', {} as any);
      expect(svc.create).toHaveBeenCalledWith(
        expect.objectContaining({ isApproved: true, approvedBy: 'root' }),
      );
      expect(svc.checkMembership).not.toHaveBeenCalled();
    });

    it('fails when the service returns nothing', async () => {
      svc.checkMembership.mockResolvedValue(true);
      svc.checkIsAdmin.mockResolvedValue(false);
      svc.create.mockResolvedValue(null);
      await expect(
        controller.create(req(), 'o1', {} as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    // SECURITY/MODERATION BUG: `checkIsAdmin` is not awaited so the Promise is
    // always truthy and every member's work is auto-approved.
    it.failing(
      'plain members do not get their works auto approved',
      async () => {
        svc.checkMembership.mockResolvedValue(true);
        svc.checkIsAdmin.mockResolvedValue(false);
        svc.create.mockResolvedValue({ id: 'w' });
        await controller.create(req(), 'o1', {} as any);
        const dto = svc.create.mock.calls[0][0];
        expect(dto.isApproved).toBeUndefined();
        expect(dto.approvedBy).toBeUndefined();
      },
    );
  });

  describe('findAll', () => {
    it('lists only approved works for regular visitors', async () => {
      svc.findAll.mockResolvedValue([]);
      await controller.findAll(req(), { page: 1, size: 10 }, undefined, {
        organisationId: 'o1',
      } as any);
      expect(svc.checkIsAdmin).toHaveBeenCalledWith('me', 'o1');
      expect(svc.findAll.mock.calls[0][3]).toBe(true);
    });

    it('lets organisation admins see unapproved works of their organisation', async () => {
      svc.checkIsAdmin.mockResolvedValue(true);
      svc.findAll.mockResolvedValue([]);
      await controller.findAll(req(), undefined, undefined, {
        organisationId: 'o1',
      } as any);
      expect(svc.findAll.mock.calls[0][3]).toBe(false);
    });

    it('does not run the admin check without an organisation filter', async () => {
      svc.findAll.mockResolvedValue([]);
      await controller.findAll(req(), undefined, undefined, {} as any);
      expect(svc.checkIsAdmin).not.toHaveBeenCalled();
      expect(svc.findAll.mock.calls[0][3]).toBe(true);
    });

    it('maps works to the short response', async () => {
      svc.findAll.mockResolvedValue([work()]);
      const [res] = await controller.findAll(
        {},
        undefined,
        undefined,
        {} as any,
      );
      expect(res).toMatchObject({
        id: 'w1',
        auhtorName: 'ana',
        organisationName: 'Org',
        amountOfSaves: 2,
        isApproved: true,
      });
    });
  });

  describe('findOne', () => {
    it('400s for unknown works', async () => {
      svc.findOne.mockResolvedValue(null);
      await expect(controller.findOne({}, 'w')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('hides unapproved works from users without rights', async () => {
      svc.findOne.mockResolvedValue(work({ isApproved: false }));
      svc.checkRights.mockResolvedValue(false);
      await expect(controller.findOne(req(), 'w1')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('shows unapproved works to users with rights', async () => {
      svc.findOne.mockResolvedValue(work({ isApproved: false }));
      svc.checkRights.mockResolvedValue(true);
      await expect(controller.findOne(req(), 'w1')).resolves.toMatchObject({
        id: 'w1',
      });
    });

    it('maps the extended response', async () => {
      svc.findOne.mockResolvedValue(work());
      const res = await controller.findOne(req(), 'w1');
      expect(res).toMatchObject({
        approvedById: 'boss',
        approvedByName: 'boss',
        auhtorName: 'ana',
        amountOfSaves: 2,
        firstPublicationDate: date,
        organisationName: 'Org',
      });
    });
  });

  describe.each([
    ['update', (c: any) => c.update(req(), 'w1', {}), 'update'],
    ['remove', (c: any) => c.remove(req(), 'w1'), 'remove'],
    ['approve', (c: any) => c.approve(req(), 'w1'), 'toggleApproval'],
  ] as const)('%s', (_n, call, method) => {
    it('rejects users without rights', async () => {
      svc.checkRights.mockResolvedValue(false);
      await expect(call(controller)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(svc[method]).not.toHaveBeenCalled();
    });

    it('delegates when permitted', async () => {
      svc.checkRights.mockResolvedValue(true);
      svc[method].mockResolvedValue({ id: 'w1' });
      await call(controller);
      expect(svc[method]).toHaveBeenCalled();
    });

    it('400s when the service yields nothing', async () => {
      svc.checkRights.mockResolvedValue(true);
      svc[method].mockResolvedValue(null);
      await expect(call(controller)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  it('approve records the acting user as approver', async () => {
    svc.checkRights.mockResolvedValue(true);
    svc.toggleApproval.mockResolvedValue({});
    await controller.approve(req('user', 'me'), 'w1');
    expect(svc.toggleApproval).toHaveBeenCalledWith('w1', 'me');
  });
});
