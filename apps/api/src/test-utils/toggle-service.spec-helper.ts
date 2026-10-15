import { createPrismaMock } from './prisma.mock';

interface ToggleServiceCase {
  name: string;
  /** constructor taking a prisma mock */
  build: (prisma: any) => any;
  /** prisma delegate name, e.g. 'savedWorks' */
  model: string;
  /** name of the foreign key on the join row, e.g. 'workId' */
  fk: string;
  /** name of the composite unique key used for delete */
  compositeKey: string;
  findAllForUser: string;
  findAllForTarget: string;
}

/** Shared behaviour for the exists/create/delete/toggle join-table services. */
export function describeToggleService(c: ToggleServiceCase) {
  describe(c.name, () => {
    let prisma: ReturnType<typeof createPrismaMock>;
    let service: any;

    beforeEach(() => {
      prisma = createPrismaMock();
      service = c.build(prisma);
    });

    it('exists looks the row up by user and target', async () => {
      prisma[c.model].findFirst.mockResolvedValue({ id: 1 });
      await expect(service.exists('u', 't')).resolves.toEqual({ id: 1 });
      expect(prisma[c.model].findFirst).toHaveBeenCalledWith({
        where: { userId: 'u', [c.fk]: 't' },
      });
    });

    it('create inserts the join row', async () => {
      prisma[c.model].create.mockResolvedValue({ ok: true });
      await expect(service.create('u', 't')).resolves.toEqual({ ok: true });
      expect(prisma[c.model].create).toHaveBeenCalledWith({
        data: { userId: 'u', [c.fk]: 't' },
      });
    });

    it('delete uses the composite unique key', async () => {
      await service.delete('u', 't');
      expect(prisma[c.model].delete).toHaveBeenCalledWith({
        where: { [c.compositeKey]: { userId: 'u', [c.fk]: 't' } },
      });
    });

    it('toggle deletes when the row exists', async () => {
      prisma[c.model].findFirst.mockResolvedValue({ id: 1 });
      prisma[c.model].delete.mockResolvedValue('deleted');
      await expect(service.toggle('u', 't')).resolves.toBe('deleted');
      expect(prisma[c.model].create).not.toHaveBeenCalled();
    });

    it('toggle creates when the row is missing', async () => {
      prisma[c.model].findFirst.mockResolvedValue(null);
      prisma[c.model].create.mockResolvedValue('created');
      await expect(service.toggle('u', 't')).resolves.toBe('created');
      expect(prisma[c.model].delete).not.toHaveBeenCalled();
    });

    it(`${c.findAllForUser} filters by user, newest first`, async () => {
      prisma[c.model].findMany.mockResolvedValue(['a']);
      await expect(service[c.findAllForUser]('u')).resolves.toEqual(['a']);
      const arg = prisma[c.model].findMany.mock.calls[0][0];
      expect(arg.where).toEqual({ userId: 'u' });
      expect(arg.orderBy).toEqual({ createdAt: 'desc' });
    });

    it(`${c.findAllForTarget} filters by target`, async () => {
      prisma[c.model].findMany.mockResolvedValue(['b']);
      await expect(service[c.findAllForTarget]('t')).resolves.toEqual(['b']);
      expect(prisma[c.model].findMany.mock.calls[0][0].where).toEqual({
        [c.fk]: 't',
      });
    });
  });
}
