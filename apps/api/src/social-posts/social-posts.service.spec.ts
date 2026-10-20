import { UnauthorizedException } from '@nestjs/common';
import { SortingEnum, SortType } from '@biosfera/types';
import { SocialPostsService } from './social-posts.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('SocialPostsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { create: jest.Mock };
  let notificationUsers: { publishManyNotifications: jest.Mock };
  let service: SocialPostsService;

  /** membership role (or null) + global role of the acting user */
  const actor = (member: string | null, global = 'USER') => {
    prisma.organisationUser.findFirst.mockResolvedValue(
      member ? { role: member } : null,
    );
    prisma.user.findFirst.mockResolvedValue({ role: global });
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    notifications = { create: jest.fn().mockResolvedValue({ id: 'n1' }) };
    notificationUsers = { publishManyNotifications: jest.fn() };
    service = new SocialPostsService(
      prisma as any,
      notifications as any,
      notificationUsers as any,
    );
  });

  describe('checkForValidity', () => {
    it('allows organisation ADMINs', async () => {
      actor('ADMIN');
      await expect(service.checkForValidity('u', 'o')).resolves.toBe(true);
    });

    it('denies plain members', async () => {
      actor('MEMBER');
      await expect(service.checkForValidity('u', 'o')).resolves.toBe(false);
    });

    it('allows SUPER users who are not members', async () => {
      actor(null, 'SUPER');
      await expect(service.checkForValidity('u', 'o')).resolves.toBe(true);
    });

    it('throws Unauthorized for non members who are not SUPER', async () => {
      actor(null, 'USER');
      await expect(service.checkForValidity('u', 'o')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('allows organisation OWNERs', async () => {
      actor('OWNER');
      await expect(service.checkForValidity('u', 'o')).resolves.toBe(true);
    });
  });

  describe('create', () => {
    const dto = {
      text: 't',
      title: 'Najava',
      images: ['i'],
      authorshipInfoId: 'ai',
    } as any;
    const created = {
      id: 's1',
      title: 'Najava',
      organisation: {
        id: 'o1',
        name: 'Org',
        UserOrganisationFollowers: [{ userId: 'f1' }, { userId: 'f2' }],
      },
    };

    it('rejects unauthorised users before touching the database', async () => {
      actor('MEMBER');
      await expect(service.create(dto, 'o1', 'u')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.socialPost.create).not.toHaveBeenCalled();
    });

    it('stores the chosen type', async () => {
      actor('ADMIN');
      prisma.socialPost.create.mockResolvedValue(created);
      await service.create({ ...dto, type: 'EVENT' }, 'o', 'u');
      expect(prisma.socialPost.create.mock.calls[0][0].data.type).toBe('EVENT');
    });

    it('creates an approved post and notifies the organisation followers', async () => {
      actor('ADMIN');
      prisma.socialPost.create.mockResolvedValue(created);

      await expect(service.create(dto, 'o1', 'u')).resolves.toBe(created);

      const data = prisma.socialPost.create.mock.calls[0][0].data;
      expect(data).toMatchObject({
        isApproved: true,
        AuthorshipInfo: { connect: { id: 'ai' } },
        organisation: { connect: { id: 'o1' } },
      });
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NEW_SOCIAL_POST',
          link: '/social-posts/s1',
        }),
        ['f1', 'f2'],
      );
      expect(notificationUsers.publishManyNotifications).toHaveBeenCalledWith(
        ['f1', 'f2'],
        { id: 'n1' },
      );
    });
  });

  describe('findAll', () => {
    it('filters by title and approval, with pagination and sorting', async () => {
      await service.findAll(
        { title: 'T' } as any,
        { attribute: SortingEnum.TITLE, direction: SortType.ASCENDING },
        { page: 2, size: 5 },
        true,
      );
      const arg = prisma.socialPost.findMany.mock.calls[0][0];
      expect(arg.where).toEqual({ title: 'T', isApproved: true });
      expect(arg.orderBy).toEqual({ title: 'asc' });
      expect(arg.skip).toBe(5);
      expect(arg.take).toBe(5);
    });

    it('has no ordering without a sorting request', async () => {
      await service.findAll({} as any);
      expect(
        prisma.socialPost.findMany.mock.calls[0][0].orderBy,
      ).toBeUndefined();
    });

    it('does not let authorId overwrite the title filter', async () => {
      await service.findAll({ title: 'T', authorId: 'a' } as any);
      expect(prisma.socialPost.findMany.mock.calls[0][0].where.title).toBe('T');
    });
  });

  it('findOne restricts to approved posts when asked', async () => {
    await service.findOne('s', true);
    await service.findOne('s');
    expect(prisma.socialPost.findFirst.mock.calls[0][0].where).toEqual({
      id: 's',
      isApproved: true,
    });
    expect(prisma.socialPost.findFirst.mock.calls[1][0].where).toEqual({
      id: 's',
    });
  });

  describe('update / remove / changeApprovalStatus', () => {
    it('are rejected for plain members', async () => {
      actor('MEMBER');
      await expect(
        service.update({} as any, 's', 'u', 'o'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(service.remove('s', 'o', 'u')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(
        service.changeApprovalStatus('s', 'u', 'o'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.socialPost.update).not.toHaveBeenCalled();
      expect(prisma.socialPost.deleteMany).not.toHaveBeenCalled();
    });

    it('work for admins', async () => {
      actor('ADMIN');
      await service.update({ title: 'n' } as any, 's', 'u', 'o');
      await service.remove('s', 'o', 'u');
      // Scoped to the organisation the rights were checked for.
      expect(prisma.socialPost.update).toHaveBeenCalledWith({
        where: { id: 's', organisationId: 'o' },
        data: { title: 'n' },
      });
      expect(prisma.socialPost.deleteMany).toHaveBeenCalledWith({
        where: { id: 's', organisationId: 'o' },
      });
    });

    it('changeApprovalStatus flips the flag', async () => {
      actor('ADMIN');
      prisma.socialPost.findFirst.mockResolvedValue({ isApproved: true });
      await service.changeApprovalStatus('s', 'u', 'o');
      expect(prisma.socialPost.update).toHaveBeenCalledWith({
        where: { id: 's' },
        data: { isApproved: false },
      });
    });

    it('changeApprovalStatus returns false for unknown posts', async () => {
      actor('ADMIN');
      prisma.socialPost.findFirst.mockResolvedValue(null);
      await expect(service.changeApprovalStatus('s', 'u', 'o')).resolves.toBe(
        false,
      );
      expect(prisma.socialPost.update).not.toHaveBeenCalled();
    });
  });

  describe('checkForExistingValidity', () => {
    it('is false for unknown posts', async () => {
      prisma.socialPost.findFirst.mockResolvedValue(null);
      await expect(service.checkForExistingValidity('u', 's')).resolves.toBe(
        false,
      );
    });

    it('checks the owning organisation', async () => {
      prisma.socialPost.findFirst.mockResolvedValue({ organisationId: 'o9' });
      actor('ADMIN');
      await expect(service.checkForExistingValidity('u', 's')).resolves.toBe(
        true,
      );
      expect(prisma.organisationUser.findFirst).toHaveBeenCalledWith({
        where: { userId: 'u', organisationId: 'o9' },
      });
    });
  });
});
