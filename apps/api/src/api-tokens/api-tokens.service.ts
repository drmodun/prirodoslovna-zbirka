import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiToken, ApiTokenScope, Prisma } from '@prisma/client';
import { NotificationUsersService } from 'src/notification-users/notification-users.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  activeTokenWhere,
  daysAgo,
  DEFAULT_EXPIRY_DAYS,
  expiryFrom,
  generateApiToken,
  hashApiToken,
  MAX_ACTIVE_TOKENS,
  USAGE_HISTORY_DAYS,
  usageDay,
} from './api-token';
import { CreateApiTokenDto } from './dto/api-tokens.dto';

// Everything about a token except its hash.
const PUBLIC_FIELDS = {
  id: true,
  name: true,
  prefix: true,
  scopes: true,
  createdAt: true,
  expiresAt: true,
  lastUsedAt: true,
  revokedAt: true,
} satisfies Prisma.ApiTokenSelect;

export type RateLimitEvent = 'warning' | 'reached';

const RATE_LIMIT_NOTICE_FIELD = {
  warning: 'rateLimitWarnedAt',
  reached: 'rateLimitReachedAt',
} as const;
const RATE_LIMIT_NOTICE_INTERVAL_MS = 24 * 60 * 60 * 1000;

// WRITE implies READ, so it is stored with it.
const normaliseScopes = (scopes: ApiTokenScope[]) =>
  scopes.includes(ApiTokenScope.WRITE)
    ? [ApiTokenScope.READ, ApiTokenScope.WRITE]
    : [ApiTokenScope.READ];

@Injectable()
export class ApiTokensService {
  private readonly logger = new Logger(ApiTokensService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly notificationUsers: NotificationUsersService,
  ) {}

  async create(userId: string, dto: CreateApiTokenDto) {
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('name should not be empty');

    const active = await this.countActive(userId);
    if (active >= MAX_ACTIVE_TOKENS)
      throw new BadRequestException(
        `You can have at most ${MAX_ACTIVE_TOKENS} active API tokens`,
      );

    const { token, tokenHash, prefix } = generateApiToken();
    const created = await this.prisma.apiToken.create({
      data: {
        userId,
        name,
        tokenHash,
        prefix,
        scopes: normaliseScopes(dto.scopes),
        expiresAt: expiryFrom(
          new Date(),
          dto.expiresInDays === undefined
            ? DEFAULT_EXPIRY_DAYS
            : dto.expiresInDays,
        ),
      },
      select: PUBLIC_FIELDS,
    });

    // The only time the token itself leaves the API.
    return { ...created, token };
  }

  async findAll(userId: string) {
    return await this.prisma.apiToken.findMany({
      where: { userId },
      select: PUBLIC_FIELDS,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countActive(userId: string) {
    return await this.prisma.apiToken.count({
      where: { userId, ...activeTokenWhere() },
    });
  }

  async revoke(userId: string, id: string) {
    const token = await this.findOwn(userId, id);
    if (token.revokedAt) return token;

    return await this.prisma.apiToken.update({
      where: { id },
      data: { revokedAt: new Date() },
      select: PUBLIC_FIELDS,
    });
  }

  async revokeAll(userId: string) {
    const { count } = await this.prisma.apiToken.updateMany({
      where: { userId, ...activeTokenWhere() },
      data: { revokedAt: new Date() },
    });
    return { revoked: count };
  }

  // Requests per day over the last USAGE_HISTORY_DAYS days, oldest first;
  // days without requests are left out.
  async usage(userId: string, id: string) {
    await this.findOwn(userId, id);
    const rows = await this.prisma.apiTokenUsage.findMany({
      where: {
        tokenId: id,
        day: { gte: daysAgo(new Date(), USAGE_HISTORY_DAYS - 1) },
      },
      orderBy: { day: 'asc' },
    });
    return rows.map((row) => ({
      day: row.day.toISOString().slice(0, 10),
      requests: row.requests,
    }));
  }

  // The token a request presents, with the user it acts for.
  async findByToken(token: string) {
    return await this.prisma.apiToken.findUnique({
      where: { tokenHash: hashApiToken(token) },
      include: {
        user: {
          select: { id: true, email: true, role: true, isActivated: true },
        },
      },
    });
  }

  // Counts a request. It runs alongside the request, so a failure is only
  // logged.
  recordUse(tokenId: string, now = new Date()) {
    const day = usageDay(now);
    return Promise.all([
      this.prisma.apiTokenUsage.upsert({
        where: { tokenId_day: { tokenId, day } },
        create: { tokenId, day, requests: 1 },
        update: { requests: { increment: 1 } },
      }),
      this.prisma.apiToken.update({
        where: { id: tokenId },
        data: { lastUsedAt: now },
      }),
    ]).then(
      () => undefined,
      (error) =>
        this.logger.error(
          `Could not record use of API token ${tokenId}`,
          error,
        ),
    );
  }

  // Tells the user that a token used 80% or all of its rate limit, at most
  // once a day per token and kind. Like recordUse it only logs failures.
  async notifyRateLimit(
    token: Pick<ApiToken, 'id' | 'userId' | 'name'>,
    event: RateLimitEvent,
    { used, limit }: { used: number; limit: number },
    now = new Date(),
  ) {
    const field = RATE_LIMIT_NOTICE_FIELD[event];
    try {
      // The conditional update claims the notice, so concurrent requests
      // (or API instances) send it once.
      const { count } = await this.prisma.apiToken.updateMany({
        where: {
          id: token.id,
          OR: [
            { [field]: null },
            {
              [field]: {
                lt: new Date(now.getTime() - RATE_LIMIT_NOTICE_INTERVAL_MS),
              },
            },
          ],
        },
        data: { [field]: now },
      });
      if (!count) return;

      const notification = await this.notifications.create(
        {
          messageKey:
            event === 'warning'
              ? 'apiTokenRateLimitWarning'
              : 'apiTokenRateLimitReached',
          params: {
            name: token.name,
            used: String(used),
            limit: String(limit),
          },
          link: `/user/${token.userId}`,
          type: 'OTHER',
        },
        [token.userId],
      );
      await this.notificationUsers.publishNotification(
        token.userId,
        notification,
      );
    } catch (error) {
      this.logger.error(
        `Could not send the rate limit notice for API token ${token.id}`,
        error,
      );
    }
  }

  private async findOwn(userId: string, id: string) {
    const token = await this.prisma.apiToken.findFirst({
      where: { id, userId },
      select: PUBLIC_FIELDS,
    });
    // Someone else's token is answered like a missing one.
    if (!token) throw new NotFoundException('API token not found');
    return token;
  }
}
