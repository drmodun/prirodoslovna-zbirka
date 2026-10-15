import { UnauthorizedException } from '@nestjs/common';
import { OrganisationsController } from './organisations.controller';

const date = new Date('2024-02-02T00:00:00Z');
const org = (over: any = {}) => ({
  id: 'o1',
  name: 'Org',
  location: 'ZAGREB',
  websiteUrl: 'w',
  mainImage: 'm',
  description: 'd',
  email: 'o@x.hr',
  isApproved: true,
  createdAt: date,
  updatedAt: date,
  _count: { UserOrganisationFollowers: 3, OrganisationUsers: 2, Exponats: 1 },
  Exponats: [
    {
      id: 'e1',
      name: 'Ex',
      alternateName: 'alt',
      description: 'ed',
      mainImage: 'em',
      ExponatKind: 'ANIMAL',
      isApproved: true,
      updatedAt: date,
      _count: { FavouriteExponats: 4, Posts: 1 },
      Posts: [
        {
          id: 'p1',
          title: 'Post',
          authorId: 'u1',
          ExponatId: 'e1',
          thumbnailImage: 't',
          isApproved: true,
          updatedAt: date,
          author: { username: 'ana' },
          _count: { Likes: 2 },
        },
      ],
    },
    {
      id: 'e2',
      name: 'Ex2',
      _count: { FavouriteExponats: 6, Posts: 0 },
      Posts: [],
    },
  ],
  OrganisationPosts: [
    {
      id: 's1',
      title: 'Social',
      text: 'txt',
      images: [],
      type: 'NEWS',
      createdAt: date,
      updatedAt: date,
      isApproved: false,
      authorshipInfoId: 'ai',
      AuthorshipInfo: { id: 'ai' },
    },
  ],
  OrganisationUsers: [
    {
      role: 'OWNER',
      user: {
        id: 'u1',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.c',
        username: 'ana',
        hasProfileImage: true,
        _count: { followers: 5, Posts: 6 },
      },
    },
  ],
  ...over,
});

describe('OrganisationsController', () => {
  let svc: Record<string, jest.Mock>;
  let members: { hasAdminRights: jest.Mock };
  let controller: OrganisationsController;

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAllShort: jest.fn(),
      discover: jest.fn(),
      findOne: jest.fn(),
      getJoinRequests: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      changeApprovalStatus: jest.fn(),
    };
    members = { hasAdminRights: jest.fn() };
    controller = new OrganisationsController(svc as any, members as any);
  });

  it('create makes the caller the OWNER and returns a zeroed short response', async () => {
    svc.create.mockResolvedValue(org());
    const dto: any = { name: 'Org' };
    const res = await controller.create({ user: { id: 'me' } }, dto);

    expect(svc.create).toHaveBeenCalledWith(
      expect.objectContaining({
        OrganisationUsers: { create: [{ userId: 'me', role: 'OWNER' }] },
      }),
    );
    expect(res).toMatchObject({
      id: 'o1',
      exponatCount: 0,
      memberCount: 0,
      followerCount: 0,
      points: 0,
    });
  });

  describe('findAllShort', () => {
    it('restricts to approved organisations for non super users', async () => {
      svc.findAllShort.mockResolvedValue([]);
      await controller.findAllShort(
        { page: 1, size: 10 },
        undefined,
        {} as any,
        {
          user: { role: 'user' },
        },
      );
      expect(svc.findAllShort).toHaveBeenCalledWith(
        {},
        undefined,
        { page: 1, size: 10 },
        true,
      );
    });

    it('does not restrict for super users', async () => {
      svc.findAllShort.mockResolvedValue([]);
      await controller.findAllShort(undefined, undefined, {} as any, {
        user: { role: 'super' },
      });
      expect(svc.findAllShort.mock.calls[0][3]).toBe(false);
    });

    it('maps counts and points', async () => {
      svc.findAllShort.mockResolvedValue([org()]);
      const [res] = await controller.findAllShort(
        undefined,
        undefined,
        {} as any,
        {},
      );
      expect(res).toMatchObject({
        id: 'o1',
        exponatCount: 2,
        points: 10,
        followerCount: 3,
        memberCount: 2,
        isFavorite: false,
      });
    });
  });

  describe('discover', () => {
    it('forwards paging and the optional user id, defaulting missing counters', async () => {
      svc.discover.mockResolvedValue([
        {
          id: 'o1',
          name: 'Org',
          totalFavourites: { d: [12] },
          amountOfExponats: 3,
        },
        { id: 'o2' },
      ]);
      const res = await controller.discover(
        { page: 2, size: 5 },
        {
          user: { id: 'me' },
        },
      );
      expect(svc.discover).toHaveBeenCalledWith(2, 5, 'me');
      expect(res[0]).toMatchObject({ points: 12, exponatCount: 3 });
      expect(res[1]).toMatchObject({
        points: 0,
        exponatCount: 0,
        followerCount: 0,
        memberCount: 0,
      });
    });

    it('works anonymously', async () => {
      svc.discover.mockResolvedValue([]);
      await controller.discover({ page: 1, size: 10 }, {});
      expect(svc.discover).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('findOne', () => {
    it('anonymous visitors only see approved content', async () => {
      svc.findOne.mockResolvedValue(org());
      await controller.findOne('o1', {});
      expect(svc.findOne).toHaveBeenCalledWith('o1', true);
      expect(members.hasAdminRights).not.toHaveBeenCalled();
    });

    it('org admins see everything', async () => {
      svc.findOne.mockResolvedValue(org());
      members.hasAdminRights.mockResolvedValue(true);
      await controller.findOne('o1', { user: { id: 'me', role: 'user' } });
      expect(members.hasAdminRights).toHaveBeenCalledWith('me', 'o1');
      expect(svc.findOne).toHaveBeenCalledWith('o1', false);
    });

    it('super users skip the membership check', async () => {
      svc.findOne.mockResolvedValue(org());
      await controller.findOne('o1', { user: { id: 'me', role: 'super' } });
      expect(members.hasAdminRights).not.toHaveBeenCalled();
      expect(svc.findOne).toHaveBeenCalledWith('o1', false);
    });

    it('maps the full organisation', async () => {
      svc.findOne.mockResolvedValue(org());
      const res = await controller.findOne('o1', {});
      expect(res).toMatchObject({
        id: 'o1',
        followersAmount: 3,
        membersAmount: 2,
        points: 10,
        isFollowing: false,
      });
      expect(res.exponats).toHaveLength(2);
      expect(res.exponats[0]).toMatchObject({
        favouriteCount: 4,
        organizationName: 'Org',
      });
      expect(res.posts).toEqual([
        expect.objectContaining({
          id: 'p1',
          authorName: 'ana',
          exponatName: 'Ex',
          likeScore: 2,
          organisationId: 'o1',
        }),
      ]);
      expect(res.socialPosts[0]).toMatchObject({
        id: 's1',
        organisationName: 'Org',
      });
      expect(res.members[0]).toMatchObject({
        id: 'u1',
        role: 'OWNER',
        followerCount: 5,
        postCount: 6,
      });
    });
  });

  describe('authorisation of mutating routes', () => {
    const req = { user: { id: 'me', role: 'user' } };

    it('update / remove delegate to the service', async () => {
      members.hasAdminRights.mockResolvedValue(true);
      await controller.update('o1', { name: 'n' } as any, req);
      await controller.remove('o1', req);
      expect(svc.update).toHaveBeenCalledWith('o1', { name: 'n' });
      expect(svc.remove).toHaveBeenCalledWith('o1');
    });

    // SECURITY BUG: `hasAdminRights` is not awaited, so the Promise is always
    // truthy and the guard clause never triggers. Any authenticated user can
    // update/delete any organisation and read its join requests (with emails).
    // These tests assert the *intended* behaviour; `it.failing` keeps the
    // suite green until the missing `await` is added, then they must be
    // switched to plain `it`.
    it.failing('update refuses non admins', async () => {
      members.hasAdminRights.mockResolvedValue(false);
      const res = await controller.update('o1', {} as any, req);
      expect(res).toBeInstanceOf(UnauthorizedException);
      expect(svc.update).not.toHaveBeenCalled();
    });

    it.failing('remove refuses non admins', async () => {
      members.hasAdminRights.mockResolvedValue(false);
      const res = await controller.remove('o1', req);
      expect(res).toBeInstanceOf(UnauthorizedException);
      expect(svc.remove).not.toHaveBeenCalled();
    });

    it.failing('getRequests refuses non admins', async () => {
      members.hasAdminRights.mockResolvedValue(false);
      const res = await controller.getRequests('o1', req);
      expect(res).toBeInstanceOf(UnauthorizedException);
      expect(svc.getJoinRequests).not.toHaveBeenCalled();
    });

    it('getRequests returns the join requests for admins', async () => {
      members.hasAdminRights.mockResolvedValue(true);
      svc.getJoinRequests.mockResolvedValue([{ id: 'r' }]);
      await expect(controller.getRequests('o1', req)).resolves.toEqual([
        { id: 'r' },
      ]);
    });

    // SECURITY BUG: `PATCH :id/approval` has no guard, so anyone (even
    // unauthenticated) can toggle an organisation's approval.
    it.failing('approval toggle is protected by an auth guard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        OrganisationsController.prototype.changeApprovalStatus,
      );
      expect(guards?.length).toBeGreaterThan(0);
    });

    it('approval toggle delegates to the service', async () => {
      await controller.changeApprovalStatus('o1');
      expect(svc.changeApprovalStatus).toHaveBeenCalledWith('o1');
    });
  });
});
