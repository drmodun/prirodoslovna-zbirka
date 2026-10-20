import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PostsController } from './posts.controller';

const date = new Date('2024-04-04T00:00:00Z');
const dbPost = (over: any = {}) => ({
  id: 'p1',
  title: 'Post',
  text: 'content',
  image: 'img',
  thumbnailImage: 'th',
  authorId: 'u1',
  ExponatId: 'e1',
  isApproved: true,
  updatedAt: date,
  author: {
    username: 'ana',
    firstName: 'Ana',
    lastName: 'Anić',
    hasProfileImage: true,
  },
  Exponat: { name: 'Fox', organisationId: 'o1' },
  AuthorshipInfo: { author: { firstName: 'A', lastName: 'B' } },
  _count: { Likes: 4 },
  ...over,
});

describe('PostsController', () => {
  let posts: Record<string, jest.Mock>;
  let members: Record<string, jest.Mock>;
  let orgs: Record<string, jest.Mock>;
  let exponats: Record<string, jest.Mock>;
  let controller: PostsController;
  const user = (role = 'user', id = 'me') => ({ user: { id, role } });

  beforeEach(() => {
    posts = {
      create: jest.fn(),
      findAll: jest.fn(),
      discover: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      toggleApproval: jest.fn(),
      checkValidity: jest.fn(),
      findAllWithoutApproval: jest.fn(),
    };
    members = {
      checkForMember: jest.fn(),
      hasAdminRights: jest.fn(),
      hasModerationRights: jest.fn(),
    };
    orgs = { findOrganisationByExponatId: jest.fn() };
    exponats = { findExponatByPostId: jest.fn() };
    controller = new PostsController(
      posts as any,
      members as any,
      orgs as any,
      exponats as any,
    );
  });

  describe('create', () => {
    it('rejects unknown exponats', async () => {
      orgs.findOrganisationByExponatId.mockResolvedValue(null);
      await expect(
        controller.create({} as any, 'e1', user()),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(posts.create).not.toHaveBeenCalled();
    });

    it('rejects non members', async () => {
      orgs.findOrganisationByExponatId.mockResolvedValue('o1');
      members.checkForMember.mockResolvedValue(null);
      members.hasAdminRights.mockResolvedValue(false);
      await expect(
        controller.create({} as any, 'e1', user()),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(posts.create).not.toHaveBeenCalled();
    });

    it('stamps author, exponat and admin flag server-side', async () => {
      orgs.findOrganisationByExponatId.mockResolvedValue('o1');
      members.checkForMember.mockResolvedValue({ id: 'm' });
      members.hasAdminRights.mockResolvedValue(true);
      const dto: any = {
        authorId: 'spoofed',
        ExponatId: 'spoofed',
        isAdmin: false,
      };

      await controller.create(dto, 'e1', user('user', 'me'));

      expect(posts.create).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: 'me',
          ExponatId: 'e1',
          isAdmin: true,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('merges paging and sorting into the filter', async () => {
      posts.findAll.mockResolvedValue([dbPost()]);
      const filter: any = {};
      const res = await controller.findAll(
        { page: 2, size: 5 },
        { attribute: 'title', direction: 'asc' } as any,
        filter,
        {},
      );
      expect(posts.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          size: 5,
          attribute: 'title',
          direction: 'asc',
        }),
      );
      expect(filter.isAdmin).toBeUndefined();
      expect(res[0]).toMatchObject({
        id: 'p1',
        authorName: 'ana',
        exponatName: 'Fox',
        likeScore: 4,
        organisationId: 'o1',
      });
    });

    it('super users see unapproved posts', async () => {
      posts.findAll.mockResolvedValue([]);
      const filter: any = {};
      await controller.findAll(undefined, undefined, filter, user('super'));
      expect(filter.isAdmin).toBe(true);
    });
  });

  it('discover maps SQL rows', async () => {
    posts.discover.mockResolvedValue([
      {
        id: 'p1',
        authorId: 'u1',
        authorName: 'ana',
        ExponatId: 'e1',
        exponatName: 'Fox',
        amountOfLikes: 9,
        organisationId: 'o1',
        hasProfileImage: true,
      },
    ]);
    const res = await controller.discover({ page: 1, size: 10 }, user());
    expect(posts.discover).toHaveBeenCalledWith(1, 10, 'me');
    expect(res[0]).toMatchObject({
      likeScore: 9,
      exponatId: 'e1',
      hasProfilePicture: true,
    });
  });

  describe('findOne', () => {
    it('maps the extended response', async () => {
      posts.findOne.mockResolvedValue(dbPost());
      const res: any = await controller.findOne('p1', {});
      expect(posts.findOne).toHaveBeenCalledWith('p1', true);
      expect(res).toMatchObject({
        id: 'p1',
        content: 'content',
        authorFullName: 'Ana Anić',
        likeScore: 4,
        organisationId: 'o1',
      });
      expect(res.authorshipInfo.authorName).toBe('A B');
    });

    it('shows a pending post to moderators of its organisation', async () => {
      posts.findOne.mockResolvedValue(dbPost());
      exponats.findExponatByPostId.mockResolvedValue('e1');
      orgs.findOrganisationByExponatId.mockResolvedValue('o1');
      posts.checkValidity.mockResolvedValue(false);
      members.hasModerationRights.mockResolvedValue(true);
      await controller.findOne('p1', user());
      expect(members.hasModerationRights).toHaveBeenCalledWith('me', 'o1');
      expect(posts.findOne).toHaveBeenCalledWith('p1', false);
    });

    it('shows a pending post to its author', async () => {
      posts.findOne.mockResolvedValue(dbPost());
      exponats.findExponatByPostId.mockResolvedValue('e1');
      orgs.findOrganisationByExponatId.mockResolvedValue('o1');
      posts.checkValidity.mockResolvedValue(true);
      members.hasModerationRights.mockResolvedValue(false);
      await controller.findOne('p1', user());
      expect(posts.findOne).toHaveBeenCalledWith('p1', false);
    });

    it('hides pending posts from other users', async () => {
      posts.findOne.mockResolvedValue(dbPost());
      exponats.findExponatByPostId.mockResolvedValue('e1');
      orgs.findOrganisationByExponatId.mockResolvedValue('o1');
      posts.checkValidity.mockResolvedValue(false);
      members.hasModerationRights.mockResolvedValue(false);
      await controller.findOne('p1', user());
      expect(posts.findOne).toHaveBeenCalledWith('p1', true);
    });
  });

  describe.each([
    ['update', 'update', (c: any, req: any) => c.update('p1', {}, req)],
    ['remove', 'remove', (c: any, req: any) => c.remove('p1', req)],
    [
      'toggleApproval',
      'toggleApproval',
      (c: any, req: any) => c.toggleApproval('p1', req),
    ],
  ] as const)('%s authorisation', (_name, serviceMethod, call) => {
    beforeEach(() => {
      exponats.findExponatByPostId.mockResolvedValue('e1');
      orgs.findOrganisationByExponatId.mockResolvedValue('o1');
    });

    it('rejects users who are neither author, admin nor super', async () => {
      posts.checkValidity.mockResolvedValue(false);
      members.hasModerationRights.mockResolvedValue(false);
      await expect(call(controller, user())).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(posts[serviceMethod]).not.toHaveBeenCalled();
    });

    it('allows organisation admins', async () => {
      posts.checkValidity.mockResolvedValue(false);
      members.hasModerationRights.mockResolvedValue(true);
      await call(controller, user());
      expect(members.hasModerationRights).toHaveBeenCalledWith('me', 'o1');
      expect(posts[serviceMethod]).toHaveBeenCalled();
    });

    it('allows super users', async () => {
      posts.checkValidity.mockResolvedValue(false);
      members.hasModerationRights.mockResolvedValue(false);
      await call(controller, user('super'));
      expect(posts[serviceMethod]).toHaveBeenCalled();
    });

    it('allows platform moderators (ADMIN)', async () => {
      posts.checkValidity.mockResolvedValue(false);
      members.hasModerationRights.mockResolvedValue(false);
      await call(controller, user('admin'));
      expect(posts[serviceMethod]).toHaveBeenCalled();
    });
  });

  it('authors may update and delete their own posts', async () => {
    exponats.findExponatByPostId.mockResolvedValue('e1');
    orgs.findOrganisationByExponatId.mockResolvedValue('o1');
    posts.checkValidity.mockResolvedValue(true);
    members.hasModerationRights.mockResolvedValue(false);
    await controller.update('p1', { title: 'n' } as any, user());
    await controller.remove('p1', user());
    expect(posts.update).toHaveBeenCalledWith('p1', { title: 'n' });
    expect(posts.remove).toHaveBeenCalledWith('p1');
  });

  it('plain authors cannot approve their own post', async () => {
    exponats.findExponatByPostId.mockResolvedValue('e1');
    orgs.findOrganisationByExponatId.mockResolvedValue('o1');
    posts.checkValidity.mockResolvedValue(true); // is the author
    members.hasModerationRights.mockResolvedValue(false);
    await expect(
      controller.toggleApproval('p1', user()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(posts.toggleApproval).not.toHaveBeenCalled();
  });

  describe('findAllNotApproved', () => {
    it('rejects non admins', async () => {
      members.hasModerationRights.mockResolvedValue(false);
      await expect(
        controller.findAllNotApproved('o1', user()),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(posts.findAllWithoutApproval).not.toHaveBeenCalled();
    });

    it('lists pending posts for admins with the approval flag', async () => {
      members.hasModerationRights.mockResolvedValue(true);
      posts.findAllWithoutApproval.mockResolvedValue([
        dbPost({ isApproved: false }),
      ]);
      const res = await controller.findAllNotApproved('o1', user());
      expect(res[0]).toMatchObject({
        isApproved: false,
        hasProfilePicture: true,
      });
    });

    it('lets super users through without membership', async () => {
      members.hasModerationRights.mockResolvedValue(false);
      posts.findAllWithoutApproval.mockResolvedValue([]);
      await expect(
        controller.findAllNotApproved('o1', user('super')),
      ).resolves.toEqual([]);
    });
  });

  it('findAllByOrganisation passes the admin flag to the service', async () => {
    members.hasModerationRights.mockResolvedValue(true);
    posts.findAll.mockResolvedValue([dbPost()]);
    const res = await controller.findAllByOrganisation('o1', user());
    expect(posts.findAll).toHaveBeenCalledWith({
      organisationId: 'o1',
      isAdmin: true,
    });
    expect(res).toHaveLength(1);
  });
});
