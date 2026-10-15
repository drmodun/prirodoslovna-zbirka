import { FavouriteOrgranisationsController } from './favourites-organisations.controller';

describe('FavouriteOrgranisationsController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: FavouriteOrgranisationsController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      findAllForUser: jest.fn(),
      findAllForOrganisation: jest.fn(),
      toggle: jest.fn(),
    };
    controller = new FavouriteOrgranisationsController(svc as any);
  });

  it('findAllForUser maps organisations and sums points', async () => {
    svc.findAllForUser.mockResolvedValue([
      {
        organisationId: 'o1',
        organisation: {
          name: 'Org',
          location: 'ZAGREB',
          mainImage: 'm',
          websiteUrl: 'w',
          updatedAt: new Date(),
          _count: {
            Exponats: 2,
            UserOrganisationFollowers: 3,
            OrganisationUsers: 4,
          },
          Exponats: [
            { _count: { FavouriteExponats: 1 } },
            { _count: { FavouriteExponats: 5 } },
          ],
        },
      },
    ]);
    const [res] = await controller.findAllForUser(req);
    expect(svc.findAllForUser).toHaveBeenCalledWith('me');
    expect(res).toMatchObject({
      id: 'o1',
      exponatCount: 2,
      followerCount: 3,
      memberCount: 4,
      points: 6,
    });
  });

  it('findAllForOrgranisation maps followers', async () => {
    svc.findAllForOrganisation.mockResolvedValue([
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
    await expect(controller.findAllForOrgranisation('o1')).resolves.toEqual([
      {
        id: 'u1',
        email: 'e',
        firstName: 'A',
        lastName: 'B',
        postCount: 2,
        followerCount: 3,
      },
    ]);
  });

  it('toggle reports whether a row was returned', async () => {
    svc.toggle.mockResolvedValueOnce({}).mockResolvedValueOnce(null);
    await expect(controller.toggle('o1', req)).resolves.toBe(true);
    await expect(controller.toggle('o1', req)).resolves.toBe(false);
  });
});
