import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth-guard';
import { SessionOnlyGuard } from './session-only';

describe('SessionOnlyGuard', () => {
  const context = (user: unknown) =>
    ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as any;

  beforeEach(() => {
    // Stands in for passport: the request is already authenticated.
    jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockResolvedValue(true);
  });
  afterEach(() => jest.restoreAllMocks());

  it('lets a login through', async () => {
    await expect(
      new SessionOnlyGuard().canActivate(context({ id: 'u1' })),
    ).resolves.toBe(true);
  });

  it('refuses an API token', async () => {
    await expect(
      new SessionOnlyGuard().canActivate(context({ id: 'u1', tokenId: 't1' })),
    ).rejects.toThrow(
      new ForbiddenException('This action needs a login, not an API token'),
    );
  });

  it('needs a login in the first place', async () => {
    jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockRejectedValue(new Error('Unauthorized'));
    await expect(
      new SessionOnlyGuard().canActivate(context(undefined)),
    ).rejects.toThrow('Unauthorized');
  });
});
