import * as http from 'http';
import { AddressInfo } from 'net';
import {
  createExponat,
  createOrganisation,
  createSession,
  createTestContext,
  createUser,
  TestContext,
} from './helpers/app';

describe('users, notifications & file uploads (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  describe('GET /users', () => {
    it('lists users with counts, paginated and filterable', async () => {
      await createUser(ctx, { username: 'ana_a', firstName: 'Ana' });
      await createUser(ctx, { username: 'ivo_i', firstName: 'Ivo' });
      await createUser(ctx, { username: 'eva_e', firstName: 'Eva' });

      const page = await ctx
        .http()
        .get('/users')
        .query({ page: 1, size: 2, attribute: 'username', direction: 'asc' })
        .expect(200);
      expect(page.body.map((u: any) => u.username)).toEqual(['ana_a', 'eva_e']);

      const byName = await ctx
        .http()
        .get('/users')
        .query({ name: 'Ivo', page: 1, size: 10 })
        .expect(200);
      expect(byName.body.map((u: any) => u.username)).toEqual(['ivo_i']);
    });

    it('filters by organisation membership', async () => {
      const member = await createUser(ctx);
      await createUser(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: member.id, role: 'MEMBER' },
      ]);
      const res = await ctx
        .http()
        .get('/users')
        .query({ organisation: org.id, page: 1, size: 10 })
        .expect(200);
      expect(res.body.map((u: any) => u.id)).toEqual([member.id]);
    });

    // BUG: UsersService.findAll dereferences `filter.name` without a null check
    // when there is no sorting; with no query at all the controller still
    // passes an (empty) object, so this works, but the service-level crash is
    // documented in the unit tests.
    it('works without any query parameters', async () => {
      await createUser(ctx);
      await ctx.http().get('/users').expect(200);
    });

    it.failing(
      'does not publish every user’s email address to anonymous visitors',
      async () => {
        await createUser(ctx, { email: 'private@test.hr' });
        const res = await ctx.http().get('/users').expect(200);
        expect(JSON.stringify(res.body)).not.toContain('private@test.hr');
      },
    );
  });

  describe('GET /users/:id', () => {
    it('shows a public profile with only approved content', async () => {
      const author = await createSession(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: author.user.id, role: 'MEMBER' },
      ]);
      const exponat = await createExponat(ctx, org.id);
      const info = await ctx.prisma.authorshipInfo.create({
        data: { authorId: author.user.id },
      });
      const info2 = await ctx.prisma.authorshipInfo.create({
        data: { authorId: author.user.id },
      });
      await ctx.prisma.post.createMany({
        data: [
          {
            title: 'Approved post',
            text: 'Approved text',
            image: 'i',
            thumbnailImage: 't',
            authorId: author.user.id,
            ExponatId: exponat.id,
            isApproved: true,
            authorshipInfoId: info.id,
          },
          {
            title: 'Pending post',
            text: 'Pending text',
            image: 'i',
            thumbnailImage: 't',
            authorId: author.user.id,
            ExponatId: exponat.id,
            isApproved: false,
            authorshipInfoId: info2.id,
          },
        ],
      });

      const res = await ctx.http().get(`/users/${author.user.id}`).expect(200);
      expect(res.body).toMatchObject({
        id: author.user.id,
        username: author.user.username,
      });
      expect(res.body.posts.map((p: any) => p.title)).toEqual([
        'Approved post',
      ]);
      expect(res.body.memberships).toEqual([
        expect.objectContaining({ id: org.id, role: 'MEMBER' }),
      ]);
      expect(res.body).not.toHaveProperty('password');

      const root = await createSession(ctx, { role: 'SUPER' });
      const full = await ctx
        .http()
        .get(`/users/${author.user.id}`)
        .set(root.auth)
        .expect(200);
      expect(full.body.posts).toHaveLength(2);
    });

    it('unknown users are a 404', async () => {
      await ctx.http().get('/users/does-not-exist').expect(404);
    });
  });

  describe('updating and deleting accounts', () => {
    const update = (over: Record<string, unknown> = {}) => ({
      firstName: 'Novo',
      lastName: 'Ime',
      username: 'novo_ime',
      location: 'ISTARSKA',
      bio: 'Nova biografija',
      hasProfileImage: false,
      ...over,
    });

    it('users can update their own profile', async () => {
      const { user, auth } = await createSession(ctx);
      const res = await ctx
        .http()
        .patch('/users')
        .set(auth)
        .send(update())
        .expect(200);
      expect(res.text).toBe('true');
      expect(
        await ctx.prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
      ).toMatchObject({
        firstName: 'Novo',
        location: 'ISTARSKA',
      });
    });

    it('a profile update cannot escalate privileges', async () => {
      const { user, auth } = await createSession(ctx);
      await ctx
        .http()
        .patch('/users')
        .set(auth)
        .send(update({ role: 'SUPER', isActivated: false, email: 'x@y.hr' }));
      const stored = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: user.id },
      });
      expect(stored.role).toBe('USER');
      expect(stored.isActivated).toBe(true);
      expect(stored.email).toBe(user.email);
    });

    it('only super users can edit or delete other accounts', async () => {
      const victim = await createUser(ctx);
      const normal = await createSession(ctx);
      const root = await createSession(ctx, { role: 'SUPER' });

      await ctx
        .http()
        .patch(`/users/${victim.id}`)
        .set(normal.auth)
        .send(update())
        .expect(401);
      await ctx
        .http()
        .delete(`/users/${victim.id}`)
        .set(normal.auth)
        .expect(401);
      expect(await ctx.prisma.user.count({ where: { id: victim.id } })).toBe(1);

      await ctx
        .http()
        .patch(`/users/${victim.id}`)
        .set(root.auth)
        .send(update())
        .expect(200);
      await ctx.http().delete(`/users/${victim.id}`).set(root.auth).expect(200);
      expect(await ctx.prisma.user.count({ where: { id: victim.id } })).toBe(0);
    });

    it('users can delete their own account and their data cascades', async () => {
      const { user, auth } = await createSession(ctx);
      const org = await createOrganisation(ctx, {}, [
        { userId: user.id, role: 'MEMBER' },
      ]);
      await ctx.http().delete('/users').set(auth).expect(200);
      expect(await ctx.prisma.user.count()).toBe(0);
      expect(
        await ctx.prisma.organisationUser.count({
          where: { organisationId: org.id },
        }),
      ).toBe(0);
    });

    it('only super users can read the join requests of other users', async () => {
      const applicant = await createSession(ctx);
      const other = await createSession(ctx);
      const root = await createSession(ctx, { role: 'SUPER' });
      await ctx
        .http()
        .get(`/users/${applicant.user.id}/requests`)
        .set(other.auth)
        .expect(401);
      await ctx
        .http()
        .get(`/users/${applicant.user.id}/requests`)
        .set(root.auth)
        .expect(200);
    });
  });

  describe('notifications', () => {
    it('are listed per user, can be marked as read individually or all at once', async () => {
      const a = await createSession(ctx);
      const b = await createSession(ctx);
      await ctx.http().post(`/follows/${a.user.id}`).set(b.auth).expect(201);
      const org = await createOrganisation(ctx, {}, [
        { userId: a.user.id, role: 'OWNER' },
      ]);
      await ctx.http().post(`/members/${org.id}`).set(b.auth).expect(201);

      const list = await ctx
        .http()
        .get('/notification-users')
        .set(a.auth)
        .expect(200);
      expect(list.body).toHaveLength(2);
      expect(list.body.every((n: any) => n.read === false)).toBe(true);
      // the other user does not see them
      expect(
        (await ctx.http().get('/notification-users').set(b.auth).expect(200))
          .body,
      ).toEqual([]);

      await ctx
        .http()
        .patch(`/notification-users/read/${list.body[0].id}`)
        .set(a.auth)
        .expect(200);
      const afterOne = await ctx
        .http()
        .get('/notification-users')
        .set(a.auth)
        .expect(200);
      expect(afterOne.body.filter((n: any) => n.read)).toHaveLength(1);

      await ctx
        .http()
        .patch('/notification-users/read/all')
        .set(a.auth)
        .expect(200);
      const afterAll = await ctx
        .http()
        .get('/notification-users')
        .set(a.auth)
        .expect(200);
      expect(afterAll.body.every((n: any) => n.read)).toBe(true);
    });

    it('requires authentication', async () => {
      await ctx.http().get('/notification-users').expect(401);
      await ctx.http().patch('/notification-users/read/all').expect(401);
    });

    it('pushes new notifications over SSE to the subscribed user only', async () => {
      const a = await createSession(ctx);
      const b = await createSession(ctx);
      await ctx.app.listen(0);
      const { port } = ctx.app.getHttpServer().address() as AddressInfo;

      const received = await new Promise<string[]>((resolve, reject) => {
        const chunks: string[] = [];
        const req = http.get(
          `http://127.0.0.1:${port}/notification-users/subscribe/${a.user.id}`,
          (res) => {
            res.setEncoding('utf8');
            res.on('data', (c) => {
              chunks.push(c);
              if (c.includes('NEW_FOLLOWER')) {
                req.destroy();
                resolve(chunks);
              }
            });
          },
        );
        req.on('error', (e: NodeJS.ErrnoException) =>
          e.code === 'ECONNRESET' ? undefined : reject(e),
        );
        // give the subscription a moment, then trigger the notification
        setTimeout(() => {
          ctx
            .http()
            .post(`/follows/${a.user.id}`)
            .set(b.auth)
            .then(undefined, reject);
        }, 200);
        setTimeout(() => reject(new Error('no SSE event received')), 8000);
      });

      expect(received.join('')).toContain('NEW_FOLLOWER');
    });
  });

  describe('file uploads (local storage)', () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );

    const pdf = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n',
    );
    // ID3v2 header followed by an MPEG audio frame header
    const mp3 = Buffer.concat([
      Buffer.from('ID3\x04\x00\x00\x00\x00\x00\x00', 'latin1'),
      Buffer.from([0xff, 0xfb, 0x90, 0x64]),
      Buffer.alloc(64),
    ]);
    const mp4 = Buffer.concat([
      Buffer.from([0, 0, 0, 0x18]),
      Buffer.from('ftypmp42'),
      Buffer.alloc(16),
    ]);

    it('stores an image and serves it back with its content type', async () => {
      const up = await ctx
        .http()
        .post('/blobs/exponat')
        .attach('file', png, {
          filename: 'pixel.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(up.text).toMatch(
        /^http:\/\/api\.test\/blobs\/file\/exponat\/[0-9a-f-]{36}$/,
      );
      const path = new URL(up.text).pathname;
      const file = await ctx
        .http()
        .get(path)
        .buffer(true)
        .parse((res, cb) => {
          const parts: Buffer[] = [];
          res.on('data', (c: Buffer) => parts.push(c));
          res.on('end', () => cb(null, Buffer.concat(parts)));
        });
      expect(file.status).toBe(200);
      expect(file.headers['content-type']).toContain('image/png');
      expect(file.body.equals(png)).toBe(true);
    });

    it('rejects non images on the image endpoint', async () => {
      await ctx
        .http()
        .post('/blobs/exponat')
        .attach('file', Buffer.from('plain text'), {
          filename: 'a.txt',
          contentType: 'text/plain',
        })
        .expect(400);
    });

    it('accepts pdfs, audio and video on their endpoints and rejects the wrong type', async () => {
      await ctx
        .http()
        .post('/blobs/pdf/work')
        .attach('file', pdf, {
          filename: 'a.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);
      await ctx
        .http()
        .post('/blobs/pdf/work')
        .attach('file', png, { filename: 'a.png', contentType: 'image/png' })
        .expect(400);
      await ctx
        .http()
        .post('/blobs/video/exponat')
        .attach('file', mp4, {
          filename: 'a.mp4',
          contentType: 'video/mp4',
        })
        .expect(201);
    });

    it('named audio uploads can be looked up again', async () => {
      await ctx.http().get('/blobs/audio/exponat/clip1').expect(404);
      await ctx
        .http()
        .post('/blobs/audio/exponat/clip1')
        .attach('file', mp3, {
          filename: 'a.mp3',
          contentType: 'audio/mpeg',
        })
        .expect(201);
      const found = await ctx
        .http()
        .get('/blobs/audio/exponat/clip1')
        .expect(200);
      expect(found.text).toBe('http://api.test/blobs/file/exponat/clip1');
    });

    it('rejects path traversal in the local file route', async () => {
      const res = await ctx
        .http()
        .get('/blobs/file/exponat/..%2F..%2Fetc%2Fpasswd');
      expect([400, 404]).toContain(res.status);
    });

    it('a profile picture upload sets the flag on the user', async () => {
      const { user, auth } = await createSession(ctx);
      await ctx
        .http()
        .patch('/users/pfp')
        .set(auth)
        .attach('file', png, { filename: 'me.png', contentType: 'image/png' })
        .expect(200);
      expect(
        (await ctx.prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
          .hasProfileImage,
      ).toBe(true);
    });

    it.failing('uploads require authentication', async () => {
      await ctx
        .http()
        .post('/blobs/exponat')
        .attach('file', png, {
          filename: 'pixel.png',
          contentType: 'image/png',
        })
        .expect(401);
    });
  });
});
