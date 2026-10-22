import { createHash, randomUUID } from 'crypto';
import { exportJWK, generateKeyPair, KeyLike, SignJWT } from 'jose';
import { VansyClient } from 'src/vansy/vansy.client';
import { VANSY_CONFIG } from 'src/vansy/vansy.config';
import {
  createOrganisation,
  createSession,
  createTestContext,
  TestContext,
} from './helpers/app';

// The zbirka side of Vansy against a fake Vansy: rights come from
// MembersService, launches carry them, and signed webhooks are stored once.
describe('quizzes on Vansy (integration)', () => {
  let ctx: TestContext;
  let vansyKey: KeyLike;
  const launches: any[] = [];
  const listed: Record<string, string>[] = [];
  const quizzes = new Map<string, any>();

  const fake = {
    enabled: true,
    launch: jest.fn(async (body: unknown) => {
      launches.push(body);
      return {
        launchUrl: 'http://vansy.test/api/v1/l/ticket',
        expiresAt: new Date().toISOString(),
      };
    }),
    getQuiz: jest.fn(async (id: string) => {
      const quiz = quizzes.get(id);
      if (!quiz) throw new Error('missing');
      return quiz;
    }),
    listQuizzes: jest.fn(async (query: Record<string, string>) => {
      listed.push(query);
      return { results: [...quizzes.values()] };
    }),
    setContexts: jest.fn(),
    finalize: jest.fn(),
  };

  const quiz = (organisationId: string, over: Record<string, unknown> = {}) => {
    const id = randomUUID();
    quizzes.set(id, {
      id,
      title: 'Ptice',
      description: '',
      coverImage: null,
      difficulty: 'EASY',
      ownerRef: `org:${organisationId}`,
      publishState: 'PUBLISHED',
      isAnonymousAllowed: false,
      questionCount: 3,
      maxScore: 3,
      timeLimitTotalSec: null,
      ...over,
    });
    return id;
  };

  beforeAll(async () => {
    const pair = await generateKeyPair('EdDSA', {
      crv: 'Ed25519',
      extractable: true,
    });
    vansyKey = pair.privateKey;
    const publicJwk = { ...(await exportJWK(pair.publicKey)), kid: 'v' };
    ctx = await createTestContext({
      configure: (builder) =>
        builder
          .overrideProvider(VANSY_CONFIG)
          .useValue({
            url: 'http://vansy.test',
            tenantId: 'zbirka',
            privateKey: '{}',
            publicKey: JSON.stringify(publicJwk),
            frontendUrl: 'http://zbirka.test',
          })
          .overrideProvider(VansyClient)
          .useValue(fake),
    });
  });
  afterAll(() => ctx.close());
  beforeEach(async () => {
    await ctx.reset();
    launches.length = 0;
    listed.length = 0;
    quizzes.clear();
  });

  async function member(role: 'OWNER' | 'ADMIN' | 'MEMBER') {
    const session = await createSession(ctx);
    const org = await createOrganisation(ctx, {}, [
      { userId: session.user.id, role },
    ]);
    return { ...session, org };
  }

  describe('launches', () => {
    it('lets an organisation admin author, with moderation, for the organisation', async () => {
      const { auth, org, user } = await member('ADMIN');
      const res = await ctx
        .http()
        .post(`/quiz-launch/author/${org.id}`)
        .set(auth)
        .expect(201);

      expect(res.body.launchUrl).toBe('http://vansy.test/api/v1/l/ticket');
      expect(launches[0]).toMatchObject({
        action: 'author',
        subject: { externalUserId: user.id },
        capabilities: ['author', 'moderate'],
        scope: { ownerRef: `org:${org.id}` },
        returnUrl: `http://zbirka.test/organisation/${org.id}`,
      });
    });

    it('refuses an ordinary member, in Croatian when asked', async () => {
      const { auth, org } = await member('MEMBER');
      const res = await ctx
        .http()
        .post(`/quiz-launch/author/${org.id}`)
        .set(auth)
        .set('Accept-Language', 'hr')
        .expect(403);
      expect(res.body.message).toBe(
        'Nemate administratorska prava za ovu organizaciju',
      );
      expect(launches).toHaveLength(0);
    });

    it('launches a signed-in taker with their name', async () => {
      const { org } = await member('OWNER');
      const id = quiz(org.id);
      const taker = await createSession(ctx);

      await ctx
        .http()
        .post(`/quiz-launch/take/${id}`)
        .set(taker.auth)
        .expect(201);
      expect(launches[0]).toMatchObject({
        action: 'take',
        subject: { externalUserId: taker.user.id },
        scope: { quizId: id },
      });
    });

    it('launches an anonymous taker only when the quiz allows it', async () => {
      const { org } = await member('OWNER');
      const open = quiz(org.id, { isAnonymousAllowed: true });
      const closed = quiz(org.id);

      await ctx.http().post(`/quiz-launch/take/${open}`).expect(201);
      expect(launches[0].subject).toBeUndefined();

      await ctx.http().post(`/quiz-launch/take/${closed}`).expect(401);
    });

    it('does not launch into a quiz that is not published', async () => {
      const { org } = await member('OWNER');
      const pending = quiz(org.id, { publishState: 'PENDING_REVIEW' });
      const taker = await createSession(ctx);
      await ctx
        .http()
        .post(`/quiz-launch/take/${pending}`)
        .set(taker.auth)
        .expect(404);
    });

    it('lets moderators proctor only their organisation’s quizzes', async () => {
      const { auth, org } = await member('ADMIN');
      const other = await createOrganisation(ctx);
      const mine = quiz(org.id);
      const theirs = quiz(other.id);

      await ctx
        .http()
        .post(`/quiz-launch/proctor/${org.id}/${mine}`)
        .set(auth)
        .expect(201);
      expect(launches[0]).toMatchObject({
        action: 'proctor',
        capabilities: ['proctor'],
        scope: { quizId: mine },
      });
      await ctx
        .http()
        .post(`/quiz-launch/proctor/${org.id}/${theirs}`)
        .set(auth)
        .expect(404);
    });
  });

  describe('catalogue', () => {
    it('shows visitors only published quizzes and staff all of them', async () => {
      const { auth, org } = await member('ADMIN');
      quiz(org.id);

      await ctx
        .http()
        .get(`/quiz-launch/organisation/${org.id}/quizzes`)
        .expect(200);
      expect(listed[0]).toEqual({
        ownerRef: `org:${org.id}`,
        publishState: 'PUBLISHED',
      });

      const staff = await ctx
        .http()
        .get(`/quiz-launch/organisation/${org.id}/quizzes`)
        .set(auth)
        .expect(200);
      expect(listed[1]).toEqual({ ownerRef: `org:${org.id}` });
      expect(staff.body[0]).toMatchObject({ title: 'Ptice', questionCount: 3 });
    });
  });

  describe('webhook', () => {
    async function send(event: Record<string, unknown>, tamper = false) {
      const body = JSON.stringify(event);
      const now = Math.floor(Date.now() / 1000);
      const signature = await new SignJWT({
        body_sha256: createHash('sha256').update(body).digest('base64url'),
      })
        .setProtectedHeader({ alg: 'EdDSA', kid: 'v' })
        .setIssuer('vansy')
        .setAudience('zbirka')
        .setJti(event.eventId as string)
        .setIssuedAt(now)
        .setExpirationTime(now + 300)
        .sign(vansyKey);
      return ctx
        .http()
        .post('/integrations/vansy/webhook')
        .set('content-type', 'application/json')
        .set('vansy-signature', signature)
        .send(tamper ? body.replace('"score":2', '"score":3') : body);
    }

    it('stores a completed attempt once and refuses forgeries', async () => {
      const { org } = await member('OWNER');
      const id = quiz(org.id);
      const taker = await createSession(ctx);
      const event = {
        eventId: randomUUID(),
        type: 'attempt.completed',
        occurredAt: new Date().toISOString(),
        tenantId: 'zbirka',
        attempt: {
          id: randomUUID(),
          quizId: id,
          quizVersion: 1,
          subject: { externalUserId: taker.user.id },
          team: null,
          contextRef: null,
          score: 2,
          maxScore: 3,
          percent: 66.67,
          passed: null,
          startedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
          durationMs: 30000,
          status: 'SUBMITTED',
          integrity: { reviewStatus: 'NONE' },
        },
      };

      expect((await send(event, true)).status).toBe(401);
      await ctx
        .http()
        .post('/integrations/vansy/webhook')
        .set('content-type', 'application/json')
        .send(JSON.stringify(event))
        .expect(401);

      expect((await send(event)).body).toEqual({
        received: true,
        duplicate: false,
      });
      expect((await send(event)).body).toEqual({
        received: true,
        duplicate: true,
      });

      const mine = await ctx
        .http()
        .get('/quiz-launch/results/mine')
        .set(taker.auth)
        .expect(200);
      expect(mine.body).toEqual([
        expect.objectContaining({
          vansyQuizId: id,
          organisationId: org.id,
          userId: taker.user.id,
          score: 2,
          status: 'SUBMITTED',
        }),
      ]);
    });
  });
});
