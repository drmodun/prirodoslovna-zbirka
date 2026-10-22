import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createPrismaMock } from 'src/test-utils/prisma.mock';
import { hashApiToken } from './api-token';
import { ApiTokensService } from './api-tokens.service';

describe('ApiTokensService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let notifications: { create: jest.Mock };
  let notificationUsers: { publishNotification: jest.Mock };
  let service: ApiTokensService;

  beforeEach(() => {
    prisma = createPrismaMock();
    notifications = { create: jest.fn().mockResolvedValue({ id: 'n1' }) };
    notificationUsers = { publishNotification: jest.fn() };
    service = new ApiTokensService(
      prisma as any,
      notifications as any,
      notificationUsers as any,
    );
    prisma.apiToken.count.mockResolvedValue(0);
    prisma.apiToken.create.mockImplementation(async ({ data }) => ({
      id: 't1',
      ...data,
    }));
  });

  describe('create', () => {
    const DAY = 24 * 60 * 60 * 1000;
    const created = () => prisma.apiToken.create.mock.calls[0][0];

    it('returns the token once and stores only its hash', async () => {
      const result = await service.create('u1', {
        name: ' MCP ',
        scopes: ['READ'],
      });

      expect(result.token).toMatch(/^bsf_/);
      const { data, select } = created();
      expect(data).toMatchObject({ userId: 'u1', name: 'MCP' });
      expect(data.tokenHash).toBe(hashApiToken(result.token));
      expect(data).not.toHaveProperty('token');
      expect(data.prefix).toBe(result.token.slice(4, 12));
      expect(select).not.toHaveProperty('tokenHash');
    });

    it('expires after 90 days unless told otherwise', async () => {
      const before = Date.now();
      await service.create('u1', { name: 'a', scopes: ['READ'] });
      const expiresAt = created().data.expiresAt.getTime();
      expect(expiresAt).toBeGreaterThanOrEqual(before + 90 * DAY);
      expect(expiresAt).toBeLessThanOrEqual(Date.now() + 90 * DAY);
    });

    it('takes a custom expiry, or none at all', async () => {
      const before = Date.now();
      await service.create('u1', {
        name: 'a',
        scopes: ['READ'],
        expiresInDays: 7,
      });
      expect(created().data.expiresAt.getTime()).toBeGreaterThanOrEqual(
        before + 7 * DAY,
      );

      prisma.apiToken.create.mockClear();
      await service.create('u1', {
        name: 'a',
        scopes: ['READ'],
        expiresInDays: null,
      });
      expect(created().data.expiresAt).toBeNull();
    });

    it('stores WRITE together with READ', async () => {
      await service.create('u1', { name: 'a', scopes: ['WRITE'] });
      expect(created().data.scopes).toEqual(['READ', 'WRITE']);
    });

    it('refuses blank names and an 11th active token', async () => {
      await expect(
        service.create('u1', { name: '   ', scopes: ['READ'] }),
      ).rejects.toThrow(BadRequestException);

      prisma.apiToken.count.mockResolvedValue(10);
      await expect(
        service.create('u1', { name: 'a', scopes: ['READ'] }),
      ).rejects.toThrow('You can have at most 10 active API tokens');
      expect(prisma.apiToken.create).not.toHaveBeenCalled();
    });
  });

  it('lists only the user’s tokens, without hashes', async () => {
    prisma.apiToken.findMany.mockResolvedValue([]);
    await service.findAll('u1');
    const { where, select } = prisma.apiToken.findMany.mock.calls[0][0];
    expect(where).toEqual({ userId: 'u1' });
    expect(select).not.toHaveProperty('tokenHash');
  });

  describe('revoke', () => {
    it('answers someone else’s token with 404', async () => {
      prisma.apiToken.findFirst.mockResolvedValue(null);
      await expect(service.revoke('u1', 't1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.apiToken.findFirst.mock.calls[0][0].where).toEqual({
        id: 't1',
        userId: 'u1',
      });
      expect(prisma.apiToken.update).not.toHaveBeenCalled();
    });

    it('sets revokedAt instead of deleting', async () => {
      prisma.apiToken.findFirst.mockResolvedValue({
        id: 't1',
        revokedAt: null,
      });
      await service.revoke('u1', 't1');
      const { where, data } = prisma.apiToken.update.mock.calls[0][0];
      expect(where).toEqual({ id: 't1' });
      expect(data.revokedAt).toBeInstanceOf(Date);
      expect(prisma.apiToken.delete).not.toHaveBeenCalled();
    });

    it('keeps the first revocation time', async () => {
      const token = { id: 't1', revokedAt: new Date(0) };
      prisma.apiToken.findFirst.mockResolvedValue(token);
      await expect(service.revoke('u1', 't1')).resolves.toBe(token);
      expect(prisma.apiToken.update).not.toHaveBeenCalled();
    });

    it('revokes every active token of the user at once', async () => {
      prisma.apiToken.updateMany.mockResolvedValue({ count: 3 });
      await expect(service.revokeAll('u1')).resolves.toEqual({ revoked: 3 });
      const { where } = prisma.apiToken.updateMany.mock.calls[0][0];
      expect(where).toMatchObject({ userId: 'u1', revokedAt: null });
    });
  });

  it('gives usage per day for the last 30 days of an own token', async () => {
    prisma.apiToken.findFirst.mockResolvedValue({ id: 't1' });
    prisma.apiTokenUsage.findMany.mockResolvedValue([
      { day: new Date('2026-10-21T00:00:00Z'), requests: 4 },
    ]);
    await expect(service.usage('u1', 't1')).resolves.toEqual([
      { day: '2026-10-21', requests: 4 },
    ]);
    const { where } = prisma.apiTokenUsage.findMany.mock.calls[0][0];
    expect(where.tokenId).toBe('t1');
    const days = (Date.now() - where.day.gte.getTime()) / (24 * 3600 * 1000);
    expect(days).toBeGreaterThan(29);
    expect(days).toBeLessThanOrEqual(30);
  });

  it('looks tokens up by hash', async () => {
    await service.findByToken('bsf_x');
    expect(prisma.apiToken.findUnique.mock.calls[0][0].where).toEqual({
      tokenHash: hashApiToken('bsf_x'),
    });
  });

  describe('recordUse', () => {
    it('counts the request for the day and sets lastUsedAt', async () => {
      const now = new Date('2026-10-22T15:00:00Z');
      await service.recordUse('t1', now);
      expect(prisma.apiTokenUsage.upsert).toHaveBeenCalledWith({
        where: {
          tokenId_day: { tokenId: 't1', day: new Date('2026-10-22T00:00:00Z') },
        },
        create: {
          tokenId: 't1',
          day: new Date('2026-10-22T00:00:00Z'),
          requests: 1,
        },
        update: { requests: { increment: 1 } },
      });
      expect(prisma.apiToken.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { lastUsedAt: now },
      });
    });

    it('only logs failures', async () => {
      prisma.apiTokenUsage.upsert.mockRejectedValue(new Error('db down'));
      const log = jest
        .spyOn((service as any).logger, 'error')
        .mockImplementation();
      await expect(service.recordUse('t1')).resolves.toBeUndefined();
      expect(log).toHaveBeenCalled();
    });
  });

  describe('notifyRateLimit', () => {
    const token = { id: 't1', userId: 'u1', name: 'MCP' };
    const usage = { used: 96, limit: 120 };

    it('notifies the owner the first time in a day', async () => {
      prisma.apiToken.updateMany.mockResolvedValue({ count: 1 });
      await service.notifyRateLimit(token, 'warning', usage);

      expect(notifications.create).toHaveBeenCalledWith(
        {
          messageKey: 'apiTokenRateLimitWarning',
          params: { name: 'MCP', used: '96', limit: '120' },
          link: '/user/u1',
          type: 'OTHER',
        },
        ['u1'],
      );
      expect(notificationUsers.publishNotification).toHaveBeenCalledWith('u1', {
        id: 'n1',
      });
      const { where, data } = prisma.apiToken.updateMany.mock.calls[0][0];
      expect(where.id).toBe('t1');
      expect(where.OR[0]).toEqual({ rateLimitWarnedAt: null });
      expect(data.rateLimitWarnedAt).toBeInstanceOf(Date);
    });

    it('stays quiet when the owner was told in the last day', async () => {
      prisma.apiToken.updateMany.mockResolvedValue({ count: 0 });
      await service.notifyRateLimit(token, 'reached', usage);
      expect(prisma.apiToken.updateMany.mock.calls[0][0].data).toHaveProperty(
        'rateLimitReachedAt',
      );
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('uses its own message for reaching the limit, and only logs failures', async () => {
      prisma.apiToken.updateMany.mockResolvedValue({ count: 1 });
      notifications.create.mockRejectedValue(new Error('nope'));
      jest.spyOn((service as any).logger, 'error').mockImplementation();
      await expect(
        service.notifyRateLimit(token, 'reached', usage),
      ).resolves.toBeUndefined();
      expect(notifications.create.mock.calls[0][0].messageKey).toBe(
        'apiTokenRateLimitReached',
      );
    });
  });
});
