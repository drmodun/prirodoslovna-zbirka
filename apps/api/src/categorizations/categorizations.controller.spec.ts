import { NotFoundException } from '@nestjs/common';
import { CategorizationsController } from './categorizations.controller';

describe('CategorizationsController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: CategorizationsController;

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByName: jest.fn(),
    };
    controller = new CategorizationsController(svc as any);
  });

  it('create returns a short response with zero exponats', async () => {
    svc.create.mockResolvedValue({ id: 'c', family: 'Canidae' });
    await expect(controller.create({} as any)).resolves.toEqual({
      id: 'c',
      family: 'Canidae',
      numberOfExponats: 0,
    });
  });

  it('findAll maps counts and species info', async () => {
    svc.findAll.mockResolvedValue([
      {
        id: 'c',
        family: 'F',
        species: 's',
        speciesKey: 3,
        _count: { Exponat: 4 },
      },
    ]);
    const res = await controller.findAll(
      { page: 1, size: 10 },
      undefined,
      {} as any,
    );
    expect(res).toEqual([
      {
        id: 'c',
        family: 'F',
        species: 's',
        speciesKey: 3,
        numberOfExponats: 4,
      },
    ]);
  });

  describe('findOne', () => {
    it('404s for unknown ids', async () => {
      svc.findOne.mockResolvedValue(null);
      await expect(controller.findOne('c')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    const item = {
      id: 'c',
      class: 'Mammalia',
      domain: 'Eukaryota',
      family: 'Canidae',
      order: 'Carnivora',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      genus: 'Vulpes',
      speciesKey: 9,
      _count: { Exponat: 1 },
      Exponat: [
        {
          id: 'e1',
          name: 'Fox',
          alternateName: 'a',
          description: 'd',
          mainImage: 'm',
          ExponatKind: 'ANIMAL',
          organisationId: 'o1',
          updatedAt: new Date(),
          _count: { Posts: 2, FavouriteExponats: 3 },
        },
      ],
    };

    it('maps taxonomy and exponats', async () => {
      svc.findOne.mockResolvedValue(item);
      const res: any = await controller.findOne('c');
      expect(res).toMatchObject({
        id: 'c',
        genus: 'Vulpes',
        numberOfExponats: 1,
        exponats: [
          expect.objectContaining({
            id: 'e1',
            favouriteCount: 3,
            postCount: 2,
          }),
        ],
      });
    });

    it.failing(
      'exposes the kingdom under the documented `kingdom` key',
      async () => {
        svc.findOne.mockResolvedValue(item);
        const res: any = await controller.findOne('c');
        expect(res.kingdom).toBe('Animalia'); // currently emitted as `kingom`
      },
    );
  });

  it('findByName maps the short response', async () => {
    svc.findByName.mockResolvedValue({
      id: 'c',
      family: 'F',
      species: 's',
      speciesKey: 1,
      extra: 'x',
    });
    await expect(controller.findByName('s')).resolves.toEqual({
      id: 'c',
      family: 'F',
      species: 's',
      speciesKey: 1,
    });
  });

  it('update / remove delegate', async () => {
    await controller.update('c', { genus: 'g' } as any);
    await controller.remove('c');
    expect(svc.update).toHaveBeenCalledWith('c', { genus: 'g' });
    expect(svc.remove).toHaveBeenCalledWith('c');
  });

  // SECURITY: every write endpoint of this controller is unauthenticated.
  it.failing.each(['create', 'update', 'remove'] as const)(
    '%s requires authentication',
    (method) => {
      const guards = Reflect.getMetadata(
        '__guards__',
        CategorizationsController.prototype[method],
      );
      expect(guards?.length).toBeGreaterThan(0);
    },
  );
});
