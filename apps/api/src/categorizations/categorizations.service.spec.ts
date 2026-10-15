import { NotFoundException } from '@nestjs/common';
import { SortingEnum, SortType } from '@biosfera/types';
import { CategorizationsService } from './categorizations.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('CategorizationsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: CategorizationsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CategorizationsService(prisma as any);
  });

  it('create persists the dto', async () => {
    const dto: any = { species: 'Vulpes vulpes' };
    await service.create(dto);
    expect(prisma.categorization.create).toHaveBeenCalledWith({ data: dto });
  });

  describe('findByName', () => {
    it('searches species case-insensitively with OR semantics', async () => {
      prisma.categorization.findFirst.mockResolvedValue({ id: 'c' });
      await expect(service.findByName('vulpes vulpes')).resolves.toEqual({
        id: 'c',
      });
      expect(prisma.categorization.findFirst).toHaveBeenCalledWith({
        where: { species: { search: 'vulpes | vulpes', mode: 'insensitive' } },
      });
    });

    it('404s when nothing matches', async () => {
      prisma.categorization.findFirst.mockResolvedValue(null);
      await expect(service.findByName('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it.each(['genus', 'phylum', 'order', 'domain', 'family', 'kingdom'])(
      'filters by %s using a case-insensitive search',
      async (rank) => {
        await service.findAll({ [rank]: 'a b' } as any);
        expect(prisma.categorization.findMany.mock.calls[0][0].where).toEqual({
          [rank]: { search: 'a | b', mode: 'insensitive' },
        });
      },
    );

    it('has no filters by default', async () => {
      await service.findAll();
      expect(prisma.categorization.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('sorts and paginates', async () => {
      await service.findAll(
        {} as any,
        {
          attribute: SortingEnum.EXPONAT_AMOUNT,
          direction: SortType.DESCENDING,
        },
        { page: 2, size: 4 },
      );
      const arg = prisma.categorization.findMany.mock.calls[0][0];
      expect(arg.orderBy).toEqual({ Exponat: { _count: 'desc' } });
      expect(arg.skip).toBe(4);
      expect(arg.take).toBe(4);
    });

    it('omits orderBy for sort attributes without a mapping', async () => {
      await service.findAll({} as any, {
        attribute: SortingEnum.NAME,
        direction: SortType.ASCENDING,
      });
      expect(
        prisma.categorization.findMany.mock.calls[0][0],
      ).not.toHaveProperty('orderBy');
    });
  });

  it('findOne lists exponats, most discussed first', async () => {
    await service.findOne('c');
    const arg = prisma.categorization.findUnique.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'c' });
    expect(arg.include.Exponat.orderBy).toEqual({ Posts: { _count: 'desc' } });
  });

  it('update / remove address the categorization by id', async () => {
    await service.update('c', { genus: 'g' } as any);
    await service.remove('c');
    expect(prisma.categorization.update).toHaveBeenCalledWith({
      where: { id: 'c' },
      data: { genus: 'g' },
    });
    expect(prisma.categorization.delete).toHaveBeenCalledWith({
      where: { id: 'c' },
    });
  });
});
