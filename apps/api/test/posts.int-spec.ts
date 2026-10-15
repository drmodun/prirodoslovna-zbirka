import { randomUUID } from 'crypto';
import {
  createAuthorshipInfo,
  createExponat,
  createOrganisation,
  createSession,
  createTestContext,
  TestContext,
} from './helpers/app';

describe('posts, likes & follows (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  /** organisation with one exponat and a session with the given membership */
  async function setup(role: 'OWNER' | 'ADMIN' | 'MEMBER' | null) {
    const session = await createSession(ctx);
    const org = await createOrganisation(
      ctx,
      {},
      role ? [{ userId: session.user.id, role }] : [],
    );
    const exponat = await createExponat(ctx, org.id);
    return { ...session, org, exponat };
  }

  const postBody = async (
    authorId: string,
    over: Record<string, unknown> = {},
  ) => ({
    title: 'Opažanje lisice',
    text: 'Vidjeli smo lisicu u šumi',
    image: 'https://example.org/post.png',
    thumbnailImage: 'https://example.org/thumb.png',
    authorshipInfoId: (await createAuthorshipInfo(ctx, authorId)).id,
    ...over,
  });

  async function createPost(
    authorId: string,
    exponatId: string,
    over: Record<string, unknown> = {},
  ) {
    const info = await createAuthorshipInfo(ctx, authorId);
    return ctx.prisma.post.create({
      data: {
        title: 'Existing post',
        text: 'Existing post text',
        image: 'i',
        thumbnailImage: 't',
        authorId,
        ExponatId: exponatId,
        authorshipInfoId: info.id,
        isApproved: true,
        ...over,
      },
    });
  }

  describe('POST /posts/:exponatId', () => {
    it('requires authentication', async () => {
      const { exponat } = await setup('MEMBER');
      await ctx.http().post(`/posts/${exponat.id}`).send({}).expect(401);
    });

    it('rejects unknown exponats (400)', async () => {
      const { auth, user } = await setup('MEMBER');
      await ctx
        .http()
        .post(`/posts/${randomUUID()}`)
        .set(auth)
        .send(await postBody(user.id))
        .expect(400);
    });

    it('rejects users who are not members of the organisation (401)', async () => {
      const { auth, user, exponat } = await setup(null);
      await ctx
        .http()
        .post(`/posts/${exponat.id}`)
        .set(auth)
        .send(await postBody(user.id))
        .expect(401);
      expect(await ctx.prisma.post.count()).toBe(0);
    });

    // BUG: PostsController sets `dto.isAdmin` and PostsService spreads the whole
    // dto into `prisma.post.create`, but `isAdmin` is not a Post column, so Prisma
    // rejects every creation with a validation error (HTTP 500). The three tests
    // below describe the intended behaviour and switch to plain `it` once fixed.
    it.failing(
      'a member’s post is unapproved and asks the admins for review',
      async () => {
        const member = await setup('MEMBER');
        const admin = await createSession(ctx);
        await ctx.prisma.organisationUser.create({
          data: {
            userId: admin.user.id,
            organisationId: member.org.id,
            role: 'ADMIN',
          },
        });

        const res = await ctx
          .http()
          .post(`/posts/${member.exponat.id}`)
          .set(member.auth)
          .send(await postBody(member.user.id));
        expect(res.status).toBe(201);

        const stored = await ctx.prisma.post.findFirstOrThrow();
        expect(stored).toMatchObject({
          authorId: member.user.id,
          isApproved: false,
        });

        const notes = await ctx
          .http()
          .get('/notification-users')
          .set(admin.auth)
          .expect(200);
        expect(notes.body.map((n: any) => n.type)).toContain(
          'NEW_POST_REQUEST',
        );
      },
    );

    it.failing(
      'an admin’s post is approved immediately and followers are notified',
      async () => {
        const admin = await setup('ADMIN');
        const follower = await createSession(ctx);
        await ctx.prisma.userFollows.create({
          data: { followerId: follower.user.id, followeeId: admin.user.id },
        });

        await ctx
          .http()
          .post(`/posts/${admin.exponat.id}`)
          .set(admin.auth)
          .send(await postBody(admin.user.id))
          .expect(201);

        expect(await ctx.prisma.post.findFirstOrThrow()).toMatchObject({
          isApproved: true,
          IsNotificationMade: true,
        });
        const notes = await ctx
          .http()
          .get('/notification-users')
          .set(follower.auth)
          .expect(200);
        expect(notes.body.map((n: any) => n.type)).toContain(
          'POST_BY_FOLLOWED_ACCOUNT',
        );
      },
    );

    it.failing(
      'cannot spoof the author or approval through the body',
      async () => {
        const member = await setup('MEMBER');
        const victim = await createSession(ctx);
        await ctx
          .http()
          .post(`/posts/${member.exponat.id}`)
          .set(member.auth)
          .send({
            ...(await postBody(member.user.id)),
            authorId: victim.user.id,
            isApproved: true,
            isAdmin: true,
          });
        const stored = await ctx.prisma.post.findFirstOrThrow();
        expect(stored.authorId).toBe(member.user.id);
        expect(stored.isApproved).toBe(false);
      },
    );

    it('validates the payload', async () => {
      const { auth, user, exponat } = await setup('MEMBER');
      for (const over of [
        { title: 'ab' },
        { text: 'x' },
        { authorshipInfoId: 'nope' },
      ])
        await ctx
          .http()
          .post(`/posts/${exponat.id}`)
          .set(auth)
          .send(await postBody(user.id, over))
          .expect(400);
    });
  });

  describe('reading', () => {
    it('GET /posts lists approved posts, with search and author filters', async () => {
      const { user, exponat } = await setup('MEMBER');
      await createPost(user.id, exponat.id, { title: 'Crvena lisica u šumi' });
      await createPost(user.id, exponat.id, { title: 'Sivi vuk u planini' });
      await createPost(user.id, exponat.id, {
        title: 'Skriveni post',
        isApproved: false,
      });

      const all = await ctx.http().get('/posts').expect(200);
      expect(all.body.map((p: any) => p.title).sort()).toEqual([
        'Crvena lisica u šumi',
        'Sivi vuk u planini',
      ]);

      const searched = await ctx
        .http()
        .get('/posts')
        .query({ title: 'lisica' })
        .expect(200);
      expect(searched.body.map((p: any) => p.title)).toEqual([
        'Crvena lisica u šumi',
      ]);

      const byAuthor = await ctx
        .http()
        .get('/posts')
        .query({ userId: user.id })
        .expect(200);
      expect(byAuthor.body).toHaveLength(2);
    });

    it('super users also see unapproved posts', async () => {
      const { user, exponat } = await setup('MEMBER');
      await createPost(user.id, exponat.id, { isApproved: false });
      const root = await createSession(ctx, { role: 'SUPER' });
      const res = await ctx.http().get('/posts').set(root.auth).expect(200);
      expect(res.body).toHaveLength(1);
    });

    // BUG: the organisation filter queries `exponatId` instead of `ExponatId`.
    it.failing('filters posts by organisation', async () => {
      const a = await setup('MEMBER');
      const b = await setup('MEMBER');
      await createPost(a.user.id, a.exponat.id, { title: 'In organisation A' });
      await createPost(b.user.id, b.exponat.id, { title: 'In organisation B' });
      const res = await ctx
        .http()
        .get('/posts')
        .query({ organisationId: a.org.id })
        .expect(200);
      expect(res.body.map((p: any) => p.title)).toEqual(['In organisation A']);
    });

    it('GET /posts/:id returns the post; unapproved posts are 404 for the public', async () => {
      const { user, exponat } = await setup('MEMBER');
      const visible = await createPost(user.id, exponat.id);
      const hidden = await createPost(user.id, exponat.id, {
        isApproved: false,
      });
      const res = await ctx.http().get(`/posts/${visible.id}`).expect(200);
      expect(res.body).toMatchObject({
        id: visible.id,
        authorId: user.id,
        exponatId: exponat.id,
      });
      await ctx.http().get(`/posts/${hidden.id}`).expect(404);
    });

    it('GET /posts/discover executes the ranking SQL (anonymous and personal)', async () => {
      const { user, auth, exponat } = await setup('MEMBER');
      const other = await createSession(ctx);
      const mine = await createPost(user.id, exponat.id, {
        title: 'My own post',
      });
      const liked = await createPost(other.user.id, exponat.id, {
        title: 'Liked post',
      });
      const fresh = await createPost(other.user.id, exponat.id, {
        title: 'Fresh post',
      });
      await ctx.prisma.like.create({
        data: { userId: user.id, postId: liked.id },
      });
      void mine;
      void fresh;

      const anon = await ctx.http().get('/posts/discover').expect(200);
      expect(anon.body).toHaveLength(3);

      const personal = await ctx
        .http()
        .get('/posts/discover')
        .set(auth)
        .expect(200);
      // own and already liked posts are pushed down the ranking
      expect(personal.body[0].title).toBe('Fresh post');
    });

    it('GET /posts/:organisationId/hidden is limited to organisation admins', async () => {
      const admin = await setup('ADMIN');
      await createPost(admin.user.id, admin.exponat.id, {
        title: 'Pending post',
        isApproved: false,
      });
      const res = await ctx
        .http()
        .get(`/posts/${admin.org.id}/hidden`)
        .set(admin.auth)
        .expect(200);
      expect(res.body.map((p: any) => p.title)).toEqual(['Pending post']);

      const member = await createSession(ctx);
      await ctx
        .http()
        .get(`/posts/${admin.org.id}/hidden`)
        .set(member.auth)
        .expect(401);
      await ctx.http().get(`/posts/${admin.org.id}/hidden`).expect(401);
    });
  });

  describe('editing', () => {
    it('authors can edit and delete their posts, strangers cannot', async () => {
      const author = await setup('MEMBER');
      const stranger = await createSession(ctx);
      const post = await createPost(author.user.id, author.exponat.id);

      await ctx
        .http()
        .patch(`/posts/${post.id}`)
        .set(stranger.auth)
        .send(await postBody(stranger.user.id, { title: 'Stranger edit' }))
        .expect(401);

      await ctx
        .http()
        .patch(`/posts/${post.id}`)
        .set(author.auth)
        .send(await postBody(author.user.id, { title: 'Edited title' }))
        .expect(200);
      expect(
        (await ctx.prisma.post.findUniqueOrThrow({ where: { id: post.id } }))
          .title,
      ).toBe('Edited title');

      await ctx
        .http()
        .delete(`/posts/${post.id}`)
        .set(stranger.auth)
        .expect(401);
      await ctx.http().delete(`/posts/${post.id}`).set(author.auth).expect(200);
      expect(await ctx.prisma.post.count()).toBe(0);
    });

    it('organisation admins can delete posts of their members', async () => {
      const admin = await setup('ADMIN');
      const member = await createSession(ctx);
      await ctx.prisma.organisationUser.create({
        data: {
          userId: member.user.id,
          organisationId: admin.org.id,
          role: 'MEMBER',
        },
      });
      const post = await createPost(member.user.id, admin.exponat.id);
      await ctx.http().delete(`/posts/${post.id}`).set(admin.auth).expect(200);
    });
  });

  describe('moderation', () => {
    it('an organisation admin approves a post; the author and followers are notified once', async () => {
      const admin = await setup('ADMIN');
      const author = await createSession(ctx);
      const follower = await createSession(ctx);
      await ctx.prisma.organisationUser.create({
        data: {
          userId: author.user.id,
          organisationId: admin.org.id,
          role: 'MEMBER',
        },
      });
      await ctx.prisma.userFollows.create({
        data: { followerId: follower.user.id, followeeId: author.user.id },
      });
      const post = await createPost(author.user.id, admin.exponat.id, {
        isApproved: false,
      });

      await ctx
        .http()
        .patch(`/posts/${post.id}/approval`)
        .set(admin.auth)
        .expect(200);
      expect(
        await ctx.prisma.post.findUniqueOrThrow({ where: { id: post.id } }),
      ).toMatchObject({
        isApproved: true,
        IsNotificationMade: true,
      });

      const authorNotes = await ctx
        .http()
        .get('/notification-users')
        .set(author.auth)
        .expect(200);
      expect(authorNotes.body.map((n: any) => n.type)).toContain(
        'POST_APPROVAL',
      );
      const followerNotes = await ctx
        .http()
        .get('/notification-users')
        .set(follower.auth)
        .expect(200);
      expect(followerNotes.body.map((n: any) => n.type)).toEqual([
        'POST_BY_FOLLOWED_ACCOUNT',
      ]);

      // un-approving does not spam the followers again
      await ctx
        .http()
        .patch(`/posts/${post.id}/approval`)
        .set(admin.auth)
        .expect(200);
      await ctx
        .http()
        .patch(`/posts/${post.id}/approval`)
        .set(admin.auth)
        .expect(200);
      const again = await ctx
        .http()
        .get('/notification-users')
        .set(follower.auth)
        .expect(200);
      expect(again.body).toHaveLength(1);
    });

    it('strangers cannot moderate', async () => {
      const { user, exponat } = await setup('MEMBER');
      const stranger = await createSession(ctx);
      const post = await createPost(user.id, exponat.id, { isApproved: false });
      await ctx
        .http()
        .patch(`/posts/${post.id}/approval`)
        .set(stranger.auth)
        .expect(401);
    });

    // SECURITY BUG: the author passes the "author or admin" check, so a member
    // can approve their own post and bypass moderation.
    it.failing('authors cannot approve their own post', async () => {
      const member = await setup('MEMBER');
      const post = await createPost(member.user.id, member.exponat.id, {
        isApproved: false,
      });
      await ctx.http().patch(`/posts/${post.id}/approval`).set(member.auth);
      expect(
        (await ctx.prisma.post.findUniqueOrThrow({ where: { id: post.id } }))
          .isApproved,
      ).toBe(false);
    });
  });

  describe('likes', () => {
    it('toggling twice likes then unlikes; the like count is reflected on the post', async () => {
      const { auth, user, exponat } = await setup('MEMBER');
      const post = await createPost(user.id, exponat.id);

      await ctx.http().post(`/likes/${post.id}`).set(auth).expect(201);
      expect(await ctx.prisma.like.count()).toBe(1);
      const liked = await ctx.http().get(`/posts/${post.id}`).expect(200);
      expect(liked.body.likeScore).toBe(1);

      await ctx.http().post(`/likes/${post.id}`).set(auth).expect(201);
      expect(await ctx.prisma.like.count()).toBe(0);
    });

    it('requires authentication and an existing post', async () => {
      const { auth } = await setup('MEMBER');
      await ctx.http().post(`/likes/${randomUUID()}`).expect(401);
      await ctx.http().post(`/likes/${randomUUID()}`).set(auth).expect(400); // FK violation -> P2003
    });
  });

  describe('follows', () => {
    it('follow, list followers/following, unfollow', async () => {
      const a = await createSession(ctx);
      const b = await createSession(ctx);

      await ctx.http().post(`/follows/${b.user.id}`).set(a.auth).expect(201);

      const followers = await ctx
        .http()
        .get(`/follows/${b.user.id}/followers`)
        .expect(200);
      expect(followers.body).toEqual([
        expect.objectContaining({ id: a.user.id }),
      ]);
      const following = await ctx
        .http()
        .get(`/follows/${a.user.id}/following`)
        .expect(200);
      expect(following.body).toEqual([
        expect.objectContaining({ id: b.user.id }),
      ]);

      const notes = await ctx
        .http()
        .get('/notification-users')
        .set(b.auth)
        .expect(200);
      expect(notes.body).toEqual([
        expect.objectContaining({
          type: 'NEW_FOLLOWER',
          link: `/user/${a.user.id}`,
        }),
      ]);

      await ctx.http().post(`/follows/${b.user.id}`).set(a.auth).expect(201);
      expect(await ctx.prisma.userFollows.count()).toBe(0);
    });

    it('requires authentication', async () => {
      const b = await createSession(ctx);
      await ctx.http().post(`/follows/${b.user.id}`).expect(401);
    });
  });
});
