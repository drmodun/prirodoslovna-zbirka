import { AuthorshipInfoService } from './authorship-info.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('AuthorshipInfoService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: AuthorshipInfoService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AuthorshipInfoService(prisma as any);
  });

  it('create passes the dto through', async () => {
    const dto = { authorId: 'u' } as any;
    await service.create(dto);
    expect(prisma.authorshipInfo.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll / findOne delegate to prisma', async () => {
    await service.findAll();
    await service.findOne('x');
    expect(prisma.authorshipInfo.findMany).toHaveBeenCalled();
    expect(prisma.authorshipInfo.findUnique).toHaveBeenCalledWith({
      where: { id: 'x' },
    });
  });

  it('update is scoped to the author so others cannot edit', async () => {
    await service.update('x', { title: 't' } as any, 'author');
    expect(prisma.authorshipInfo.update).toHaveBeenCalledWith({
      where: { id: 'x', authorId: 'author' },
      data: { title: 't' },
    });
  });
});
