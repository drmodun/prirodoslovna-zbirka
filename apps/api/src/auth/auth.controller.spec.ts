import { AuthController } from './auth.controller';
import { fullUserItem } from 'src/test-utils/fixtures';

describe('AuthController', () => {
  let auth: { userPasswordLogin: jest.Mock };
  let users: { findOne: jest.Mock };
  let controller: AuthController;

  beforeEach(() => {
    auth = { userPasswordLogin: jest.fn() };
    users = { findOne: jest.fn() };
    controller = new AuthController(auth as any, users as any);
  });

  it('login wraps the token in access_token', async () => {
    auth.userPasswordLogin.mockResolvedValue('tok');
    await expect(
      controller.login({ email: 'a@b.c', password: 'secret1' }),
    ).resolves.toEqual({ access_token: 'tok' });
    expect(auth.userPasswordLogin).toHaveBeenCalledWith('a@b.c', 'secret1');
  });

  it('whoami echoes the JWT payload', async () => {
    const user = { id: 'u', email: 'e', role: 'user' };
    await expect(controller.whoami({ user })).resolves.toBe(user);
  });

  describe('detailed', () => {
    it('loads the user with unapproved content included', async () => {
      users.findOne.mockResolvedValue(fullUserItem());
      await controller.detailed({ user: { id: 'u1', role: 'user' } });
      expect(users.findOne).toHaveBeenCalledWith('u1', false);
    });

    it('maps the full profile including role and own works', async () => {
      users.findOne.mockResolvedValue(fullUserItem());
      const res = await controller.detailed({
        user: { id: 'u1', role: 'user' },
      });
      expect(res).toMatchObject({
        id: 'u1',
        role: 'USER',
        followerCount: 7,
        followingCount: 8,
        likeCount: 7,
      });
      expect(res.posts).toHaveLength(2);
      expect(res.works[0].isApproved).toBe(true);
      expect(res.memberships[0].points).toBe(7);
      expect(res.favouriteExponats[0].isFavorite).toBe(true);
    });

    it('only reveals post approval flags to super users', async () => {
      users.findOne.mockResolvedValue(fullUserItem());
      const asUser = await controller.detailed({
        user: { id: 'u1', role: 'user' },
      });
      const asSuper = await controller.detailed({
        user: { id: 'u1', role: 'super' },
      });
      expect(asUser.posts[0]).not.toHaveProperty('isApproved');
      expect(asSuper.posts[0]).toHaveProperty('isApproved', false);
    });
  });
});
