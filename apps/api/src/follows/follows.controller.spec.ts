import { FollowsController } from './follows.controller';

describe('FollowsController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: FollowsController;

  beforeEach(() => {
    svc = {
      toggleFollow: jest.fn(),
      getFollowers: jest.fn(),
      getFollowing: jest.fn(),
    };
    controller = new FollowsController(svc as any);
  });

  it('toggleFollow follows as the authenticated user', async () => {
    await controller.toggleFollow({ user: { id: 'me' } }, 'target');
    expect(svc.toggleFollow).toHaveBeenCalledWith('me', 'target');
  });

  const person = (over = {}) => ({
    email: 'e',
    firstName: 'A',
    lastName: 'B',
    location: 'ZAGREB',
    username: 'ab',
    _count: { followers: 4, Posts: 5 },
    ...over,
  });

  it('getFollowers maps the follower side', async () => {
    svc.getFollowers.mockResolvedValue([
      { followerId: 'f1', follower: person() },
    ]);
    await expect(controller.getFollowers('u')).resolves.toEqual([
      {
        id: 'f1',
        email: 'e',
        firstName: 'A',
        lastName: 'B',
        location: 'ZAGREB',
        username: 'ab',
        followerCount: 4,
        postCount: 5,
      },
    ]);
  });

  it('getFollowing maps the followee side', async () => {
    svc.getFollowing.mockResolvedValue([
      { followeeId: 'g1', followee: person() },
    ]);
    const [res] = await controller.getFollowing('u');
    expect(res).toMatchObject({ id: 'g1', followerCount: 4, postCount: 5 });
  });
});
