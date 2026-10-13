import {
  createExponat,
  createOrganisation,
  createSession,
  createTestContext,
  TestContext,
} from './helpers/app';

describe('organisations & members (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  const payload = (over: Record<string, unknown> = {}) => ({
    name: 'Prirodoslovni muzej',
    description: 'Muzej prirodnih znanosti',
    email: 'muzej@test.hr',
    websiteUrl: 'https://muzej.example.hr',
    mainImage: 'https://muzej.example.hr/logo.png',
    location: 'GRAD_ZAGREB',
    ...over,
  });

  describe('POST /organisations', () => {
    it('requires authentication', async () => {
      await ctx.http().post('/organisations').send(payload()).expect(401);
    });

    it('creates the organisation and makes the caller its OWNER', async () => {
      const { user, auth } = await createSession(ctx);
      const res = await ctx
        .http()
        .post('/organisations')
        .set(auth)
        .send(payload())
        .expect(201);
      expect(res.body).toMatchObject({
        name: 'Prirodoslovni muzej',
        exponatCount: 0,
      });

      const members = await ctx.prisma.organisationUser.findMany({
        where: { organisationId: res.body.id },
      });
      expect(members).toEqual([
        expect.objectContaining({ userId: user.id, role: 'OWNER' }),
      ]);
    });

    it('validates the payload', async () => {
      const { auth } = await createSession(ctx);
      for (const bad of [
        payload({ name: 'abc' }),
        payload({ email: 'nope' }),
        payload({ websiteUrl: 'not a url' }),
        payload({ location: 'MARS' }),
      ])
        await ctx.http().post('/organisations').set(auth).send(bad).expect(400);
    });

    it('a duplicate email is a 409', async () => {
      const { auth } = await createSession(ctx);
      await ctx
        .http()
        .post('/organisations')
        .set(auth)
        .send(payload())
        .expect(201);
      await ctx
        .http()
        .post('/organisations')
        .set(auth)
        .send(payload())
        .expect(409);
    });
  });

  describe('GET /organisations', () => {
    it('is public and lists only approved organisations', async () => {
      await createOrganisation(ctx, { name: 'Approved org' });
      await createOrganisation(ctx, { name: 'Pending org', isApproved: false });
      const res = await ctx.http().get('/organisations').expect(200);
      expect(res.body.map((o: any) => o.name)).toEqual(['Approved org']);
    });

    it('super users also see pending organisations', async () => {
      await createOrganisation(ctx, { name: 'Approved org' });
      await createOrganisation(ctx, { name: 'Pending org', isApproved: false });
      const { auth } = await createSession(ctx, { role: 'SUPER' });
      const res = await ctx.http().get('/organisations').set(auth).expect(200);
      expect(res.body).toHaveLength(2);
    });

    it('full-text searches by name', async () => {
      await createOrganisation(ctx, { name: 'Botanički vrt' });
      await createOrganisation(ctx, { name: 'Zoološki vrt' });
      const res = await ctx
        .http()
        .get('/organisations')
        .query({ name: 'Botanički' })
        .expect(200);
      expect(res.body.map((o: any) => o.name)).toEqual(['Botanički vrt']);
    });

    it('paginates', async () => {
      for (let i = 0; i < 5; i++)
        await createOrganisation(ctx, { name: `Org number ${i}` });
      const page = (n: number) =>
        ctx
          .http()
          .get('/organisations')
          .query({ page: n, size: 2, attribute: 'name', direction: 'asc' });
      expect((await page(1)).body.map((o: any) => o.name)).toEqual([
        'Org number 0',
        'Org number 1',
      ]);
      expect((await page(3)).body.map((o: any) => o.name)).toEqual([
        'Org number 4',
      ]);
    });

    it('rejects an invalid page size and unknown sort attributes', async () => {
      await ctx
        .http()
        .get('/organisations')
        .query({ page: 1, size: 101 })
        .expect(400);
      await ctx
        .http()
        .get('/organisations')
        .query({ attribute: 'password', direction: 'asc' })
        .expect(400);
    });
  });

  describe('GET /organisations/discover (raw SQL)', () => {
    it('ranks anonymous results by popularity', async () => {
      const quiet = await createOrganisation(ctx, { name: 'Quiet org' });
      const popular = await createOrganisation(ctx, { name: 'Popular org' });
      const fans = await Promise.all([createSession(ctx), createSession(ctx)]);
      await ctx.prisma.userOrganisationFollower.createMany({
        data: fans.map((f) => ({
          userId: f.user.id,
          organisationId: popular.id,
        })),
      });
      void quiet;

      const res = await ctx.http().get('/organisations/discover').expect(200);
      expect(res.body.map((o: any) => o.name)).toEqual([
        'Popular org',
        'Quiet org',
      ]);
      expect(res.body[0]).toMatchObject({ followerCount: 2 });
    });

    it('pushes organisations the user already follows to the bottom', async () => {
      const followed = await createOrganisation(ctx, { name: 'Aaa followed' });
      await createOrganisation(ctx, { name: 'Zzz unfollowed' });
      const { user, auth } = await createSession(ctx);
      await ctx.prisma.userOrganisationFollower.create({
        data: { userId: user.id, organisationId: followed.id },
      });
      const res = await ctx
        .http()
        .get('/organisations/discover')
        .set(auth)
        .expect(200);
      expect(res.body.map((o: any) => o.name)).toEqual([
        'Zzz unfollowed',
        'Aaa followed',
      ]);
    });
  });

  describe('GET /organisations/:id', () => {
    it('shows an approved organisation with exponats and members', async () => {
      const { user } = await createSession(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: user.id, role: 'OWNER' },
      ]);
      await createExponat(ctx, org.id, { name: 'Visible exponat' });
      await createExponat(ctx, org.id, {
        name: 'Hidden exponat',
        isApproved: false,
      });

      const res = await ctx.http().get(`/organisations/${org.id}`).expect(200);
      expect(res.body.id).toBe(org.id);
      expect(res.body.exponats.map((e: any) => e.name)).toEqual([
        'Visible exponat',
      ]);
      expect(res.body.members).toEqual([
        expect.objectContaining({ id: user.id, role: 'OWNER' }),
      ]);
    });

    it('organisation admins can see unapproved exponats', async () => {
      const { user, auth } = await createSession(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: user.id, role: 'ADMIN' },
      ]);
      await createExponat(ctx, org.id, {
        name: 'Hidden exponat',
        isApproved: false,
      });
      const res = await ctx
        .http()
        .get(`/organisations/${org.id}`)
        .set(auth)
        .expect(200);
      expect(res.body.exponats).toHaveLength(1);
    });

    it('hides an unapproved organisation from the public (404)', async () => {
      const org = await createOrganisation(ctx, { isApproved: false });
      await ctx.http().get(`/organisations/${org.id}`).expect(404);
    });

    it('404s for unknown ids', async () => {
      await ctx.http().get('/organisations/does-not-exist').expect(404);
    });
  });

  describe('membership lifecycle', () => {
    it('request -> admin accepts -> member leaves', async () => {
      const owner = await createSession(ctx);
      const joiner = await createSession(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: owner.user.id, role: 'OWNER' },
      ]);

      await ctx.http().post(`/members/${org.id}`).set(joiner.auth).expect(201);
      const requested = await ctx.prisma.organisationUser.findFirstOrThrow({
        where: { organisationId: org.id, userId: joiner.user.id },
      });
      expect(requested.role).toBe('REQUESTED');

      // owners get a notification about the request
      const ownerNotifications = await ctx
        .http()
        .get('/notification-users')
        .set(owner.auth)
        .expect(200);
      expect(ownerNotifications.body).toEqual([
        expect.objectContaining({ type: 'MEMBERSHIP_REQUEST', read: false }),
      ]);

      await ctx
        .http()
        .patch(`/members/${org.id}/${joiner.user.id}`)
        .set(owner.auth)
        .send({ role: 'MEMBER' })
        .expect(200);
      expect(
        (
          await ctx.prisma.organisationUser.findFirstOrThrow({
            where: { userId: joiner.user.id },
          })
        ).role,
      ).toBe('MEMBER');

      // the new member is told about the change
      const joinerNotifications = await ctx
        .http()
        .get('/notification-users')
        .set(joiner.auth)
        .expect(200);
      expect(joinerNotifications.body.map((n: any) => n.type)).toContain(
        'MEMBERSHIP_CHANGE',
      );

      await ctx
        .http()
        .delete(`/members/${org.id}/leave`)
        .set(joiner.auth)
        .expect(200);
      expect(
        await ctx.prisma.organisationUser.count({
          where: { userId: joiner.user.id },
        }),
      ).toBe(0);
    });

    it('lists pending requests for the applicant', async () => {
      const joiner = await createSession(ctx);
      const org = await createOrganisation(ctx);
      await ctx.http().post(`/members/${org.id}`).set(joiner.auth).expect(201);
      const res = await ctx
        .http()
        .get('/users/requests')
        .set(joiner.auth)
        .expect(200);
      expect(res.body).toEqual([
        expect.objectContaining({ id: org.id, role: 'REQUESTED' }),
      ]);
    });

    it('plain members cannot change roles; state stays untouched', async () => {
      const member = await createSession(ctx);
      const other = await createSession(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: member.user.id, role: 'MEMBER' },
        { userId: other.user.id, role: 'REQUESTED' },
      ]);
      const res = await ctx
        .http()
        .patch(`/members/${org.id}/${other.user.id}`)
        .set(member.auth)
        .send({ role: 'ADMIN' });
      // NOTE: the controller *returns* the UnauthorizedException instead of
      // throwing it, so clients see HTTP 200 with an error-shaped body.
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 401 });
      expect(
        (
          await ctx.prisma.organisationUser.findFirstOrThrow({
            where: { userId: other.user.id },
          })
        ).role,
      ).toBe('REQUESTED');
    });

    it.failing(
      'denied membership changes answer with a 401/403 status code',
      async () => {
        const member = await createSession(ctx);
        const org = await createOrganisation(ctx, {}, [
          { userId: member.user.id, role: 'MEMBER' },
        ]);
        const res = await ctx
          .http()
          .patch(`/members/${org.id}/${member.user.id}`)
          .set(member.auth)
          .send({ role: 'ADMIN' });
        expect([401, 403]).toContain(res.status);
      },
    );

    it('admins cannot promote anyone to OWNER, only the owner can (transfer)', async () => {
      const owner = await createSession(ctx);
      const admin = await createSession(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: owner.user.id, role: 'OWNER' },
        { userId: admin.user.id, role: 'ADMIN' },
      ]);

      await ctx
        .http()
        .patch(`/members/${org.id}/${admin.user.id}`)
        .set(admin.auth)
        .send({ role: 'OWNER' })
        .expect(200);
      expect(
        (
          await ctx.prisma.organisationUser.findFirstOrThrow({
            where: { userId: admin.user.id },
          })
        ).role,
      ).toBe('ADMIN');

      await ctx
        .http()
        .put(`/members/${org.id}/${admin.user.id}/transfer`)
        .set(owner.auth)
        .expect(200);
      const roles = Object.fromEntries(
        (
          await ctx.prisma.organisationUser.findMany({
            where: { organisationId: org.id },
          })
        ).map((m) => [m.userId, m.role]),
      );
      expect(roles).toEqual({
        [owner.user.id]: 'MEMBER',
        [admin.user.id]: 'OWNER',
      });
    });

    it('admins can add and remove members', async () => {
      const admin = await createSession(ctx);
      const newcomer = await createSession(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: admin.user.id, role: 'ADMIN' },
      ]);

      await ctx
        .http()
        .post(`/members/${org.id}/${newcomer.user.id}/add`)
        .set(admin.auth)
        .expect(201);
      expect(
        await ctx.prisma.organisationUser.count({
          where: { userId: newcomer.user.id },
        }),
      ).toBe(1);

      await ctx
        .http()
        .delete(`/members/${org.id}/${newcomer.user.id}/remove`)
        .set(admin.auth)
        .expect(200);
      expect(
        await ctx.prisma.organisationUser.count({
          where: { userId: newcomer.user.id },
        }),
      ).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Authorisation holes found while writing the unit tests, confirmed here over
  // real HTTP. They assert the *correct* behaviour and are marked `failing`
  // until fixed; remove `.failing` together with the fix.
  // ---------------------------------------------------------------------------
  describe('authorisation of organisation management', () => {
    it('admins can update their organisation', async () => {
      const admin = await createSession(ctx);
      const org = await createOrganisation(ctx, { name: 'Old name here' }, [
        { userId: admin.user.id, role: 'ADMIN' },
      ]);
      await ctx
        .http()
        .patch(`/organisations/${org.id}`)
        .set(admin.auth)
        .send(payload({ name: 'New name here', email: org.email }))
        .expect(200);
      expect(
        (
          await ctx.prisma.organisation.findUniqueOrThrow({
            where: { id: org.id },
          })
        ).name,
      ).toBe('New name here');
    });

    it.failing(
      'a stranger cannot update someone else’s organisation',
      async () => {
        const stranger = await createSession(ctx);
        const org = await createOrganisation(ctx, { name: 'Original name' });
        const res = await ctx
          .http()
          .patch(`/organisations/${org.id}`)
          .set(stranger.auth)
          .send(payload({ name: 'Hijacked name', email: org.email }));
        expect([401, 403]).toContain(res.status);
        expect(
          (
            await ctx.prisma.organisation.findUniqueOrThrow({
              where: { id: org.id },
            })
          ).name,
        ).toBe('Original name');
      },
    );

    it.failing(
      'a stranger cannot delete someone else’s organisation',
      async () => {
        const stranger = await createSession(ctx);
        const org = await createOrganisation(ctx);
        await ctx.http().delete(`/organisations/${org.id}`).set(stranger.auth);
        expect(
          await ctx.prisma.organisation.count({ where: { id: org.id } }),
        ).toBe(1);
      },
    );

    it.failing(
      'a stranger cannot read the join requests (with emails) of an organisation',
      async () => {
        const stranger = await createSession(ctx);
        const applicant = await createSession(ctx);
        const org = await createOrganisation(ctx, {}, [
          { userId: applicant.user.id, role: 'REQUESTED' },
        ]);
        const res = await ctx
          .http()
          .get(`/organisations/${org.id}/requests`)
          .set(stranger.auth);
        expect(res.body).not.toEqual([
          expect.objectContaining({
            user: expect.objectContaining({ email: applicant.user.email }),
          }),
        ]);
      },
    );

    it.failing('approval can only be toggled by a super user', async () => {
      const org = await createOrganisation(ctx, { isApproved: false });
      await ctx.http().patch(`/organisations/${org.id}/approval`);
      expect(
        (
          await ctx.prisma.organisation.findUniqueOrThrow({
            where: { id: org.id },
          })
        ).isApproved,
      ).toBe(false);
    });

    it('toggling approval flips the flag and notifies the members', async () => {
      const member = await createSession(ctx);
      const org = await createOrganisation(ctx, { isApproved: false }, [
        { userId: member.user.id, role: 'MEMBER' },
      ]);
      await ctx.http().patch(`/organisations/${org.id}/approval`).expect(200);
      expect(
        (
          await ctx.prisma.organisation.findUniqueOrThrow({
            where: { id: org.id },
          })
        ).isApproved,
      ).toBe(true);
      const notes = await ctx
        .http()
        .get('/notification-users')
        .set(member.auth)
        .expect(200);
      expect(notes.body.map((n: any) => n.type)).toContain(
        'ORGANISATION_APPROVAL',
      );
    });
  });
});
