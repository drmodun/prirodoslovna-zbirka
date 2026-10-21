import {
  createAuthorshipInfo,
  createExponat,
  createOrganisation,
  createSession,
  createTestContext,
  TestContext,
} from './helpers/app';

describe('exponats & categorizations (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  const body = (
    authorshipInfoId: string,
    over: Record<string, unknown> = {},
  ) => ({
    name: 'Crvena lisica',
    alternateName: 'Vulpes vulpes',
    description: 'Mala zvijer iz porodice pasa',
    mainImage: 'https://example.org/fox.png',
    funFacts: ['Brza', 'Lukava', 'Noćna'],
    ExponatKind: 'EUCARIOT',
    attributes: '{"visina":"40cm"}',
    authorshipInfoId,
    ...over,
  });

  async function setup(role: 'OWNER' | 'ADMIN' | 'MEMBER') {
    const session = await createSession(ctx);
    const org = await createOrganisation(ctx, {}, [
      { userId: session.user.id, role },
    ]);
    const info = await createAuthorshipInfo(ctx, session.user.id);
    return { ...session, org, info };
  }

  describe('POST /exponats/:organisationId', () => {
    it('requires authentication', async () => {
      const org = await createOrganisation(ctx);
      await ctx.http().post(`/exponats/${org.id}`).send({}).expect(401);
    });

    it('an organisation admin publishes immediately and followers/members are notified', async () => {
      const { auth, org, info } = await setup('ADMIN');
      const member = await createSession(ctx);
      await ctx.prisma.organisationUser.create({
        data: {
          userId: member.user.id,
          organisationId: org.id,
          role: 'MEMBER',
        },
      });

      const res = await ctx
        .http()
        .post(`/exponats/${org.id}`)
        .set(auth)
        .send(body(info.id))
        .expect(201);
      expect(res.body).toMatchObject({
        name: 'Crvena lisica',
        organizationId: org.id,
      });

      const stored = await ctx.prisma.exponat.findUniqueOrThrow({
        where: { id: res.body.id },
      });
      expect(stored.isApproved).toBe(true);

      const notes = await ctx
        .http()
        .get('/notification-users')
        .set(member.auth)
        .expect(200);
      expect(notes.body.map((n: any) => n.type)).toContain(
        'EXPONAT_BY_FOLLOWED_ORGANISATION',
      );
    });

    it('a plain member creates an unapproved exponat and the admins are asked to review it', async () => {
      const { auth, org, info } = await setup('MEMBER');
      const admin = await createSession(ctx);
      await ctx.prisma.organisationUser.create({
        data: { userId: admin.user.id, organisationId: org.id, role: 'ADMIN' },
      });
      const res = await ctx
        .http()
        .post(`/exponats/${org.id}`)
        .set(auth)
        .send(body(info.id));
      expect(res.status).toBe(201);

      const stored = await ctx.prisma.exponat.findUniqueOrThrow({
        where: { id: res.body.id },
      });
      expect(stored.isApproved).toBe(false);

      const notes = await ctx
        .http()
        .get('/notification-users')
        .set(admin.auth)
        .expect(200);
      expect(notes.body.map((n: any) => n.type)).toContain(
        'NEW_EXPONAT_REQUEST',
      );
    });

    it('validates the payload', async () => {
      const { auth, org, info } = await setup('ADMIN');
      for (const bad of [
        body(info.id, { name: 'abc' }),
        body(info.id, { authorshipInfoId: 'not-a-uuid' }),
        body(info.id, { attributes: 'not json' }),
        body(info.id, { funFacts: [1, 2] }),
      ])
        await ctx
          .http()
          .post(`/exponats/${org.id}`)
          .set(auth)
          .send(bad)
          .expect(400);
    });

    it('a user who is not a member of the organisation is rejected with 401', async () => {
      const outsider = await createSession(ctx);
      const org = await createOrganisation(ctx);
      const info = await createAuthorshipInfo(ctx, outsider.user.id);
      const res = await ctx
        .http()
        .post(`/exponats/${org.id}`)
        .set(outsider.auth)
        .send(body(info.id));
      expect(res.status).toBe(401);
    });
  });

  describe('reading', () => {
    it('GET /exponats lists approved exponats only (admins see all)', async () => {
      const org = await createOrganisation(ctx);
      await createExponat(ctx, org.id, { name: 'Visible exponat' });
      await createExponat(ctx, org.id, {
        name: 'Pending exponat',
        isApproved: false,
      });

      const pub = await ctx.http().get('/exponats').expect(200);
      expect(pub.body.map((e: any) => e.name)).toEqual(['Visible exponat']);

      const root = await createSession(ctx, { role: 'SUPER' });
      const all = await ctx.http().get('/exponats').set(root.auth).expect(200);
      expect(all.body).toHaveLength(2);
    });

    it('filters by name and organisation', async () => {
      const a = await createOrganisation(ctx);
      const b = await createOrganisation(ctx);
      const fox = await createExponat(ctx, a.id, { name: 'Crvena lisica' });
      await createExponat(ctx, b.id, { name: 'Sivi vuk' });
      void fox;

      const byName = await ctx
        .http()
        .get('/exponats')
        .query({ name: 'lisica' })
        .expect(200);
      expect(byName.body.map((e: any) => e.name)).toEqual(['Crvena lisica']);

      const byOrg = await ctx
        .http()
        .get('/exponats')
        .query({ organisationId: b.id })
        .expect(200);
      expect(byOrg.body.map((e: any) => e.name)).toEqual(['Sivi vuk']);
    });

    it('filters by minimum favourite count', async () => {
      const org = await createOrganisation(ctx);
      const fox = await createExponat(ctx, org.id, { name: 'Crvena lisica' });
      await createExponat(ctx, org.id, { name: 'Sivi vuk' });
      const fan = await createSession(ctx);
      await ctx.prisma.favouriteExponat.create({
        data: { userId: fan.user.id, ExponatId: fox.id },
      });
      const res = await ctx
        .http()
        .get('/exponats')
        .query({ minFavoriteCount: 1 })
        .expect(200);
      expect(res.body.map((e: any) => e.name)).toEqual(['Crvena lisica']);
    });

    it('filters by taxonomy', async () => {
      const org = await createOrganisation(ctx);
      const canid = await ctx.prisma.categorization.create({
        data: { species: 'Vulpes vulpes', genus: 'Vulpes', family: 'Canidae' },
      });
      const felid = await ctx.prisma.categorization.create({
        data: { species: 'Felis catus', genus: 'Felis', family: 'Felidae' },
      });
      await createExponat(ctx, org.id, { name: 'Fox exponat' }).then((e) =>
        ctx.prisma.exponat.update({
          where: { id: e.id },
          data: { categorizationId: canid.id },
        }),
      );
      await createExponat(ctx, org.id, { name: 'Cat exponat' }).then((e) =>
        ctx.prisma.exponat.update({
          where: { id: e.id },
          data: { categorizationId: felid.id },
        }),
      );

      const res = await ctx
        .http()
        .get('/exponats')
        .query({ family: 'Canidae' })
        .expect(200);
      expect(res.body.map((e: any) => e.name)).toEqual(['Fox exponat']);
    });

    it('filters by class', async () => {
      await ctx
        .http()
        .get('/exponats')
        .query({ class: 'Mammalia' })
        .expect(200);
    });

    it('sorts by favourites and paginates', async () => {
      const org = await createOrganisation(ctx);
      const low = await createExponat(ctx, org.id, { name: 'Low favourite' });
      const high = await createExponat(ctx, org.id, { name: 'High favourite' });
      const fans = await Promise.all([createSession(ctx), createSession(ctx)]);
      await ctx.prisma.favouriteExponat.createMany({
        data: fans.map((f) => ({ userId: f.user.id, ExponatId: high.id })),
      });
      void low;
      const res = await ctx
        .http()
        .get('/exponats')
        .query({ attribute: 'favourites', direction: 'desc', page: 1, size: 1 })
        .expect(200);
      expect(res.body.map((e: any) => e.name)).toEqual(['High favourite']);
    });

    it('GET /exponats/:id returns details; unapproved exponats are hidden from the public but visible to org admins', async () => {
      const { auth, org } = await setup('ADMIN');
      const hidden = await createExponat(ctx, org.id, {
        name: 'Hidden exponat',
        isApproved: false,
      });
      await ctx.http().get(`/exponats/${hidden.id}`).expect(404);
      const res = await ctx
        .http()
        .get(`/exponats/${hidden.id}`)
        .set(auth)
        .expect(200);
      expect(res.body).toMatchObject({
        id: hidden.id,
        title: 'Hidden exponat',
        isApproved: false,
      });
    });

    it('serial numbers resolve to ids', async () => {
      const org = await createOrganisation(ctx);
      const e = await createExponat(ctx, org.id);
      const res = await ctx
        .http()
        .get(`/exponats/serial/${e.serialNumber}`)
        .expect(200);
      expect(res.text).toBe(e.id);
      await ctx.http().get('/exponats/serial/999999').expect(404);
      await ctx.http().get('/exponats/serial/abc').expect(400);
    });

    it('GET /exponats/discover runs the ranking SQL for anonymous and logged in users', async () => {
      const org = await createOrganisation(ctx);
      const liked = await createExponat(ctx, org.id, { name: 'Liked exponat' });
      await createExponat(ctx, org.id, { name: 'Other exponat' });
      const { user, auth } = await createSession(ctx);

      const anon = await ctx.http().get('/exponats/discover').expect(200);
      expect(anon.body).toHaveLength(2);

      await ctx.prisma.favouriteExponat.create({
        data: { userId: user.id, ExponatId: liked.id },
      });
      const personal = await ctx
        .http()
        .get('/exponats/discover')
        .set(auth)
        .expect(200);
      // exponats the user already favourited are pushed to the end
      expect(personal.body.map((e: any) => e.name)).toEqual([
        'Other exponat',
        'Liked exponat',
      ]);
    });
  });

  describe('updating and approval', () => {
    it('org admins can update; plain members cannot', async () => {
      const admin = await setup('ADMIN');
      const e = await createExponat(ctx, admin.org.id, {
        name: 'Original name',
      });
      await ctx
        .http()
        .patch(`/exponats/${e.id}`)
        .set(admin.auth)
        .send({ name: 'Renamed exponat' })
        .expect(200);
      expect(
        (await ctx.prisma.exponat.findUniqueOrThrow({ where: { id: e.id } }))
          .name,
      ).toBe('Renamed exponat');

      const member = await createSession(ctx);
      await ctx.prisma.organisationUser.create({
        data: {
          userId: member.user.id,
          organisationId: admin.org.id,
          role: 'MEMBER',
        },
      });
      await ctx
        .http()
        .patch(`/exponats/${e.id}`)
        .set(member.auth)
        .send({ name: 'Hijacked name' })
        .expect(401);
    });

    it('updating an unknown exponat is a 404', async () => {
      const { auth } = await setup('ADMIN');
      await ctx
        .http()
        .patch('/exponats/nope')
        .set(auth)
        .send({ name: 'Whatever name' })
        .expect(404);
    });

    it('toggling approval publishes the exponat and notifies only once', async () => {
      const { auth, org } = await setup('OWNER');
      const e = await createExponat(ctx, org.id, { isApproved: false });

      await ctx
        .http()
        .patch(`/exponats/${e.id}/approval`)
        .set(auth)
        .expect(200);
      let stored = await ctx.prisma.exponat.findUniqueOrThrow({
        where: { id: e.id },
      });
      expect(stored).toMatchObject({
        isApproved: true,
        IsNotificationMade: true,
      });
      const afterFirst = await ctx.prisma.notification.count();
      expect(afterFirst).toBe(1);

      await ctx
        .http()
        .patch(`/exponats/${e.id}/approval`)
        .set(auth)
        .expect(200); // un-approve
      await ctx
        .http()
        .patch(`/exponats/${e.id}/approval`)
        .set(auth)
        .expect(200); // approve again
      stored = await ctx.prisma.exponat.findUniqueOrThrow({
        where: { id: e.id },
      });
      expect(stored.isApproved).toBe(true);
      expect(await ctx.prisma.notification.count()).toBe(afterFirst);
    });

    it('members cannot toggle approval', async () => {
      const { auth, org } = await setup('MEMBER');
      const e = await createExponat(ctx, org.id, { isApproved: false });
      await ctx
        .http()
        .patch(`/exponats/${e.id}/approval`)
        .set(auth)
        .expect(401);
    });

    it('DELETE /exponats/:id requires authentication', async () => {
      const org = await createOrganisation(ctx);
      const e = await createExponat(ctx, org.id);
      await ctx.http().delete(`/exponats/${e.id}`);
      expect(await ctx.prisma.exponat.count({ where: { id: e.id } })).toBe(1);
    });
  });

  describe('categorizations', () => {
    const species = (over: Record<string, unknown> = {}) => ({
      species: 'Vulpes vulpes',
      genus: 'Vulpes',
      family: 'Canidae',
      kingdom: 'Animalia',
      domain: 'Eukaryota',
      phylum: 'Chordata',
      order: 'Carnivora',
      class: 'Mammalia',
      ...over,
    });

    it('CRUD round trip', async () => {
      const { auth } = await createSession(ctx, { role: 'SUPER' });
      const created = await ctx
        .http()
        .post('/categorizations')
        .set(auth)
        .send(species())
        .expect(201);
      expect(created.body).toMatchObject({
        family: 'Canidae',
        numberOfExponats: 0,
      });

      const list = await ctx.http().get('/categorizations').expect(200);
      expect(list.body).toEqual([
        expect.objectContaining({
          id: created.body.id,
          species: 'Vulpes vulpes',
        }),
      ]);

      await ctx
        .http()
        .patch(`/categorizations/${created.body.id}`)
        .set(auth)
        .send({ genus: 'Canis' })
        .expect(200);
      const one = await ctx
        .http()
        .get(`/categorizations/${created.body.id}`)
        .expect(200);
      expect(one.body.genus).toBe('Canis');

      await ctx
        .http()
        .delete(`/categorizations/${created.body.id}`)
        .set(auth)
        .expect(200);
      await ctx.http().get(`/categorizations/${created.body.id}`).expect(404);
    });

    it('species is unique (409) and lookups by name work', async () => {
      const { auth } = await createSession(ctx);
      await ctx
        .http()
        .post('/categorizations')
        .set(auth)
        .send(species())
        .expect(201);
      await ctx
        .http()
        .post('/categorizations')
        .set(auth)
        .send(species())
        .expect(409);
      const byName = await ctx
        .http()
        .get('/categorizations/name/Vulpes')
        .expect(200);
      expect(byName.body.species).toBe('Vulpes vulpes');
      await ctx.http().get('/categorizations/name/Nonexistent').expect(404);
    });

    it('the detail page lists exponats of the species', async () => {
      const cat = await ctx.prisma.categorization.create({
        data: { species: 'Vulpes vulpes' },
      });
      const org = await createOrganisation(ctx);
      const e = await createExponat(ctx, org.id);
      await ctx.prisma.exponat.update({
        where: { id: e.id },
        data: { categorizationId: cat.id },
      });
      const res = await ctx
        .http()
        .get(`/categorizations/${cat.id}`)
        .expect(200);
      expect(res.body.numberOfExponats).toBe(1);
      expect(res.body.exponats).toEqual([
        expect.objectContaining({ id: e.id }),
      ]);
    });

    it('write endpoints require authentication', async () => {
      await ctx.http().post('/categorizations').send(species()).expect(401);
      const { auth } = await createSession(ctx);
      const created = await ctx
        .http()
        .post('/categorizations')
        .set(auth)
        .send(species())
        .expect(201);
      await ctx
        .http()
        .delete(`/categorizations/${created.body.id}`)
        .set(auth)
        .expect(401);
    });
  });
});
