import {
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTokenRateLimiter } from 'src/api-tokens/api-token-rate-limiter';
import { ApiTokenStrategy, canUseMethod } from './api-token.strategy';

describe('ApiTokenStrategy', () => {
  let tokens: Record<string, jest.Mock>;
  let limiter: ApiTokenRateLimiter;
  let strategy: ApiTokenStrategy;

  const stored = (over: Record<string, unknown> = {}) => ({
    id: 't1',
    userId: 'u1',
    name: 'MCP',
    scopes: ['READ', 'WRITE'],
    expiresAt: null,
    revokedAt: null,
    user: { id: 'u1', email: 'a@b.c', role: 'USER', isActivated: true },
    ...over,
  });
  const request = (method = 'GET') => {
    const res = { setHeader: jest.fn() };
    return { method, res, headers: {} } as any;
  };

  beforeEach(() => {
    tokens = {
      findByToken: jest.fn().mockResolvedValue(stored()),
      recordUse: jest.fn(),
      notifyRateLimit: jest.fn(),
    };
    limiter = new ApiTokenRateLimiter(5, 60_000);
    strategy = new ApiTokenStrategy(tokens as any, limiter);
  });

  it('acts as the token’s user and says which token it was', async () => {
    await expect(strategy.validate(request(), 'bsf_x')).resolves.toEqual({
      id: 'u1',
      email: 'a@b.c',
      role: 'user',
      tokenId: 't1',
      scopes: ['READ', 'WRITE'],
    });
    expect(tokens.findByToken).toHaveBeenCalledWith('bsf_x');
    expect(tokens.recordUse).toHaveBeenCalledWith('t1', expect.any(Date));
  });

  it('takes the role from the user now, not from when the token was made', async () => {
    tokens.findByToken.mockResolvedValue(
      stored({
        user: { id: 'u1', email: 'e', role: 'SUPER', isActivated: true },
      }),
    );
    await expect(strategy.validate(request(), 'bsf_x')).resolves.toMatchObject({
      role: 'super',
    });
  });

  it.each([
    ['unknown', null],
    ['revoked', stored({ revokedAt: new Date() })],
    ['expired', stored({ expiresAt: new Date(Date.now() - 1000) })],
    [
      'of a user who is not activated',
      stored({
        user: { id: 'u1', email: 'e', role: 'USER', isActivated: false },
      }),
    ],
  ])('refuses a token that is %s', async (_name, found) => {
    tokens.findByToken.mockResolvedValue(found);
    await expect(strategy.validate(request(), 'bsf_x')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(tokens.recordUse).not.toHaveBeenCalled();
  });

  it('accepts a token that expires later', async () => {
    tokens.findByToken.mockResolvedValue(
      stored({ expiresAt: new Date(Date.now() + 60_000) }),
    );
    await expect(strategy.validate(request(), 'bsf_x')).resolves.toBeTruthy();
  });

  it('lets a read-only token only read', async () => {
    tokens.findByToken.mockResolvedValue(stored({ scopes: ['READ'] }));
    await expect(
      strategy.validate(request('GET'), 'bsf_x'),
    ).resolves.toBeTruthy();
    await expect(
      strategy.validate(request('HEAD'), 'bsf_x'),
    ).resolves.toBeTruthy();
    await expect(strategy.validate(request('POST'), 'bsf_x')).rejects.toThrow(
      new ForbiddenException('This token is read-only'),
    );
  });

  it('answers 429 over the rate limit and warns the owner at 80% and 100%', async () => {
    const req = request();
    for (let i = 0; i < 5; i++) await strategy.validate(req, 'bsf_x');

    const error = await strategy.validate(req, 'bsf_x').catch((e) => e);
    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(429);
    expect(req.res.setHeader).toHaveBeenCalledWith('Retry-After', 60);
    expect(req.res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);

    expect(tokens.notifyRateLimit.mock.calls).toEqual([
      [expect.objectContaining({ id: 't1' }), 'warning', { used: 4, limit: 5 }],
      [expect.objectContaining({ id: 't1' }), 'reached', { used: 5, limit: 5 }],
    ]);
    // Refused requests are not counted as usage.
    expect(tokens.recordUse).toHaveBeenCalledTimes(5);
  });

  describe('authenticate', () => {
    const run = (authorization?: string) => {
      const target = Object.create(strategy);
      target.fail = jest.fn();
      target.error = jest.fn();
      target.success = jest.fn();
      target.authenticate({
        method: 'GET',
        headers: { authorization },
        res: { setHeader: jest.fn() },
      });
      return target;
    };
    const settled = () => new Promise((r) => setImmediate(r));

    it.each([
      ['a login token', 'Bearer eyJhbGciOiJIUzI1NiJ9.x.y'],
      ['no header', undefined],
      ['another scheme', 'Basic bsf_x'],
    ])('passes %s on to the next strategy', (_name, header) => {
      const target = run(header);
      expect(target.fail).toHaveBeenCalled();
      expect(tokens.findByToken).not.toHaveBeenCalled();
    });

    it('logs a valid token in', async () => {
      const target = run('Bearer bsf_x');
      await settled();
      expect(target.success).toHaveBeenCalledWith(
        expect.objectContaining({ tokenId: 't1' }),
      );
    });

    it('ends the chain on a bad bsf_ token instead of failing over', async () => {
      tokens.findByToken.mockResolvedValue(null);
      const target = run('Bearer bsf_bad');
      await settled();
      expect(target.error).toHaveBeenCalledWith(
        expect.any(UnauthorizedException),
      );
      expect(target.fail).not.toHaveBeenCalled();
      expect(target.success).not.toHaveBeenCalled();
    });
  });
});

describe('canUseMethod', () => {
  it.each([
    [['READ'], 'GET', true],
    [['READ'], 'head', true],
    [['READ'], 'POST', false],
    [['READ'], 'DELETE', false],
    [['READ', 'WRITE'], 'PATCH', true],
    [['WRITE'], 'GET', true],
  ])('%j may %s: %s', (scopes, method, allowed) => {
    expect(canUseMethod(scopes as any, method)).toBe(allowed);
  });
});
