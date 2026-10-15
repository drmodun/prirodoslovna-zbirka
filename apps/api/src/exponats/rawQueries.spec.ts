import { InternalServerErrorException } from '@nestjs/common';
import {
  anonymousExponatsDiscover,
  personalizedExponatsDiscover,
} from './rawQueries';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('exponat discover raw queries', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  beforeEach(() => {
    prisma = createPrismaMock();
  });

  it('anonymous query passes limit/offset as bound parameters', async () => {
    prisma.$queryRaw.mockResolvedValue(['row']);
    await expect(
      anonymousExponatsDiscover(3, 20, prisma as any),
    ).resolves.toEqual(['row']);
    const [strings, ...values] = prisma.$queryRaw.mock.calls[0];
    expect(values).toEqual([20, 20, 3]);
    expect(strings.join('?')).toContain('"isApproved" = true');
  });

  it('personalised query binds the user id (never string-interpolated)', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    await personalizedExponatsDiscover(1, 10, "u'; drop table", prisma as any);
    const [strings, ...values] = prisma.$queryRaw.mock.calls[0];
    expect(values).toContain("u'; drop table");
    expect(strings.join('')).not.toContain('drop table');
  });

  it.each([
    ['anonymous', (p: any) => anonymousExponatsDiscover(1, 1, p)],
    ['personalised', (p: any) => personalizedExponatsDiscover(1, 1, 'u', p)],
  ])('%s query wraps database failures in a 500', async (_n, run) => {
    prisma.$queryRaw.mockRejectedValue(new Error('db'));
    await expect(run(prisma)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
