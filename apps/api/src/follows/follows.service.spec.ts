import { FollowsService } from './follows.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('FollowsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { create: jest.Mock };
  let notificationUsers: { publishNotification: jest.Mock };
  let service: FollowsService;
  const key = { followerId_followeeId: { followerId: 'a', followeeId: 'b' } };

  beforeEach(() => {
    prisma = createPrismaMock();
    notifications = { create: jest.fn().mockResolvedValue({ id: 'n1' }) };
    notificationUsers = { publishNotification: jest.fn() };
    service = new FollowsService(
      prisma as any,
      notifications as any,
      notificationUsers as any,
    );
  });

  it('create stores the follow and notifies the followee', async () => {
    prisma.userFollows.create.mockResolvedValue({
      follower: { id: 'a', username: 'ana' },
    });

    await service.create('a', 'b');

    expect(prisma.userFollows.create.mock.calls[0][0].data).toEqual({
      followerId: 'a',
      followeeId: 'b',
    });
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'NEW_FOLLOWER',
        link: '/user/a',
        notificationImage: 'a',
        text: expect.stringContaining('ana'),
      }),
      ['b'],
    );
    expect(notificationUsers.publishNotification).toHaveBeenCalledWith('b', {
      id: 'n1',
    });
  });

  it('create does not notify when persisting the follow fails', async () => {
    prisma.userFollows.create.mockRejectedValue(new Error('dup'));
    await expect(service.create('a', 'b')).rejects.toThrow('dup');
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('delete removes by composite key', async () => {
    await service.delete('a', 'b');
    expect(prisma.userFollows.delete).toHaveBeenCalledWith({ where: key });
  });

  it.each([
    [{}, true],
    [null, false],
  ])('isFollowing maps %p to %p', async (row, expected) => {
    prisma.userFollows.findUnique.mockResolvedValue(row);
    await expect(service.isFollowing('a', 'b')).resolves.toBe(expected);
    expect(prisma.userFollows.findUnique).toHaveBeenCalledWith({ where: key });
  });

  it('toggleFollow unfollows when already following', async () => {
    prisma.userFollows.findUnique.mockResolvedValue({});
    await service.toggleFollow('a', 'b');
    expect(prisma.userFollows.delete).toHaveBeenCalled();
    expect(prisma.userFollows.create).not.toHaveBeenCalled();
  });

  it('toggleFollow follows (and notifies) when not following', async () => {
    prisma.userFollows.findUnique.mockResolvedValue(null);
    prisma.userFollows.create.mockResolvedValue({
      follower: { id: 'a', username: 'ana' },
    });
    await service.toggleFollow('a', 'b');
    expect(prisma.userFollows.create).toHaveBeenCalled();
    expect(notificationUsers.publishNotification).toHaveBeenCalled();
  });

  it('getFollowers queries by followee', async () => {
    await service.getFollowers('b');
    expect(prisma.userFollows.findMany.mock.calls[0][0].where).toEqual({
      followeeId: 'b',
    });
  });

  it('getFollowing queries by follower', async () => {
    await service.getFollowing('a');
    expect(prisma.userFollows.findMany.mock.calls[0][0].where).toEqual({
      followerId: 'a',
    });
  });
});
