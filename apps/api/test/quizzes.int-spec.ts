import {
  createOrganisation,
  createSession,
  createTestContext,
  TestContext,
} from './helpers/app';

describe('quizzes & questions (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  async function member(role: 'OWNER' | 'ADMIN' | 'MEMBER') {
    const session = await createSession(ctx);
    const org = await createOrganisation(ctx, {}, [
      { userId: session.user.id, role },
    ]);
    return { ...session, org };
  }

  const questionData = (over: Record<string, unknown> = {}) => ({
    question: 'Koja je glavna boja lisice?',
    questionType: 'MULTIPLE_CHOICE' as const,
    options: ['crvena', 'plava'],
    correct: ['crvena'],
    points: 2,
    ...over,
  });

  // The DTO validates enum *values* (Croatian labels) instead of the keys the
  // database uses (see the BUG note in "creating quizzes"). Sending the label
  // is the only way to get past validation and reach the permission checks.
  const questionWithLabel = () =>
    questionData({ questionType: 'Višestruki izbor' as never });

  async function createQuiz(
    organisationId: string,
    over: Record<string, unknown> = {},
  ) {
    return ctx.prisma.quiz.create({
      data: {
        title: 'Kviz o životinjama',
        description: 'Provjerite znanje',
        difficulty: 'EASY',
        timeLimitType: 'NONE',
        organisationId,
        isApproved: true,
        questions: {
          create: [
            questionData(),
            questionData({ question: 'Druga zagonetka?' }),
          ],
        },
        ...over,
      },
    });
  }

  describe('creating quizzes', () => {
    const quizBody = () => ({
      title: 'Novi kviz o pticama',
      description: 'Kratki kviz',
      coverImage: 'https://example.org/c.png',
      timeLimitType: 'NONE',
      isTest: false,
      difficulty: 'EASY',
      questions: [questionData()],
    });

    it('requires authentication and organisation admin rights', async () => {
      const plain = await member('MEMBER');
      await ctx
        .http()
        .post(`/quizzes/${plain.org.id}`)
        .send(quizBody())
        .expect(401);
      const res = await ctx
        .http()
        .post(`/quizzes/${plain.org.id}`)
        .set(plain.auth)
        .send(quizBody());
      expect([400, 401]).toContain(res.status); // 400 from validation or 401 from permissions
      expect(await ctx.prisma.quiz.count()).toBe(0);
    });

    // BUG: creation can never succeed. The DTO decorates `questions` with
    // @MinLength(1) (a string validator), and @IsEnum(QuestionTypeEnum /
    // TimeLimitTypeEnum / QuizDifficulty) validates the Croatian display
    // *values* while the types and Prisma use the *keys* (MULTIPLE_CHOICE, ...).
    // The cross-organisation check in QuizzesController.create (URL vs body
    // organisationId) is covered by the unit tests until creation works.
    it.failing(
      'an organisation admin can create a quiz with questions',
      async () => {
        const admin = await member('ADMIN');
        await ctx
          .http()
          .post(`/quizzes/${admin.org.id}`)
          .set(admin.auth)
          .send(quizBody())
          .expect(201);
        const stored = await ctx.prisma.quiz.findFirstOrThrow({
          include: { questions: true },
        });
        expect(stored.questions).toHaveLength(1);
      },
    );
  });

  describe('reading quizzes', () => {
    const paging = { page: 1, size: 10 };

    // BUG: findAll computes `skip: (page - 1) * size` straight from the query
    // string, which is NaN when the parameters are omitted, so the plain
    // `GET /quizzes` answers 500.
    it.failing('lists quizzes without paging parameters', async () => {
      const { org } = await member('OWNER');
      await createQuiz(org.id);
      await ctx.http().get('/quizzes').expect(200);
    });

    it('lists quizzes with counts and filters them', async () => {
      const { org } = await member('OWNER');
      await createQuiz(org.id, { title: 'Kviz o pticama', difficulty: 'HARD' });
      await createQuiz(org.id, { title: 'Kviz o ribama' });

      const all = await ctx.http().get('/quizzes').query(paging).expect(200);
      expect(all.body).toHaveLength(2);
      expect(all.body[0]).toMatchObject({
        questionAmount: 2,
        attemptsAmount: 0,
      });

      const hard = await ctx
        .http()
        .get('/quizzes')
        .query({ ...paging, difficulty: 'HARD' })
        .expect(200);
      expect(hard.body.map((q: any) => q.title)).toEqual(['Kviz o pticama']);

      const search = await ctx
        .http()
        .get('/quizzes')
        .query({ ...paging, title: 'ribama' })
        .expect(200);
      expect(search.body.map((q: any) => q.title)).toEqual(['Kviz o ribama']);
    });

    it('the quiz page does not reveal the correct answers', async () => {
      const { org } = await member('OWNER');
      const quiz = await createQuiz(org.id);
      const res = await ctx.http().get(`/quizzes/${quiz.id}`).expect(200);
      expect(res.body).toMatchObject({
        id: quiz.id,
        questionAmount: 2,
        organisationName: org.name,
      });
      expect(res.body.questions).toHaveLength(2);
      for (const q of res.body.questions) {
        expect(q).not.toHaveProperty('correct');
        expect(q).not.toHaveProperty('points');
      }
    });

    it('unknown quizzes are a 404', async () => {
      await ctx
        .http()
        .get('/quizzes/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it.failing('the public list only contains approved quizzes', async () => {
      const { org } = await member('OWNER');
      await createQuiz(org.id, { title: 'Skriveni kviz', isApproved: false });
      const res = await ctx.http().get('/quizzes').query(paging).expect(200);
      expect(res.body).toEqual([]);
    });

    it.failing(
      'the list reports the organisation name (not its image URL)',
      async () => {
        const { org } = await member('OWNER');
        await createQuiz(org.id);
        const res = await ctx.http().get('/quizzes').query(paging).expect(200);
        expect(res.body[0].organisationName).toBe(org.name);
      },
    );
  });

  describe('moderation', () => {
    it('organisation admins list pending quizzes and can inspect one including answers', async () => {
      const admin = await member('ADMIN');
      const pending = await createQuiz(admin.org.id, { isApproved: false });
      await createQuiz(admin.org.id, { title: 'Already live' });

      const list = await ctx
        .http()
        .get(`/quizzes/${admin.org.id}/non-approved`)
        .set(admin.auth)
        .expect(200);
      expect(list.body.map((q: any) => q.id)).toEqual([pending.id]);

      const one = await ctx
        .http()
        .get(`/quizzes/${admin.org.id}/non-approved/${pending.id}`)
        .set(admin.auth)
        .expect(200);
      expect(one.body.questions[0]).toHaveProperty('correct');
    });

    it('plain members and anonymous users cannot see pending quizzes', async () => {
      const plain = await member('MEMBER');
      await ctx.http().get(`/quizzes/${plain.org.id}/non-approved`).expect(401);
      await ctx
        .http()
        .get(`/quizzes/${plain.org.id}/non-approved`)
        .set(plain.auth)
        .expect(401);
    });

    it('admins toggle approval', async () => {
      const admin = await member('ADMIN');
      const quiz = await createQuiz(admin.org.id, { isApproved: false });
      await ctx
        .http()
        .patch(`/quizzes/${admin.org.id}/${quiz.id}/approval`)
        .set(admin.auth)
        .expect(200);
      expect(
        (await ctx.prisma.quiz.findUniqueOrThrow({ where: { id: quiz.id } }))
          .isApproved,
      ).toBe(true);
    });

    // BUG: UpdateQuizDto is built from getCreateQuizRequest, so *every* field is
    // required (and the broken `questions` validator applies), meaning no quiz
    // can be updated, and validation fails (400) before permissions are checked.
    it.failing('admins can update the title of their quiz', async () => {
      const admin = await member('ADMIN');
      const quiz = await createQuiz(admin.org.id);
      await ctx
        .http()
        .patch(`/quizzes/${admin.org.id}/${quiz.id}`)
        .set(admin.auth)
        .send({ title: 'Preimenovani kviz' })
        .expect(200);
      expect(
        (await ctx.prisma.quiz.findUniqueOrThrow({ where: { id: quiz.id } }))
          .title,
      ).toBe('Preimenovani kviz');
    });

    it('anonymous users cannot update quizzes', async () => {
      const admin = await member('ADMIN');
      const quiz = await createQuiz(admin.org.id);
      await ctx
        .http()
        .patch(`/quizzes/${admin.org.id}/${quiz.id}`)
        .send({ title: 'Nope nope' })
        .expect(401);
    });

    it.failing(
      'an admin of another organisation cannot approve a foreign quiz',
      async () => {
        const owner = await member('ADMIN');
        const intruder = await member('ADMIN');
        const quiz = await createQuiz(owner.org.id, { isApproved: false });
        await ctx
          .http()
          .patch(`/quizzes/${intruder.org.id}/${quiz.id}/approval`)
          .set(intruder.auth);
        expect(
          (await ctx.prisma.quiz.findUniqueOrThrow({ where: { id: quiz.id } }))
            .isApproved,
        ).toBe(false);
      },
    );

    // BUG: the route is declared as ':orgnisationId/:id' (typo) so the handler's
    // organisation id is undefined and `hasAdminRights` matches *any* membership
    // of the user, letting an admin of one organisation delete another's quiz.
    it.failing(
      'an admin of another organisation cannot delete a foreign quiz',
      async () => {
        const owner = await member('ADMIN');
        const intruder = await member('ADMIN');
        const quiz = await createQuiz(owner.org.id);
        await ctx
          .http()
          .delete(`/quizzes/${owner.org.id}/${quiz.id}`)
          .set(intruder.auth);
        expect(await ctx.prisma.quiz.count({ where: { id: quiz.id } })).toBe(1);
      },
    );
  });

  describe('questions', () => {
    it('reads a single question, 404 for unknown ones', async () => {
      const { org } = await member('OWNER');
      const quiz = await createQuiz(org.id);
      const question = await ctx.prisma.question.findFirstOrThrow({
        where: { quizId: quiz.id },
      });
      const one = await ctx.http().get(`/questions/${question.id}`).expect(200);
      expect(one.body).toMatchObject({ id: question.id, correctPercentage: 0 });
      await ctx
        .http()
        .get('/questions/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    // BUG: QuestionQuery is built from getCreateQuestionDto, so a plain
    // `GET /questions?quizId=...` is rejected (400) unless a complete question
    // is supplied as the query string.
    it.failing('lists the questions of a quiz', async () => {
      const { org } = await member('OWNER');
      const quiz = await createQuiz(org.id);
      const list = await ctx
        .http()
        .get('/questions')
        .query({ quizId: quiz.id })
        .expect(200);
      expect(list.body).toHaveLength(2);
    });

    it.failing(
      'the public question endpoints do not expose the correct answers',
      async () => {
        const { org } = await member('OWNER');
        const quiz = await createQuiz(org.id);
        const question = await ctx.prisma.question.findFirstOrThrow({
          where: { quizId: quiz.id },
        });
        const one = await ctx
          .http()
          .get(`/questions/${question.id}`)
          .expect(200);
        expect(one.body).not.toHaveProperty('correct');
        expect(one.body).not.toHaveProperty('correctAnswer');
      },
    );

    // BUG: the controller passes the *quiz* id to `hasEditPermission`, which looks
    // a *question* up by id, so nobody (not even the owner) can ever add, edit or
    // remove questions. (The label is used so the request gets past validation.)
    it.failing(
      'an organisation admin can add a question to their quiz',
      async () => {
        const admin = await member('ADMIN');
        const quiz = await createQuiz(admin.org.id);
        await ctx
          .http()
          .post(`/questions/${quiz.id}`)
          .set(admin.auth)
          .send(questionWithLabel())
          .expect(201);
        expect(
          await ctx.prisma.question.count({ where: { quizId: quiz.id } }),
        ).toBe(3);
      },
    );

    it('anonymous users and strangers cannot add questions', async () => {
      const admin = await member('ADMIN');
      const stranger = await createSession(ctx);
      const quiz = await createQuiz(admin.org.id);
      await ctx
        .http()
        .post(`/questions/${quiz.id}`)
        .send(questionWithLabel())
        .expect(401);
      await ctx
        .http()
        .post(`/questions/${quiz.id}`)
        .set(stranger.auth)
        .send(questionWithLabel())
        .expect(401);
      expect(
        await ctx.prisma.question.count({ where: { quizId: quiz.id } }),
      ).toBe(2);
    });
  });
});
