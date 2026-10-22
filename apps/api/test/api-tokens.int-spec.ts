import { hashApiToken } from 'src/api-tokens/api-token';
import {
  createOrganisation,
  createSession,
  createTestContext,
  createUser,
  TestContext,
} from './helpers/app';

describe('personal access tokens (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  const createToken = async (
    auth: Record<string, string>,
    body: Record<string, unknown> = {},
  ) => {
    const res = await ctx
      .http()
      .post('/auth/tokens')
      .set(auth)
      .send({ name: 'Script', scopes: ['READ', 'WRITE'], ...body })
      .expect(201);
    return res.body;
  };

  // Usage is recorded alongside the request.
  const eventually = async (check: () => Promise<void>) => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await check();
      } catch (error) {
        if (attempt > 40) throw error;
        await new Promise((r) => setTimeout(r, 50));
      }
    }
  };

  it('creates a token, works like a login and stops working once revoked', async () => {
    const session = await createSession(ctx);
    const created = await createToken(session.auth);
    expect(created.token).toMatch(/^bsf_[A-Za-z0-9_-]{43}$/);
    expect(created.prefix).toBe(created.token.slice(4, 12));

    const me = await ctx
      .http()
      .get('/auth/me')
      .set(bearer(created.token))
      .expect(200);
    expect(me.body).toMatchObject({
      id: session.user.id,
      email: session.user.email,
      role: 'user',
      tokenId: created.id,
    });

    await ctx
      .http()
      .delete(`/auth/tokens/${created.id}`)
      .set(session.auth)
      .expect(200);
    const refused = await ctx
      .http()
      .get('/auth/me')
      .set(bearer(created.token))
      .expect(401);
    expect(refused.body.message).toBe('Invalid, expired or revoked API token');
  });

  it('shows the token once and never its hash', async () => {
    const session = await createSession(ctx);
    const created = await createToken(session.auth);
    const stored = await ctx.prisma.apiToken.findUniqueOrThrow({
      where: { id: created.id },
    });
    expect(stored.tokenHash).toBe(hashApiToken(created.token));
    expect(JSON.stringify(stored)).not.toContain(created.token);

    const list = await ctx
      .http()
      .get('/auth/tokens')
      .set(session.auth)
      .expect(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0]).toEqual({
      id: created.id,
      name: 'Script',
      prefix: created.prefix,
      scopes: ['READ', 'WRITE'],
      createdAt: expect.any(String),
      expiresAt: expect.any(String),
      lastUsedAt: null,
      revokedAt: null,
    });
    expect(JSON.stringify(list.body)).not.toContain(created.token);
    expect(JSON.stringify(list.body)).not.toContain(stored.tokenHash);
  });

  it('expires after 90 days by default, after a chosen time, or never', async () => {
    const session = await createSession(ctx);
    const day = 24 * 60 * 60 * 1000;
    const inDays = (token: { expiresAt: string }) =>
      Math.round((new Date(token.expiresAt).getTime() - Date.now()) / day);

    expect(inDays(await createToken(session.auth))).toBe(90);
    expect(inDays(await createToken(session.auth, { expiresInDays: 7 }))).toBe(
      7,
    );
    expect(
      (await createToken(session.auth, { expiresInDays: null })).expiresAt,
    ).toBeNull();

    for (const expiresInDays of [0, 366, 1.5, 'soon'])
      await ctx
        .http()
        .post('/auth/tokens')
        .set(session.auth)
        .send({ name: 'x', scopes: ['READ'], expiresInDays })
        .expect(400);
  });

  it('refuses an expired token', async () => {
    const session = await createSession(ctx);
    const created = await createToken(session.auth, { expiresInDays: 1 });
    await ctx.prisma.apiToken.update({
      where: { id: created.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await ctx.http().get('/auth/me').set(bearer(created.token)).expect(401);
  });

  it('validates name and scopes', async () => {
    const session = await createSession(ctx);
    for (const body of [
      { name: '', scopes: ['READ'] },
      { name: 'x'.repeat(61), scopes: ['READ'] },
      { name: 'x', scopes: [] },
      { name: 'x', scopes: ['ADMIN'] },
      { name: 'x' },
    ])
      await ctx
        .http()
        .post('/auth/tokens')
        .set(session.auth)
        .send(body)
        .expect(400);
  });

  it('lets a read-only token read but not write', async () => {
    const session = await createSession(ctx);
    const { token } = await createToken(session.auth, { scopes: ['READ'] });

    await ctx.http().get('/auth/me').set(bearer(token)).expect(200);
    const res = await ctx
      .http()
      .patch('/users/language')
      .set(bearer(token))
      .send({ language: 'HR' })
      .expect(403);
    expect(res.body.message).toBe('This token is read-only');
  });

  it('lets a read and write token change things', async () => {
    const session = await createSession(ctx);
    const { token } = await createToken(session.auth);
    await ctx
      .http()
      .patch('/users/language')
      .set(bearer(token))
      .send({ language: 'HR' })
      .expect(200);
    expect(
      (
        await ctx.prisma.user.findUniqueOrThrow({
          where: { id: session.user.id },
        })
      ).language,
    ).toBe('HR');
  });

  it('cannot manage tokens or delete the account', async () => {
    const session = await createSession(ctx);
    const { id, token } = await createToken(session.auth);
    const auth = bearer(token);

    const attempts = [
      () => ctx.http().get('/auth/tokens').set(auth),
      () =>
        ctx
          .http()
          .post('/auth/tokens')
          .set(auth)
          .send({ name: 'more', scopes: ['READ'] }),
      () => ctx.http().delete(`/auth/tokens/${id}`).set(auth),
      () => ctx.http().delete('/auth/tokens').set(auth),
      () => ctx.http().get(`/auth/tokens/${id}/usage`).set(auth),
      () => ctx.http().delete('/users').set(auth),
    ];
    for (const attempt of attempts) {
      const res = await attempt().expect(403);
      expect(res.body.message).toBe(
        'This action needs a login, not an API token',
      );
    }
    expect(await ctx.prisma.apiToken.count()).toBe(1);
    expect(
      await ctx.prisma.user.count({ where: { id: session.user.id } }),
    ).toBe(1);
  });

  it('answers a bad bsf_ token with 401 on routes where login is optional', async () => {
    const user = await createUser(ctx);
    await ctx.http().get(`/users/${user.id}`).expect(200);
    await ctx
      .http()
      .get(`/users/${user.id}`)
      .set(bearer('bsf_not-a-real-token'))
      .expect(401);
  });

  it('logs the requester in on routes where login is optional', async () => {
    const session = await createSession(ctx);
    const { token } = await createToken(session.auth);
    const res = await ctx
      .http()
      .get(`/users/${session.user.id}`)
      .set(bearer(token))
      .expect(200);
    // Only the user themself sees their e-mail.
    expect(res.body.email).toBe(session.user.email);
  });

  it('records usage per day and when the token was last used', async () => {
    const session = await createSession(ctx);
    const { id, token } = await createToken(session.auth);
    for (let i = 0; i < 3; i++)
      await ctx.http().get('/auth/me').set(bearer(token)).expect(200);

    await eventually(async () => {
      const usage = await ctx
        .http()
        .get(`/auth/tokens/${id}/usage`)
        .set(session.auth)
        .expect(200);
      expect(usage.body).toEqual([
        { day: new Date().toISOString().slice(0, 10), requests: 3 },
      ]);
    });
    const stored = await ctx.prisma.apiToken.findUniqueOrThrow({
      where: { id },
    });
    expect(stored.lastUsedAt).not.toBeNull();
  });

  it('has the rights of its user: a non-member cannot edit an organisation', async () => {
    const session = await createSession(ctx);
    const { token } = await createToken(session.auth);
    const org = await createOrganisation(ctx, { name: 'Original name' });

    const res = await ctx
      .http()
      .patch(`/organisations/${org.id}`)
      .set(bearer(token))
      .send({
        name: 'Hijacked name',
        description: 'Muzej prirodnih znanosti',
        email: org.email,
        websiteUrl: 'https://muzej.example.hr',
        mainImage: 'https://muzej.example.hr/logo.png',
        location: 'GRAD_ZAGREB',
      });
    expect([401, 403]).toContain(res.status);
    expect(
      (
        await ctx.prisma.organisation.findUniqueOrThrow({
          where: { id: org.id },
        })
      ).name,
    ).toBe('Original name');
  });

  it('follows the user’s current role', async () => {
    const session = await createSession(ctx);
    const { token } = await createToken(session.auth);
    await ctx.prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'SUPER' },
    });
    const me = await ctx.http().get('/auth/me').set(bearer(token)).expect(200);
    expect(me.body.role).toBe('super');
  });

  it('stops working when its user is deleted or deactivated', async () => {
    const session = await createSession(ctx);
    const { token } = await createToken(session.auth);
    await ctx.prisma.user.update({
      where: { id: session.user.id },
      data: { isActivated: false },
    });
    await ctx.http().get('/auth/me').set(bearer(token)).expect(401);

    await ctx.prisma.user.delete({ where: { id: session.user.id } });
    await ctx.http().get('/auth/me').set(bearer(token)).expect(401);
    expect(await ctx.prisma.apiToken.count()).toBe(0);
  });

  it('allows 10 active tokens; revoked ones do not count', async () => {
    const session = await createSession(ctx);
    const tokens = [];
    for (let i = 0; i < 10; i++) tokens.push(await createToken(session.auth));

    const res = await ctx
      .http()
      .post('/auth/tokens')
      .set(session.auth)
      .send({ name: 'eleventh', scopes: ['READ'] })
      .expect(400);
    expect(res.body.message).toBe('You can have at most 10 active API tokens');

    await ctx
      .http()
      .delete(`/auth/tokens/${tokens[0].id}`)
      .set(session.auth)
      .expect(200);
    await createToken(session.auth);
  });

  it('only shows and revokes the user’s own tokens', async () => {
    const owner = await createSession(ctx);
    const other = await createSession(ctx);
    const { id, token } = await createToken(owner.auth);

    await ctx.http().delete(`/auth/tokens/${id}`).set(other.auth).expect(404);
    await ctx
      .http()
      .get(`/auth/tokens/${id}/usage`)
      .set(other.auth)
      .expect(404);
    expect(
      (await ctx.http().get('/auth/tokens').set(other.auth).expect(200)).body,
    ).toEqual([]);
    await ctx.http().get('/auth/me').set(bearer(token)).expect(200);
  });

  it('revokes all active tokens at once', async () => {
    const session = await createSession(ctx);
    const first = await createToken(session.auth);
    const second = await createToken(session.auth);

    const res = await ctx
      .http()
      .delete('/auth/tokens')
      .set(session.auth)
      .expect(200);
    expect(res.body).toEqual({ revoked: 2 });
    for (const { token } of [first, second])
      await ctx.http().get('/auth/me').set(bearer(token)).expect(401);
  });

  it('limits a token to 120 requests a minute and tells the user at 80% and 100%', async () => {
    const session = await createSession(ctx);
    const { token } = await createToken(session.auth, { name: 'Busy script' });

    for (let i = 0; i < 120; i++)
      await ctx.http().get('/auth/me').set(bearer(token)).expect(200);
    const refused = await ctx
      .http()
      .get('/auth/me')
      .set(bearer(token))
      .expect(429);
    expect(refused.headers['retry-after']).toBeDefined();
    expect(refused.headers['x-ratelimit-remaining']).toBe('0');

    // A login is not limited.
    await ctx.http().get('/auth/me').set(session.auth).expect(200);

    await eventually(async () => {
      const notifications = await ctx.prisma.notification.findMany({
        where: { UserNotification: { some: { userId: session.user.id } } },
        orderBy: { createdAt: 'asc' },
      });
      expect(notifications.map((n) => n.messageKey).sort()).toEqual([
        'apiTokenRateLimitReached',
        'apiTokenRateLimitWarning',
      ]);
      expect(
        notifications.find((n) => n.messageKey === 'apiTokenRateLimitWarning')
          .params,
      ).toEqual({ name: 'Busy script', used: '96', limit: '120' });
    });
  });

  describe('password reset', () => {
    const resetPassword = async (email: string) => {
      await ctx.http().post(`/users/forgot-password/${email}`).expect(201);
      const code = ctx.mails
        .at(-1)
        .text.match(/\/resetPassword\/([0-9a-f]{64})/)[1];
      return ctx
        .http()
        .post(`/users/reset-password/${code}`)
        .send({ newPassword: 'N3w!Passw0rd-xyz' })
        .expect(201);
    };

    it('keeps the tokens, logs the user in and says how many are active', async () => {
      const session = await createSession(ctx);
      const kept = await createToken(session.auth);
      const revoked = await createToken(session.auth);
      await ctx
        .http()
        .delete(`/auth/tokens/${revoked.id}`)
        .set(session.auth)
        .expect(200);

      const res = await resetPassword(session.user.email);
      expect(res.body).toEqual({
        access_token: expect.any(String),
        activeApiTokens: 1,
      });
      await ctx.http().get('/auth/me').set(bearer(kept.token)).expect(200);

      // The new login can revoke them.
      await ctx
        .http()
        .delete('/auth/tokens')
        .set(bearer(res.body.access_token))
        .expect(200);
      await ctx.http().get('/auth/me').set(bearer(kept.token)).expect(401);
    });

    it('gives an account that is not activated no login', async () => {
      const user = await createUser(ctx, { isActivated: false });
      const res = await resetPassword(user.email);
      expect(res.body).toEqual({ access_token: null, activeApiTokens: 0 });
    });
  });
});
