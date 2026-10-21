import { UnauthorizedException } from '@nestjs/common';
import { ExponatsController } from './exponats.controller';

const date = new Date('2024-03-03T00:00:00Z');
const exponat = (over: any = {}) => ({
  id: 'e1',
  name: 'Fox',
  alternateName: 'Vulpes',
  description: 'd',
  mainImage: 'm',
  serialNumber: 12,
  organisationId: 'o1',
  ExponatKind: 'ANIMAL',
  isApproved: false,
  attributes: {},
  funFacts: ['f'],
  video: 'v',
  thirdDimensionalModel: 'm3d',
  authorshipInfoId: 'ai',
  createdAt: date,
  updatedAt: date,
  _count: { FavouriteExponats: 3, Posts: 2 },
  Organisation: { name: 'Org' },
  Categorization: { id: 'c', genus: 'Vulpes', speciesKey: 5 },
  AuthorshipInfo: { id: 'ai', author: { firstName: 'Ana', lastName: 'Anić' } },
  Posts: [
    {
      id: 'p1',
      title: 'P',
      authorId: 'u1',
      thumbnailImage: 't',
      isApproved: true,
      updatedAt: date,
      _count: { Likes: 5 },
      author: { username: 'ana', hasProfileImage: true },
    },
  ],
  ...over,
});

describe('ExponatsController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: ExponatsController;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    svc = {
      discoverExponats: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      checkUserRole: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      changeApprovalStatus: jest.fn(),
      getIdBySerialNumber: jest.fn(),
    };
    controller = new ExponatsController(svc as any);
  });
  afterEach(() => jest.restoreAllMocks());

  it('discover maps SQL rows and defaults counters', async () => {
    svc.discoverExponats.mockResolvedValue([
      { id: 'e1', name: 'Fox', organisationName: 'Org', amountOfFavourites: 4 },
    ]);
    const res = await controller.discover(
      { page: 2, size: 5 },
      { user: { id: 'u' } },
    );
    expect(svc.discoverExponats).toHaveBeenCalledWith(2, 5, 'u');
    expect(res[0]).toMatchObject({
      favouriteCount: 4,
      postCount: 0,
      organizationName: 'Org',
    });
  });

  describe('findAll', () => {
    it('restricts to approved exponats for non super users', async () => {
      svc.findAll.mockResolvedValue([]);
      await controller.findAll({ page: 1, size: 10 }, undefined, {} as any, {
        user: { role: 'user' },
      });
      expect(svc.findAll.mock.calls[0][3]).toBe(true);
    });

    it('does not restrict for super users', async () => {
      svc.findAll.mockResolvedValue([exponat()]);
      const [res] = await controller.findAll(undefined, undefined, {} as any, {
        user: { role: 'super' },
      });
      expect(svc.findAll.mock.calls[0][3]).toBe(false);
      expect(res).toMatchObject({
        favouriteCount: 3,
        postCount: 2,
        organizationName: 'Org',
      });
    });
  });

  it('create forces the organisation from the URL onto the dto', async () => {
    svc.create.mockResolvedValue(exponat({ Organisation: { name: 'Org' } }));
    const dto: any = { authorId: 'attacker-chosen' };
    const res = await controller.create('o1', dto, { user: { id: 'me' } });
    expect(svc.create).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: 'o1' }),
      'me',
    );
    expect(res).toMatchObject({
      favouriteCount: 0,
      postCount: 0,
      organizationName: 'Org',
    });
  });

  describe('findOne', () => {
    it('anonymous visitors only see approved content', async () => {
      svc.findOne.mockResolvedValue(exponat());
      const res = await controller.findOne('e1', {});
      expect(svc.checkUserRole).not.toHaveBeenCalled();
      expect(svc.findOne).toHaveBeenCalledWith('e1', true);
      expect(res).not.toHaveProperty('isApproved');
    });

    it('organisation admins see everything including approval flags', async () => {
      svc.checkUserRole.mockResolvedValue(true);
      svc.findOne.mockResolvedValue(exponat());
      const res: any = await controller.findOne('e1', {
        user: { id: 'u', role: 'user' },
      });
      expect(svc.findOne).toHaveBeenCalledWith('e1', false);
      expect(res.isApproved).toBe(false);
      expect(res.posts[0].isApproved).toBe(true);
    });

    it('non admin members stay restricted', async () => {
      svc.checkUserRole.mockResolvedValue(false);
      svc.findOne.mockResolvedValue(exponat());
      await controller.findOne('e1', { user: { id: 'u', role: 'user' } });
      expect(svc.findOne).toHaveBeenCalledWith('e1', true);
    });

    it('super users skip the role lookup', async () => {
      svc.findOne.mockResolvedValue(exponat());
      await controller.findOne('e1', { user: { id: 'u', role: 'super' } });
      expect(svc.checkUserRole).not.toHaveBeenCalled();
      expect(svc.findOne).toHaveBeenCalledWith('e1', false);
    });

    it('maps the extended response', async () => {
      svc.findOne.mockResolvedValue(exponat());
      const res: any = await controller.findOne('e1', {});
      expect(res).toMatchObject({
        id: 'e1',
        title: 'Fox',
        serialNumber: 12,
        favouriteCount: 3,
        organizationName: 'Org',
        categorization: { genus: 'Vulpes', speciesKey: 5 },
      });
      expect(res.authorshipInfo.authorName).toBe('Ana Anić');
      expect(res.posts[0]).toMatchObject({
        authorName: 'ana',
        likeScore: 5,
        exponatName: 'Fox',
      });
    });

    it('leaves categorization undefined when none is attached', async () => {
      svc.findOne.mockResolvedValue(exponat({ Categorization: null }));
      const res: any = await controller.findOne('e1', {});
      expect(res.categorization).toBeNull();
    });
  });

  it('update / approval act as the authenticated user', async () => {
    await controller.update('e1', { name: 'n' } as any, { user: { id: 'me' } });
    await controller.changeApprovalStatus('e1', { user: { id: 'me' } });
    expect(svc.update).toHaveBeenCalledWith('e1', { name: 'n' }, 'me');
    expect(svc.changeApprovalStatus).toHaveBeenCalledWith('e1', 'me');
  });

  it('getSerial resolves a serial number to an id', async () => {
    svc.getIdBySerialNumber.mockResolvedValue('e1');
    await expect(controller.getSerial(12)).resolves.toBe('e1');
  });

  it('delete is protected by an auth guard', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      ExponatsController.prototype.remove,
    );
    expect(guards?.length).toBeGreaterThan(0);
  });

  it('remove delegates to the service for organisation admins', async () => {
    svc.checkUserRole.mockResolvedValue(true);
    await controller.remove('e1', { user: { id: 'me' } });
    expect(svc.checkUserRole).toHaveBeenCalledWith('me', 'e1');
    expect(svc.remove).toHaveBeenCalledWith('e1');
  });

  it('remove refuses everyone else', async () => {
    svc.checkUserRole.mockResolvedValue(false);
    await expect(
      controller.remove('e1', { user: { id: 'me' } }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(svc.remove).not.toHaveBeenCalled();
  });
});
