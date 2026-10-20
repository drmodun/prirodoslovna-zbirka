import {
  createSession,
  createTestContext,
  createUser,
  PASSWORD,
  TestContext,
} from './helpers/app';

describe('auth & user registration (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  const registration = (over: Record<string, unknown> = {}) => ({
    firstName: 'Ana',
    lastName: 'Anić',
    username: 'ana',
    bio: 'Hello',
    location: 'GRAD_ZAGREB',
    email: 'ana@test.hr',
    password: PASSWORD,
    ...over,
  });

  describe('POST /users (register)', () => {
    it('creates an inactive user with a hashed password and emails an activation link', async () => {
      const res = await ctx
        .http()
        .post('/users')
        .send(registration())
        .expect(201);
      const id = res.text;

      const stored = await ctx.prisma.user.findUniqueOrThrow({ where: { id } });
      expect(stored.isActivated).toBe(false);
      expect(stored.role).toBe('USER');
      expect(stored.password).not.toBe(PASSWORD);

      expect(ctx.mails).toHaveLength(1);
      expect(ctx.mails[0].to).toBe('ana@test.hr');
      expect(ctx.mails[0].text).toContain(
        `http://web.test/activateUser/${stored.activationCode}`,
      );
    });

    it('registers a user who leaves the optional bio out', async () => {
      const { bio, ...withoutBio } = registration();
      void bio;
      await ctx.http().post('/users').send(withoutBio).expect(201);
    });

    it('ignores attempts to set privileged fields (mass assignment)', async () => {
      const res = await ctx
        .http()
        .post('/users')
        .send(registration({ role: 'SUPER', isActivated: true }))
        .expect(201);
      const stored = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: res.text },
      });
      expect(stored.role).toBe('USER');
      expect(stored.isActivated).toBe(false);
    });

    it.each([
      ['weak password', { password: 'abc' }],
      ['invalid email', { email: 'nope' }],
      ['unknown county', { location: 'ATLANTIS' }],
      ['short first name', { firstName: 'A' }],
    ])('rejects %s with 400', async (_name, over) => {
      await ctx.http().post('/users').send(registration(over)).expect(400);
      expect(await ctx.prisma.user.count()).toBe(0);
    });

    it('rejects a duplicate email with 409 (Prisma P2002 mapped by the filter)', async () => {
      await ctx.http().post('/users').send(registration()).expect(201);
      await ctx
        .http()
        .post('/users')
        .send(registration({ username: 'other' }))
        .expect(409);
    });
  });

  describe('activation', () => {
    it('only activated users can log in', async () => {
      const user = await createUser(ctx, { isActivated: false });
      await ctx
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: PASSWORD })
        .expect(400);

      await ctx.http().post(`/users/verify/${user.activationCode}`).expect(201);

      await ctx
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: PASSWORD })
        .expect(201);
    });

    it('an unknown activation code is a 404', async () => {
      await ctx.http().post('/users/verify/not-a-code').expect(404);
    });
  });

  describe('POST /auth/login', () => {
    it('returns a JWT that carries id, email and role', async () => {
      const user = await createUser(ctx, { role: 'ADMIN' });
      const res = await ctx
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: PASSWORD })
        .expect(201);

      const payload = JSON.parse(
        Buffer.from(
          res.body.access_token.split('.')[1],
          'base64url',
        ).toString(),
      );
      expect(payload).toMatchObject({
        id: user.id,
        email: user.email,
        role: 'admin',
      });
      expect(payload.exp - payload.iat).toBe(24 * 3600);
    });

    it('rejects a wrong password and an unknown user the same way (400)', async () => {
      const user = await createUser(ctx);
      await ctx
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: 'Wrong!Passw0rd' })
        .expect(400);
      await ctx
        .http()
        .post('/auth/login')
        .send({ email: 'ghost@test.hr', password: PASSWORD })
        .expect(400);
    });

    it('validates the payload', async () => {
      await ctx
        .http()
        .post('/auth/login')
        .send({ email: 'x', password: 'y' })
        .expect(400);
      await ctx.http().post('/auth/login').send({}).expect(400);
    });
  });

  describe('protected routes', () => {
    it('GET /auth/me needs a token', async () => {
      await ctx.http().get('/auth/me').expect(401);
      await ctx
        .http()
        .get('/auth/me')
        .set('Authorization', 'Bearer garbage')
        .expect(401);
    });

    it('GET /auth/me echoes the token payload', async () => {
      const { user, auth } = await createSession(ctx);
      const res = await ctx.http().get('/auth/me').set(auth).expect(200);
      expect(res.body).toEqual({
        id: user.id,
        email: user.email,
        role: 'user',
      });
    });

    it('a token stops working once the user is deleted', async () => {
      const { user, auth } = await createSession(ctx);
      await ctx.prisma.user.delete({ where: { id: user.id } });
      const res = await ctx.http().get('/auth/me').set(auth);
      // The JWT strategy loads the user with findUniqueOrThrow, so the Prisma
      // P2025 is mapped to 404 rather than 401. Either way access is denied.
      expect(res.status).toBe(404);
    });

    it('GET /auth/detailed returns the full profile of the caller', async () => {
      const { user, auth } = await createSession(ctx);
      const res = await ctx.http().get('/auth/detailed').set(auth).expect(200);
      expect(res.body).toMatchObject({
        id: user.id,
        email: user.email,
        followerCount: 0,
        posts: [],
        memberships: [],
      });
      expect(res.body).not.toHaveProperty('password');
    });
  });

  describe('password reset', () => {
    it('emails a reset link and lets the user choose a new password', async () => {
      const user = await createUser(ctx);
      await ctx.http().post(`/users/forgot-password/${user.email}`).expect(201);
      expect(ctx.mails[0].text).toContain(
        `/resetPassword/${user.activationCode}`,
      );

      await ctx
        .http()
        .post(`/users/reset-password/${user.activationCode}`)
        .send({ newPassword: 'N3w!Passw0rd-xyz' })
        .expect(201);

      await ctx
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: PASSWORD })
        .expect(400);
      await ctx
        .http()
        .post('/auth/login')
        .send({ email: user.email, password: 'N3w!Passw0rd-xyz' })
        .expect(201);
    });

    it('forgot-password for an unknown email is an error and sends nothing', async () => {
      const res = await ctx.http().post('/users/forgot-password/ghost@test.hr');
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(ctx.mails).toHaveLength(0);
    });
  });
});
