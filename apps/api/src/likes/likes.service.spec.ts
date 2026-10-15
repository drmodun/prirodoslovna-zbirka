import { LikesService } from './likes.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('LikesService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: LikesService;
  const key = { postId_userId: { userId: 'u1', postId: 'p1' } };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new LikesService(prisma as any);
  });

  it('creates a like', async () => {
    prisma.like.create.mockResolvedValue({ id: 1 });
    await expect(service.create('u1', 'p1')).resolves.toEqual({ id: 1 });
    expect(prisma.like.create).toHaveBeenCalledWith({
      data: { userId: 'u1', postId: 'p1' },
    });
  });

  it('deletes a like by composite key', async () => {
    await service.delete('u1', 'p1');
    expect(prisma.like.delete).toHaveBeenCalledWith({ where: key });
  });

  it.each([
    [{ userId: 'u1' }, true],
    [null, false],
  ])('isLiked maps %p to %p', async (row, expected) => {
    prisma.like.findUnique.mockResolvedValue(row);
    await expect(service.isLiked('u1', 'p1')).resolves.toBe(expected);
  });

  it('toggleLike removes an existing like', async () => {
    prisma.like.findUnique.mockResolvedValue({});
    await service.toggleLike('u1', 'p1');
    expect(prisma.like.delete).toHaveBeenCalled();
    expect(prisma.like.create).not.toHaveBeenCalled();
  });

  it('toggleLike adds a missing like', async () => {
    prisma.like.findUnique.mockResolvedValue(null);
    await service.toggleLike('u1', 'p1');
    expect(prisma.like.create).toHaveBeenCalled();
    expect(prisma.like.delete).not.toHaveBeenCalled();
  });
});
