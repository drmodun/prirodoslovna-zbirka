import { FavouriteExponatsController } from './favourite-exponats.controller';

describe('FavouriteExponatsController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: FavouriteExponatsController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      findAllForUser: jest.fn(),
      findAllForExponat: jest.fn(),
      toggle: jest.fn(),
    };
    controller = new FavouriteExponatsController(svc as any);
  });

  it('findAllForUser maps the favourite exponats of the caller', async () => {
    svc.findAllForUser.mockResolvedValue([
      {
        Exponat: {
          id: 'e1',
          name: 'Fox',
          alternateName: 'a',
          description: 'd',
          ExponatKind: 'ANIMAL',
          organisationId: 'o1',
          mainImage: 'm',
          updatedAt: new Date(),
          Organisation: { name: 'Org' },
          _count: { FavouriteExponats: 3, Posts: 1 },
        },
      },
    ]);
    const [res] = await controller.findAllForUser(req);
    expect(svc.findAllForUser).toHaveBeenCalledWith('me');
    expect(res).toMatchObject({
      id: 'e1',
      favouriteCount: 3,
      postCount: 1,
      organizationName: 'Org',
    });
  });

  it('findAllForExponat maps the users who favourited an exponat', async () => {
    svc.findAllForExponat.mockResolvedValue([
      {
        userId: 'u1',
        user: {
          email: 'e',
          firstName: 'A',
          lastName: 'B',
          _count: { Posts: 2, followers: 3 },
        },
      },
    ]);
    await expect(controller.findAllForExponat('e1')).resolves.toEqual([
      {
        id: 'u1',
        firstName: 'A',
        lastName: 'B',
        postCount: 2,
        followerCount: 3,
      },
    ]);
  });

  it('toggle reports whether a row was returned', async () => {
    svc.toggle.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null);
    await expect(controller.toggle('e1', req)).resolves.toBe(true);
    await expect(controller.toggle('e1', req)).resolves.toBe(false);
    expect(svc.toggle).toHaveBeenCalledWith('me', 'e1');
  });
});
