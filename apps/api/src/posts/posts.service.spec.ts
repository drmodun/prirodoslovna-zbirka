import { InternalServerErrorException } from '@nestjs/common';
import { SortingEnum, SortType } from '@biosfera/types';
import { PostsService } from './posts.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('PostsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { create: jest.Mock };
  let notificationUsers: {
    publishNotification: jest.Mock;
    publishManyNotifications: jest.Mock;
  };
  let follows: { getFollowers: jest.Mock };
  let service: PostsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    notifications = { create: jest.fn().mockResolvedValue({ id: 'n1' }) };
    notificationUsers = {
      publishNotification: jest.fn(),
      publishManyNotifications: jest.fn(),
    };
    follows = { getFollowers: jest.fn().mockResolvedValue([]) };
    service = new PostsService(
      prisma as any,
      notifications as any,
      notificationUsers as any,
      follows as any,
    );
  });

  describe('discover', () => {
    it('anonymous and personalised variants bind their parameters', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      await service.discover(2, 5);
      await service.discover(2, 5, 'u1');
      expect(prisma.$queryRaw.mock.calls[0].slice(1)).toEqual([5, 5, 2]);
      expect(prisma.$queryRaw.mock.calls[1].slice(1)).toContain('u1');
    });

    it('wraps database errors in a 500', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('db'));
      await expect(service.discover(1, 1)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  it('findAllWithoutApproval lists unapproved posts of one organisation', async () => {
    await service.findAllWithoutApproval('o1');
    expect(prisma.post.findMany.mock.calls[0][0].where).toEqual({
      isApproved: false,
      Exponat: { organisationId: 'o1' },
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      prisma.exponat.findMany.mockResolvedValue([{ id: 'e1' }, { id: 'e2' }]);
    });

    it('hides unapproved posts from non admins', async () => {
      await service.findAll({ isAdmin: false } as any);
      expect(prisma.post.findMany.mock.calls[0][0].where.isApproved).toBe(true);
    });

    it('shows everything to admins', async () => {
      await service.findAll({ isAdmin: true } as any);
      expect(
        prisma.post.findMany.mock.calls[0][0].where.isApproved,
      ).toBeUndefined();
    });

    it('applies scalar filters', async () => {
      await service.findAll({
        isAdmin: true,
        userId: 'u',
        exponatId: 'e',
        userName: 'Ana',
        exponatName: 'Fox',
        title: 'red fox',
      } as any);
      const { where } = prisma.post.findMany.mock.calls[0][0];
      expect(where).toMatchObject({
        authorId: 'u',
        ExponatId: 'e',
        author: { firstName: 'Ana' },
        Exponat: { name: 'Fox' },
        title: { search: 'red | fox', mode: 'insensitive' },
      });
    });

    it('translates pagination to skip/take', async () => {
      await service.findAll({ page: 3, size: 7 } as any);
      const arg = prisma.post.findMany.mock.calls[0][0];
      expect(arg.skip).toBe(14);
      expect(arg.take).toBe(7);
    });

    it('uses explicit sorting before relevance', async () => {
      await service.findAll({
        title: 'x',
        attribute: SortingEnum.TITLE,
        direction: SortType.ASCENDING,
      } as any);
      expect(prisma.post.findMany.mock.calls[0][0].orderBy).toEqual({
        title: 'asc',
      });
    });

    it('orders by relevance for title searches', async () => {
      await service.findAll({ title: 'red fox' } as any);
      expect(prisma.post.findMany.mock.calls[0][0].orderBy._relevance).toEqual({
        fields: ['title'],
        search: 'red <-> fox',
        sort: 'desc',
      });
    });

    it('filters by the exponats of an organisation on ExponatId', async () => {
      await service.findAll({ organisationId: 'o1' } as any);
      expect(prisma.exponat.findMany.mock.calls[0][0].where).toEqual({
        organisationId: 'o1',
      });
      expect(prisma.post.findMany.mock.calls[0][0].where.ExponatId).toEqual({
        in: ['e1', 'e2'],
      });
    });
  });

  describe('create', () => {
    const dto = (isAdmin: boolean) =>
      ({
        title: 'T',
        text: 'body',
        authorId: 'author',
        ExponatId: 'e1',
        isAdmin,
      }) as any;

    it('admin posts are approved and notify the followers', async () => {
      prisma.post.create.mockResolvedValue({
        id: 'p1',
        authorId: 'author',
        title: 'T',
        text: 'body',
        thumbnailImage: 't',
      });
      follows.getFollowers.mockResolvedValue([
        { followerId: 'f1' },
        { followerId: 'f2' },
      ]);

      await service.create(dto(true));

      expect(prisma.post.create.mock.calls[0][0].data.isApproved).toBe(true);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'POST_BY_FOLLOWED_ACCOUNT' }),
        ['f1', 'f2'],
      );
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { IsNotificationMade: true },
      });
    });

    it('member posts are unapproved and notify the owners/admins only', async () => {
      prisma.post.create.mockResolvedValue({
        id: 'p1',
        authorId: 'author',
        title: 'T',
        text: 'body',
      });
      prisma.exponat.findUnique.mockResolvedValue({ organisationId: 'o1' });
      prisma.organisationUser.findMany.mockResolvedValue([{ userId: 'boss' }]);

      await service.create(dto(false));

      expect(prisma.post.create.mock.calls[0][0].data.isApproved).toBe(false);
      expect(prisma.organisationUser.findMany.mock.calls[0][0].where).toEqual({
        organisationId: 'o1',
        OR: [{ role: 'OWNER' }, { role: 'ADMIN' }],
      });
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'NEW_POST_REQUEST' }),
        ['boss'],
      );
      expect(follows.getFollowers).not.toHaveBeenCalled();
    });
  });

  it('update / remove address the post by id', async () => {
    await service.update('p', { title: 'n' } as any);
    await service.remove('p');
    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: 'p' },
      data: { title: 'n' },
    });
    expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: 'p' } });
  });

  it.each([
    ['u1', true],
    ['u2', false],
  ])('checkValidity: author u1 vs %s -> %s', async (user, expected) => {
    prisma.post.findUnique.mockResolvedValue({ authorId: 'u1' });
    await expect(service.checkValidity('p', user)).resolves.toBe(expected);
  });

  describe('findOne', () => {
    it('restricts to approved posts when approval is set', async () => {
      await service.findOne('p', true);
      expect(prisma.post.findFirstOrThrow.mock.calls[0][0].where).toEqual({
        id: 'p',
        isApproved: true,
      });
    });
    it('does not restrict otherwise', async () => {
      await service.findOne('p');
      expect(prisma.post.findFirstOrThrow.mock.calls[0][0].where).toEqual({
        id: 'p',
      });
    });
  });

  describe('notifications', () => {
    const post = (over: any = {}) =>
      ({
        id: 'p1',
        title: 'Title',
        text: 'short text',
        thumbnailImage: 'thumb',
        ...over,
      }) as any;

    it.each([
      [true, 'odobrena'],
      [false, 'odbijena'],
    ])(
      'approval notification for isApproved=%s says %s',
      async (flag, word) => {
        await service.makeApprovalNotification(
          post({ isApproved: flag }),
          'u1',
        );
        expect(notifications.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'POST_APPROVAL',
            text: expect.stringContaining(word),
          }),
          ['u1'],
        );
        expect(notificationUsers.publishNotification).toHaveBeenCalledWith(
          'u1',
          {
            id: 'n1',
          },
        );
      },
    );

    it('new post notification keeps short text intact', async () => {
      await service.makeNewPostNotification('u', post(), ['f']);
      expect(notifications.create.mock.calls[0][0].text).toBe('short text');
    });

    it('new post notification truncates text over 20 words', async () => {
      const text = Array.from({ length: 30 }, (_, i) => `w${i}`).join(' ');
      await service.makeNewPostNotification('u', post({ text }), ['f']);
      const sent = notifications.create.mock.calls[0][0].text;
      expect(sent.endsWith('...')).toBe(true);
      expect(sent.replace('...', '').split(' ')).toHaveLength(20);
    });

    it('new post request notification targets the given admins', async () => {
      await service.makeNewPostRequestNotification(post(), 'author', ['a1']);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'NEW_POST_REQUEST' }),
        ['a1'],
      );
    });
  });

  describe('toggleApproval', () => {
    const stored = (over: any = {}) => ({
      id: 'p1',
      title: 'T',
      text: 'x',
      isApproved: false,
      IsNotificationMade: false,
      author: { id: 'au', username: 'ana' },
      ...over,
    });

    it('notifies the author with the NEW state and flips the flag', async () => {
      prisma.post.findUnique.mockResolvedValue(stored());
      await service.toggleApproval('p1');

      expect(notifications.create.mock.calls[0][0]).toMatchObject({
        type: 'POST_APPROVAL',
        text: expect.stringContaining('odobrena'),
      });
      expect(prisma.post.update).toHaveBeenLastCalledWith({
        where: { id: 'p1' },
        data: { isApproved: true },
      });
    });

    it('first approval also notifies the author followers', async () => {
      prisma.post.findUnique.mockResolvedValue(stored());
      follows.getFollowers.mockResolvedValue([{ followerId: 'f1' }]);
      await service.toggleApproval('p1');
      expect(follows.getFollowers).toHaveBeenCalledWith('au');
      expect(notificationUsers.publishManyNotifications).toHaveBeenCalledWith(
        ['f1'],
        { id: 'n1' },
      );
    });

    it('does not re-notify followers when a notification was already made', async () => {
      prisma.post.findUnique.mockResolvedValue(
        stored({ IsNotificationMade: true }),
      );
      await service.toggleApproval('p1');
      expect(follows.getFollowers).not.toHaveBeenCalled();
    });

    it('un-approving tells the author and skips followers', async () => {
      prisma.post.findUnique.mockResolvedValue(stored({ isApproved: true }));
      await service.toggleApproval('p1');
      expect(notifications.create.mock.calls[0][0].text).toContain('odbijena');
      expect(follows.getFollowers).not.toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { isApproved: false },
      });
    });
  });
});
