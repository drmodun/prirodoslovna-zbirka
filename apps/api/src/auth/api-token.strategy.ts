import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ApiTokenScope } from '@prisma/client';
import { Request, Response } from 'express';
import { isActive, isApiToken } from 'src/api-tokens/api-token';
import {
  ApiTokenRateLimiter,
  RateLimitResult,
} from 'src/api-tokens/api-token-rate-limiter';
import { ApiTokensService } from 'src/api-tokens/api-tokens.service';
import { toTokenRole } from './roles';

type Verify = (
  req: Request,
  token: string,
  done: (error: unknown, user?: unknown) => void,
) => void;

const READ_METHODS = ['GET', 'HEAD'];

export const INVALID_API_TOKEN = 'Invalid, expired or revoked API token';

const bearerToken = (req: Request) => {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' ? token : undefined;
};

/**
 * Passport strategy for `Authorization: Bearer bsf_…`. A bearer token without
 * the prefix fails, so the next strategy (the login JWT) gets its turn; a
 * `bsf_` token that does not check out is an error, which ends the chain, so
 * routes with optional login answer 401 instead of serving an anonymous
 * request.
 *
 * Passport adds fail / error / success to the instance for each request.
 */
class BearerApiTokenStrategy {
  name = 'api-token';
  declare fail: () => void;
  declare error: (error: unknown) => void;
  declare success: (user: unknown) => void;

  constructor(private readonly verify: Verify) {}

  authenticate(req: Request) {
    const token = bearerToken(req);
    if (!isApiToken(token)) return this.fail();

    this.verify(req, token, (error, user) => {
      if (error) return this.error(error);
      if (!user)
        return this.error(new UnauthorizedException(INVALID_API_TOKEN));
      this.success(user);
    });
  }
}

const setRateLimitHeaders = (
  res: Response | undefined,
  rate: RateLimitResult,
) => {
  if (!res) return;
  const resetIn = Math.ceil(rate.resetInMs / 1000);
  res.setHeader('X-RateLimit-Limit', rate.limit);
  res.setHeader('X-RateLimit-Remaining', rate.remaining);
  res.setHeader('X-RateLimit-Reset', resetIn);
  if (!rate.allowed) res.setHeader('Retry-After', resetIn);
};

export const canUseMethod = (scopes: ApiTokenScope[], method: string) =>
  scopes.includes(ApiTokenScope.WRITE) ||
  (scopes.includes(ApiTokenScope.READ) &&
    READ_METHODS.includes(method.toUpperCase()));

@Injectable()
export class ApiTokenStrategy extends PassportStrategy(
  BearerApiTokenStrategy,
  'api-token',
) {
  constructor(
    private readonly tokens: ApiTokensService,
    private readonly limiter: ApiTokenRateLimiter,
  ) {
    super();
  }

  async validate(req: Request, token: string) {
    const now = new Date();
    const found = await this.tokens.findByToken(token);
    if (!found || !isActive(found, now) || !found.user.isActivated)
      throw new UnauthorizedException(INVALID_API_TOKEN);

    const rate = this.limiter.hit(found.id, now.getTime());
    setRateLimitHeaders(req.res, rate);
    const usage = { used: rate.count, limit: rate.limit };
    if (rate.reachedWarning)
      void this.tokens.notifyRateLimit(found, 'warning', usage);
    if (rate.reachedLimit)
      void this.tokens.notifyRateLimit(found, 'reached', usage);
    if (!rate.allowed)
      throw new HttpException(
        'Too many requests with this API token',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    void this.tokens.recordUse(found.id, now);

    if (!canUseMethod(found.scopes, req.method))
      throw new ForbiddenException('This token is read-only');

    // The role is the user's current one, not the one at creation.
    return {
      id: found.user.id,
      email: found.user.email,
      role: toTokenRole(found.user.role),
      tokenId: found.id,
      scopes: found.scopes,
    };
  }
}
