import { randomUUID } from 'crypto';
import {
  createAuthorshipInfo,
  createExponat,
  createOrganisation,
  createSession,
  createTestContext,
  TestContext,
} from './helpers/app';

describe('social posts, works, authorship & saved items (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  async function member(role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'REQUESTED') {
    const session = await createSession(ctx);
    const org = await createOrganisation(ctx, {}, [
      { userId: session.user.id, role },
    ]);
    return { ...session, org };
  }

  describe('authorship info', () => {
    it('creating requires auth and always belongs to the caller', async () => {
      await ctx.http().post('/authorship-info').send({}).expect(401);
      const { user, auth } = await createSession(ctx);
      const other = await createSession(ctx);
      const res = await ctx
        .http()
        .post('/authorship-info')
        .set(auth)
        .send({ photographer: 'Ana', authorId: other.user.id })
        .expect(201);
      expect(res.body).toMatchObject({
        photographer: 'Ana',
        authorId: user.id,
      });
    });

    it('is publicly readable', async () => {
      const { user } = await createSession(ctx);
      const info = await createAuthorshipInfo(ctx, user.id);
      const one = await ctx
        .http()
        .get(`/authorship-info/${info.id}`)
        .expect(200);
      expect(one.body.id).toBe(info.id);
      const all = await ctx.http().get('/authorship-info').expect(200);
      expect(all.body).toHaveLength(1);
    });

    it('only the author can update it', async () => {
      const author = await createSession(ctx);
      const stranger = await createSession(ctx);
      const info = await createAuthorshipInfo(ctx, author.user.id);

      await ctx
        .http()
        .patch(`/authorship-info/${info.id}`)
        .set(stranger.auth)
        .send({ photographer: 'Hijacked' })
        .expect(404); // update is scoped by authorId, so the row "does not exist" for others
      await ctx
        .http()
        .patch(`/authorship-info/${info.id}`)
        .set(author.auth)
        .send({ photographer: 'Renamed' })
        .expect(200);
      expect(
        (
          await ctx.prisma.authorshipInfo.findUniqueOrThrow({
            where: { id: info.id },
          })
        ).photographer,
      ).toBe('Renamed');
    });
  });

  describe('social posts (announcements)', () => {
    const body = (
      authorshipInfoId: string,
      over: Record<string, unknown> = {},
    ) => ({
      title: 'Dan otvorenih vrata',
      text: 'Pridružite nam se na danu otvorenih vrata muzeja',
      images: ['https://example.org/a.png'],
      authorshipInfoId,
      ...over,
    });

    it('an admin publishes an announcement and organisation followers are notified', async () => {
      const admin = await member('ADMIN');
      const follower = await createSession(ctx);
      await ctx.prisma.userOrganisationFollower.create({
        data: { userId: follower.user.id, organisationId: admin.org.id },
      });
      const info = await createAuthorshipInfo(ctx, admin.user.id);

      const res = await ctx
        .http()
        .post(`/social-posts/${admin.org.id}`)
        .set(admin.auth)
        .send(body(info.id))
        .expect(201);
      expect(res.body).toMatchObject({
        title: 'Dan otvorenih vrata',
        organisationId: admin.org.id,
      });

      const notes = await ctx
        .http()
        .get('/notification-users')
        .set(follower.auth)
        .expect(200);
      expect(notes.body).toEqual([
        expect.objectContaining({ type: 'NEW_SOCIAL_POST' }),
      ]);
    });

    it('plain members are rejected (401)', async () => {
      const plain = await member('MEMBER');
      const info = await createAuthorshipInfo(ctx, plain.user.id);
      await ctx
        .http()
        .post(`/social-posts/${plain.org.id}`)
        .set(plain.auth)
        .send(body(info.id))
        .expect(401);
    });

    it.failing('organisation owners can publish announcements', async () => {
      const owner = await member('OWNER');
      const info = await createAuthorshipInfo(ctx, owner.user.id);
      await ctx
        .http()
        .post(`/social-posts/${owner.org.id}`)
        .set(owner.auth)
        .send(body(info.id))
        .expect(201);
    });

    it('validates the payload', async () => {
      const admin = await member('ADMIN');
      const info = await createAuthorshipInfo(ctx, admin.user.id);
      for (const over of [
        { title: 'ab' },
        { text: 'short' },
        { images: 'x' },
        { authorshipInfoId: 'nope' },
      ])
        await ctx
          .http()
          .post(`/social-posts/${admin.org.id}`)
          .set(admin.auth)
          .send(body(info.id, over))
          .expect(400);
    });

    it('is listed and readable, and admins can toggle approval', async () => {
      const admin = await member('ADMIN');
      const info = await createAuthorshipInfo(ctx, admin.user.id);
      const created = await ctx
        .http()
        .post(`/social-posts/${admin.org.id}`)
        .set(admin.auth)
        .send(body(info.id))
        .expect(201);

      const list = await ctx.http().get('/social-posts').expect(200);
      expect(list.body).toEqual([
        expect.objectContaining({
          id: created.body.id,
          organisationName: admin.org.name,
        }),
      ]);
      await ctx.http().get(`/social-posts/${created.body.id}`).expect(200);

      await ctx
        .http()
        .patch(`/social-posts/${admin.org.id}/${created.body.id}/approval`)
        .set(admin.auth)
        .expect(200);
      expect(
        (
          await ctx.prisma.socialPost.findUniqueOrThrow({
            where: { id: created.body.id },
          })
        ).isApproved,
      ).toBe(false);
      // hidden from the public now, still visible to the admin
      await ctx.http().get(`/social-posts/${created.body.id}`).expect(404);
      await ctx
        .http()
        .get(`/social-posts/${created.body.id}`)
        .set(admin.auth)
        .expect(200);
    });

    it.failing(
      'the public list does not leak unapproved announcements',
      async () => {
        const admin = await member('ADMIN');
        const info = await createAuthorshipInfo(ctx, admin.user.id);
        await ctx.prisma.socialPost.create({
          data: {
            title: 'Secret draft',
            text: 'Not meant for the public yet',
            images: [],
            organisationId: admin.org.id,
            authorshipInfoId: info.id,
            isApproved: false,
          },
        });
        const list = await ctx.http().get('/social-posts').expect(200);
        expect(list.body).toEqual([]);
      },
    );

    it('admins can edit announcements; plain members cannot', async () => {
      const admin = await member('ADMIN');
      const info = await createAuthorshipInfo(ctx, admin.user.id);
      const post = await ctx.prisma.socialPost.create({
        data: {
          title: 'Original',
          text: 'Original text here',
          images: [],
          organisationId: admin.org.id,
          authorshipInfoId: info.id,
        },
      });
      await ctx
        .http()
        .patch(`/social-posts/${admin.org.id}/${post.id}`)
        .set(admin.auth)
        .send({ title: 'Edited title' })
        .expect(200);
      expect(
        (
          await ctx.prisma.socialPost.findUniqueOrThrow({
            where: { id: post.id },
          })
        ).title,
      ).toBe('Edited title');

      const plain = await createSession(ctx);
      await ctx.prisma.organisationUser.create({
        data: {
          userId: plain.user.id,
          organisationId: admin.org.id,
          role: 'MEMBER',
        },
      });
      await ctx
        .http()
        .patch(`/social-posts/${admin.org.id}/${post.id}`)
        .set(plain.auth)
        .send({ title: 'Nope nope' })
        .expect(401);
    });

    it.failing('admins can delete announcements (authenticated)', async () => {
      const admin = await member('ADMIN');
      const info = await createAuthorshipInfo(ctx, admin.user.id);
      const post = await ctx.prisma.socialPost.create({
        data: {
          title: 'To delete',
          text: 'Delete me please',
          images: [],
          organisationId: admin.org.id,
          authorshipInfoId: info.id,
        },
      });
      await ctx
        .http()
        .delete(`/social-posts/${admin.org.id}/${post.id}`)
        .set(admin.auth)
        .expect(200);
      expect(await ctx.prisma.socialPost.count()).toBe(0);
    });
  });

  describe('works (publications)', () => {
    const work = (over: Record<string, unknown> = {}) => ({
      title: 'Flora Jadrana',
      description: 'Pregled flore istočne obale Jadrana',
      tags: ['flora', 'jadran'],
      type: 'BOOK',
      ...over,
    });

    it('members can submit works, which start unapproved', async () => {
      const plain = await member('MEMBER');
      await ctx
        .http()
        .post(`/works/${plain.org.id}`)
        .set(plain.auth)
        .send(work())
        .expect(201);
      const stored = await ctx.prisma.work.findFirstOrThrow();
      expect(stored).toMatchObject({
        authorId: plain.user.id,
        organisationId: plain.org.id,
      });
    });

    it('a plain member’s work is not auto approved', async () => {
      const plain = await member('MEMBER');
      await ctx
        .http()
        .post(`/works/${plain.org.id}`)
        .set(plain.auth)
        .send(work())
        .expect(201);
      expect((await ctx.prisma.work.findFirstOrThrow()).isApproved).toBe(false);
    });

    it('a work submitted by an organisation admin is auto approved', async () => {
      const admin = await member('ADMIN');
      await ctx
        .http()
        .post(`/works/${admin.org.id}`)
        .set(admin.auth)
        .send(work())
        .expect(201);
      expect(await ctx.prisma.work.findFirstOrThrow()).toMatchObject({
        isApproved: true,
        approvedBy: admin.user.id,
      });
    });

    it('pending requests and strangers are rejected (401)', async () => {
      const pending = await member('REQUESTED');
      await ctx
        .http()
        .post(`/works/${pending.org.id}`)
        .set(pending.auth)
        .send(work())
        .expect(401);
      const stranger = await createSession(ctx);
      await ctx
        .http()
        .post(`/works/${pending.org.id}`)
        .set(stranger.auth)
        .send(work())
        .expect(401);
      expect(await ctx.prisma.work.count()).toBe(0);
    });

    it('validates the payload', async () => {
      const plain = await member('MEMBER');
      for (const over of [
        { title: 'ab' },
        { description: 'short' },
        { tags: 'x' },
      ])
        await ctx
          .http()
          .post(`/works/${plain.org.id}`)
          .set(plain.auth)
          .send(work(over))
          .expect(400);
    });

    it('lists approved works with tag and type filters', async () => {
      const plain = await member('MEMBER');
      const make = (
        title: string,
        tags: string[],
        type: any,
        isApproved = true,
      ) =>
        ctx.prisma.work.create({
          data: {
            title,
            description: 'A description',
            tags,
            type,
            authorId: plain.user.id,
            organisationId: plain.org.id,
            isApproved,
          },
        });
      await make('Botanika', ['flora'], 'BOOK');
      await make('Zoologija', ['fauna'], 'THESIS');
      await make('Neodobreno', ['flora'], 'BOOK', false);

      const all = await ctx.http().get('/works').expect(200);
      expect(all.body.map((w: any) => w.title).sort()).toEqual([
        'Botanika',
        'Zoologija',
      ]);

      const byType = await ctx
        .http()
        .get('/works')
        .query({ type: 'THESIS' })
        .expect(200);
      expect(byType.body.map((w: any) => w.title)).toEqual(['Zoologija']);
    });

    it('a pending work is hidden from the public', async () => {
      const plain = await member('MEMBER');
      const w = await ctx.prisma.work.create({
        data: {
          title: 'Draft work',
          description: 'A description',
          tags: [],
          authorId: plain.user.id,
          organisationId: plain.org.id,
        },
      });
      await ctx.http().get(`/works/${w.id}`).expect(401);
    });

    it('the author can open their own pending work', async () => {
      const plain = await member('MEMBER');
      const w = await ctx.prisma.work.create({
        data: {
          title: 'Draft work',
          description: 'A description',
          tags: [],
          authorId: plain.user.id,
          organisationId: plain.org.id,
        },
      });
      await ctx.http().get(`/works/${w.id}`).set(plain.auth).expect(200);
    });

    it('a stranger cannot edit or delete someone else’s work', async () => {
      const plain = await member('MEMBER');
      const stranger = await createSession(ctx);
      const w = await ctx.prisma.work.create({
        data: {
          title: 'Not yours',
          description: 'A description',
          tags: [],
          authorId: plain.user.id,
          organisationId: plain.org.id,
        },
      });
      await ctx.http().delete(`/works/${w.id}`).set(stranger.auth);
      expect(await ctx.prisma.work.count({ where: { id: w.id } })).toBe(1);
    });

    it('the author can edit and delete their work', async () => {
      const plain = await member('MEMBER');
      const w = await ctx.prisma.work.create({
        data: {
          title: 'Mine',
          description: 'A description',
          tags: [],
          authorId: plain.user.id,
          organisationId: plain.org.id,
        },
      });
      await ctx
        .http()
        .patch(`/works/${w.id}`)
        .set(plain.auth)
        .send({ title: 'Renamed work' })
        .expect(200);
      expect(
        (await ctx.prisma.work.findUniqueOrThrow({ where: { id: w.id } }))
          .title,
      ).toBe('Renamed work');
      await ctx.http().delete(`/works/${w.id}`).set(plain.auth).expect(200);
      expect(await ctx.prisma.work.count()).toBe(0);
    });

    it('approval toggling records the approver', async () => {
      const admin = await member('ADMIN');
      const w = await ctx.prisma.work.create({
        data: {
          title: 'To approve',
          description: 'A description',
          tags: [],
          authorId: admin.user.id,
          organisationId: admin.org.id,
        },
      });
      await ctx
        .http()
        .patch(`/works/${w.id}/approval`)
        .set(admin.auth)
        .expect(200);
      expect(
        await ctx.prisma.work.findUniqueOrThrow({ where: { id: w.id } }),
      ).toMatchObject({
        isApproved: true,
        approvedBy: admin.user.id,
      });
      await ctx
        .http()
        .patch(`/works/${w.id}/approval`)
        .set(admin.auth)
        .expect(200);
      expect(
        await ctx.prisma.work.findUniqueOrThrow({ where: { id: w.id } }),
      ).toMatchObject({
        isApproved: false,
        approvedBy: null,
      });
    });
  });

  describe('saved works, saved literature and favourites', () => {
    it('saving a work toggles and is listed per user and per work', async () => {
      const plain = await member('MEMBER');
      const w = await ctx.prisma.work.create({
        data: {
          title: 'Saved work',
          description: 'A description',
          tags: [],
          authorId: plain.user.id,
          organisationId: plain.org.id,
          isApproved: true,
        },
      });
      await ctx
        .http()
        .patch(`/saved-works/${w.id}`)
        .set(plain.auth)
        .expect(200);

      const mine = await ctx
        .http()
        .get('/saved-works/me')
        .set(plain.auth)
        .expect(200);
      expect(mine.body).toEqual([
        expect.objectContaining({ id: w.id, amountOfSaves: 1 }),
      ]);
      const byUser = await ctx
        .http()
        .get(`/saved-works/user/${plain.user.id}`)
        .expect(200);
      expect(byUser.body).toHaveLength(1);
      const savers = await ctx.http().get(`/saved-works/${w.id}`).expect(200);
      expect(savers.body).toEqual([
        expect.objectContaining({ id: plain.user.id }),
      ]);

      await ctx
        .http()
        .patch(`/saved-works/${w.id}`)
        .set(plain.auth)
        .expect(200);
      expect(await ctx.prisma.savedWorks.count()).toBe(0);
    });

    it('saved literature behaves the same way', async () => {
      const { user, auth } = await createSession(ctx);
      await ctx.http().patch('/literature/10.1000-doi-1').set(auth).expect(200);
      const mine = await ctx.http().get('/literature/me').set(auth).expect(200);
      expect(mine.body).toEqual([
        expect.objectContaining({
          literatureId: '10.1000-doi-1',
          userId: user.id,
        }),
      ]);
      await ctx.http().get('/literature/10.1000-doi-1').expect(200);
      await ctx.http().patch('/literature/10.1000-doi-1').set(auth).expect(200);
      expect(await ctx.prisma.savedLiterature.count()).toBe(0);
    });

    it('favouriting exponats and organisations toggles and counts', async () => {
      const { user, auth } = await createSession(ctx);
      const org = await createOrganisation(ctx);
      const exponat = await createExponat(ctx, org.id);

      const first = await ctx
        .http()
        .patch(`/favourite-exponats/${exponat.id}`)
        .set(auth)
        .expect(200);
      expect(first.text).toBe('true');
      const favs = await ctx
        .http()
        .get('/favourite-exponats/user')
        .set(auth)
        .expect(200);
      expect(favs.body).toEqual([
        expect.objectContaining({ id: exponat.id, favouriteCount: 1 }),
      ]);
      const fans = await ctx
        .http()
        .get(`/favourite-exponats/${exponat.id}`)
        .expect(200);
      expect(fans.body).toEqual([expect.objectContaining({ id: user.id })]);
      await ctx
        .http()
        .patch(`/favourite-exponats/${exponat.id}`)
        .set(auth)
        .expect(200);
      expect(await ctx.prisma.favouriteExponat.count()).toBe(0);

      await ctx
        .http()
        .patch(`/favourite-organisations/${org.id}`)
        .set(auth)
        .expect(200);
      const followed = await ctx
        .http()
        .get('/favourite-organisations/user')
        .set(auth)
        .expect(200);
      expect(followed.body).toEqual([
        expect.objectContaining({ id: org.id, followerCount: 1 }),
      ]);
      await ctx
        .http()
        .patch(`/favourite-organisations/${org.id}`)
        .set(auth)
        .expect(200);
      expect(await ctx.prisma.userOrganisationFollower.count()).toBe(0);
    });

    it('favouriting unknown exponats is a 400 (FK violation)', async () => {
      const { auth } = await createSession(ctx);
      await ctx
        .http()
        .patch(`/favourite-exponats/${randomUUID()}`)
        .set(auth)
        .expect(400);
    });

    it('requires authentication', async () => {
      await ctx.http().get('/saved-works/me').expect(401);
      await ctx.http().get('/favourite-exponats/user').expect(401);
      await ctx.http().patch('/literature/x').expect(401);
    });
  });
});
