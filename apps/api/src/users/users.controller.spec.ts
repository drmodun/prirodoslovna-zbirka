import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { fullUserItem } from 'src/test-utils/fixtures';

describe('UsersController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: UsersController;

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateLanguage: jest.fn(),
      remove: jest.fn(),
      getJoinRequests: jest.fn(),
      uploadProfileImage: jest.fn(),
      verifyUser: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      resetPassword: jest.fn(),
    };
    controller = new UsersController(svc as any);
  });

  const as = (role: string, id = 'me') => ({ user: { id, role } });

  it('create returns only the new user id (never the hash)', async () => {
    svc.create.mockResolvedValue({ id: 'new', password: 'hash' });
    await expect(controller.create({} as any)).resolves.toBe('new');
  });

  it('findAll maps users to the short response and forwards params', async () => {
    svc.findAll.mockResolvedValue([
      {
        id: 'u',
        email: 'e',
        firstName: 'f',
        lastName: 'l',
        location: 'ZAGREB',
        username: 'un',
        password: 'secret',
        _count: { followers: 2, Posts: 5 },
      },
    ]);
    const page = { page: 1, size: 10 };
    const result = await controller.findAll(page, undefined, {
      name: 'x',
    } as any);

    expect(svc.findAll).toHaveBeenCalledWith({ name: 'x' }, undefined, page);
    expect(result).toEqual([
      {
        firstName: 'f',
        lastName: 'l',
        location: 'ZAGREB',
        followerCount: 2,
        postCount: 5,
        username: 'un',
        id: 'u',
      },
    ]);
  });

  it('getMyRequests sums favourites into points', async () => {
    svc.getJoinRequests.mockResolvedValue([
      { ...fullUserItem().OrganisationUser[0], role: 'REQUESTED' },
    ]);
    const [org] = await controller.getMyRequests(as('user', 'me'));
    expect(svc.getJoinRequests).toHaveBeenCalledWith('me');
    expect(org).toMatchObject({
      id: 'o1',
      points: 7,
      exponatCount: 1,
      memberCount: 2,
      followerCount: 3,
      role: 'REQUESTED',
    });
  });

  describe('findOne', () => {
    it('requests only approved content for non super users', async () => {
      svc.findOne.mockResolvedValue(fullUserItem());
      await controller.findOne('u1', { user: undefined });
      expect(svc.findOne).toHaveBeenCalledWith('u1', true);
    });

    it('requests everything for super users and exposes isApproved', async () => {
      svc.findOne.mockResolvedValue(fullUserItem());
      const res = await controller.findOne('u1', as('super'));
      expect(svc.findOne).toHaveBeenCalledWith('u1', false);
      expect(res.posts[0]).toHaveProperty('isApproved', false);
      expect(res.likedPosts[0]).toHaveProperty('isApproved', true);
    });

    it('platform moderators see pending content but not the e-mail', async () => {
      svc.findOne.mockResolvedValue(fullUserItem());
      const res = await controller.findOne('u1', as('admin'));
      expect(svc.findOne).toHaveBeenCalledWith('u1', false);
      expect(res.posts[0]).toHaveProperty('isApproved', false);
      expect(res).not.toHaveProperty('email');
    });

    it('hides isApproved from regular visitors', async () => {
      svc.findOne.mockResolvedValue(fullUserItem());
      const res = await controller.findOne('u1', as('user'));
      expect(res.posts[0]).not.toHaveProperty('isApproved');
    });

    it('maps the aggregate fields', async () => {
      svc.findOne.mockResolvedValue(fullUserItem());
      const res = await controller.findOne('u1', as('user'));
      expect(res).toMatchObject({
        id: 'u1',
        followerCount: 7,
        followingCount: 8,
        likeCount: 7, // 3 + 4 across posts
      });
      expect(res.posts[0].authorName).toBe('Ana Anić');
      expect(res.favouriteExponats[0]).toMatchObject({
        favouriteCount: 4,
        postCount: 2,
        isFavorite: true,
        organizationName: 'Org',
      });
      expect(res.memberships[0]).toMatchObject({ points: 7, role: 'ADMIN' });
      expect(res.works[0]).toMatchObject({ amountOfSaves: 3, isGbif: false });
      expect(res.savedWorks[0]).toMatchObject({ id: 'w1' });
      expect(res).not.toHaveProperty('password');
    });

    it('turns any failure into a 404', async () => {
      svc.findOne.mockRejectedValue(new Error('db down'));
      await expect(controller.findOne('x', as('user'))).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  it('remove and update act on the authenticated user, returning a boolean', async () => {
    svc.remove.mockResolvedValue({});
    svc.update.mockResolvedValue({});
    await expect(controller.remove(as('user', 'me'))).resolves.toBe(true);
    await expect(
      controller.update({ bio: 'b' } as any, as('user', 'me')),
    ).resolves.toBe(true);
    expect(svc.remove).toHaveBeenCalledWith('me');
    expect(svc.update).toHaveBeenCalledWith('me', { bio: 'b' });
  });

  it('updateLanguage saves the language of the authenticated user', async () => {
    svc.updateLanguage.mockResolvedValue({});
    await expect(
      controller.updateLanguage({ language: 'HR' } as any, as('user', 'me')),
    ).resolves.toBe(true);
    expect(svc.updateLanguage).toHaveBeenCalledWith('me', 'HR');
  });

  describe('admin-only routes', () => {
    it.each(['user', 'admin'])('adminUpdate rejects role %s', async (role) => {
      await expect(
        controller.adminUpdate('x', {} as any, as(role)),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(svc.update).not.toHaveBeenCalled();
    });

    it.each(['user', 'admin'])('adminDelete rejects role %s', async (role) => {
      await expect(
        controller.adminDelete('x', as(role)),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(svc.remove).not.toHaveBeenCalled();
    });

    it.each(['user', 'admin'])('getRequests rejects role %s', async (role) => {
      await expect(
        controller.getRequests('x', as(role)),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('super users can update, delete and read requests of others', async () => {
      svc.update.mockResolvedValue({});
      svc.remove.mockResolvedValue({});
      svc.getJoinRequests.mockResolvedValue([]);
      await expect(
        controller.adminUpdate('x', {} as any, as('super')),
      ).resolves.toBe(true);
      await expect(controller.adminDelete('x', as('super'))).resolves.toBe(
        true,
      );
      await expect(controller.getRequests('x', as('super'))).resolves.toEqual(
        [],
      );
      expect(svc.getJoinRequests).toHaveBeenCalledWith('x');
    });
  });

  it('addLogo uploads for the authenticated user', async () => {
    svc.uploadProfileImage.mockResolvedValue({ hasProfileImage: true });
    const file = {} as any;
    await expect(controller.addLogo(as('user', 'me'), file)).resolves.toEqual({
      hasProfileImage: true,
    });
    expect(svc.uploadProfileImage).toHaveBeenCalledWith('me', file);
  });

  it('verify / forgot / reset delegate to the service', async () => {
    svc.sendPasswordResetEmail.mockResolvedValue(undefined);
    await controller.verifyUser('code');
    await expect(controller.forgotPassword('a@b.c')).resolves.toBeUndefined();
    expect(svc.sendPasswordResetEmail).toHaveBeenCalledWith('a@b.c');
    await controller.resetPassword('code', { newPassword: 'pw' });
    expect(svc.verifyUser).toHaveBeenCalledWith('code');
    expect(svc.resetPassword).toHaveBeenCalledWith('code', 'pw');
  });
});
