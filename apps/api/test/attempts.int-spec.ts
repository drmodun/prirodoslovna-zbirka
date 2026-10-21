import {
  createOrganisation,
  createSession,
  createTestContext,
  TestContext,
} from './helpers/app';

describe('quiz attempts (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  async function setup(over: Record<string, unknown> = {}) {
    const owner = await createSession(ctx);
    const org = await createOrganisation(ctx, {}, [
      { userId: owner.user.id, role: 'OWNER' },
    ]);
    const quiz = await ctx.prisma.quiz.create({
      data: {
        title: 'Kviz o lisicama',
        description: 'Provjerite znanje',
        difficulty: 'EASY',
        timeLimitType: 'NONE',
        organisationId: org.id,
        isApproved: true,
        isRetakeable: true,
        questions: {
          create: [
            {
              question: 'Koje je boje lisica?',
              questionType: 'MULTIPLE_CHOICE',
              options: ['crvena', 'plava', 'smeđa'],
              correct: ['crvena', 'smeđa'],
              points: 2,
            },
            {
              question: 'Lisica je sisavac.',
              questionType: 'TRUE_FALSE',
              options: [],
              correct: ['true'],
              points: 1,
            },
            {
              question: 'Latinski naziv lisice?',
              questionType: 'FILL_IN_THE_BLANK',
              options: [],
              correct: ['Vulpes vulpes'],
              points: 3,
            },
          ],
        },
        ...over,
      },
      include: { questions: true },
    });
    const byType = (type: string) =>
      quiz.questions.find((question) => question.questionType === type).id;
    return {
      owner,
      org,
      quiz,
      mc: byType('MULTIPLE_CHOICE'),
      tf: byType('TRUE_FALSE'),
      fill: byType('FILL_IN_THE_BLANK'),
    };
  }

  const start = (quizId: string, auth?: Record<string, string>) => {
    const req = ctx.http().post(`/attempts/quiz/${quizId}`);
    return auth ? req.set(auth) : req;
  };

  const submit = (
    attemptId: string,
    answers: unknown[],
    auth?: Record<string, string>,
  ) => {
    const req = ctx
      .http()
      .post(`/attempts/${attemptId}/submit`)
      .send({ answers });
    return auth ? req.set(auth) : req;
  };

  it('a user takes a quiz and gets it scored on the server', async () => {
    const { quiz, mc, tf, fill } = await setup();
    const student = await createSession(ctx);

    const started = await start(quiz.id, student.auth).expect(201);
    expect(started.body).toMatchObject({ quizId: quiz.id });
    expect(started.body.deadline).toBeUndefined();

    const res = await submit(
      started.body.id,
      [
        { questionId: mc, answer: ['smeđa', 'crvena'] },
        { questionId: tf, answer: ['false'] },
        { questionId: fill, answer: [' vulpes VULPES '] },
      ],
      student.auth,
    ).expect(201);

    expect(res.body).toMatchObject({
      id: started.body.id,
      quizTitle: 'Kviz o lisicama',
      userId: student.user.id,
      score: 5,
      maxScore: 6,
    });
    expect(res.body.submittedAt).toBeDefined();
    const byQuestion = Object.fromEntries(
      res.body.answers.map((a: any) => [a.questionId, a]),
    );
    expect(byQuestion[mc]).toMatchObject({ isCorrect: true, points: 2 });
    expect(byQuestion[tf]).toMatchObject({
      isCorrect: false,
      points: 0,
      answer: ['false'],
      correctAnswer: ['true'],
    });
    expect(byQuestion[fill]).toMatchObject({ isCorrect: true, points: 3 });
  });

  it('the quiz page reports finished attempts and the average score', async () => {
    const { quiz, tf, fill } = await setup();
    const a = await createSession(ctx);
    const b = await createSession(ctx);

    const first = await start(quiz.id, a.auth).expect(201);
    await submit(
      first.body.id,
      [{ questionId: tf, answer: ['true'] }],
      a.auth,
    ).expect(201);
    const second = await start(quiz.id, b.auth).expect(201);
    await submit(
      second.body.id,
      [
        { questionId: tf, answer: ['true'] },
        { questionId: fill, answer: ['Vulpes vulpes'] },
      ],
      b.auth,
    ).expect(201);
    // a third, unfinished attempt does not count
    await start(quiz.id, (await createSession(ctx)).auth).expect(201);

    const page = await ctx.http().get(`/quizzes/${quiz.id}`).expect(200);
    expect(page.body).toMatchObject({
      attemptsAmount: 2,
      averageAttemptScore: 2.5,
    });
    const list = await ctx.http().get('/quizzes').expect(200);
    expect(list.body[0].attemptsAmount).toBe(2);
  });

  it('starting again resumes the running attempt', async () => {
    const { quiz } = await setup();
    const student = await createSession(ctx);
    const first = await start(quiz.id, student.auth).expect(201);
    const again = await start(quiz.id, student.auth).expect(201);
    expect(again.body.id).toBe(first.body.id);
    expect(await ctx.prisma.attempt.count()).toBe(1);
  });

  it('a quiz that is not retakeable can be finished once', async () => {
    const { quiz, tf } = await setup({ isRetakeable: false });
    const student = await createSession(ctx);
    const attempt = await start(quiz.id, student.auth).expect(201);
    await submit(
      attempt.body.id,
      [{ questionId: tf, answer: ['true'] }],
      student.auth,
    ).expect(201);

    await start(quiz.id, student.auth).expect(409);
  });

  it('a retakeable quiz can be taken again', async () => {
    const { quiz } = await setup();
    const student = await createSession(ctx);
    const first = await start(quiz.id, student.auth).expect(201);
    await submit(first.body.id, [], student.auth).expect(201);
    const second = await start(quiz.id, student.auth).expect(201);
    expect(second.body.id).not.toBe(first.body.id);
  });

  it('an attempt is submitted only once', async () => {
    const { quiz, tf } = await setup();
    const student = await createSession(ctx);
    const attempt = await start(quiz.id, student.auth).expect(201);
    await submit(
      attempt.body.id,
      [{ questionId: tf, answer: ['true'] }],
      student.auth,
    ).expect(201);
    await submit(
      attempt.body.id,
      [{ questionId: tf, answer: ['true'] }],
      student.auth,
    ).expect(409);
  });

  it('only the attempt owner can submit it', async () => {
    const { quiz } = await setup();
    const student = await createSession(ctx);
    const other = await createSession(ctx);
    const attempt = await start(quiz.id, student.auth).expect(201);
    await submit(attempt.body.id, [], other.auth).expect(401);
    await submit(attempt.body.id, []).expect(401);
  });

  it('rejects answers to questions of another quiz and duplicate answers', async () => {
    const { quiz, tf } = await setup();
    const { quiz: otherQuiz } = await setup();
    const student = await createSession(ctx);
    const attempt = await start(quiz.id, student.auth).expect(201);

    await submit(
      attempt.body.id,
      [{ questionId: otherQuiz.questions[0].id, answer: ['x'] }],
      student.auth,
    ).expect(400);
    await submit(
      attempt.body.id,
      [
        { questionId: tf, answer: ['true'] },
        { questionId: tf, answer: ['false'] },
      ],
      student.auth,
    ).expect(400);
    await submit(attempt.body.id, [{ answer: ['x'] }], student.auth).expect(
      400,
    );
    // nothing was stored, the attempt can still be finished
    await submit(
      attempt.body.id,
      [{ questionId: tf, answer: ['true'] }],
      student.auth,
    ).expect(201);
  });

  it('anonymous visitors need a quiz that allows them', async () => {
    const { quiz } = await setup();
    await start(quiz.id).expect(401);

    const { quiz: open, tf } = await setup({ isAnonymousAllowed: true });
    const attempt = await start(open.id).expect(201);
    const res = await submit(attempt.body.id, [
      { questionId: tf, answer: ['true'] },
    ]).expect(201);
    expect(res.body).toMatchObject({ score: 1 });
    expect(res.body.userId).toBeUndefined();
    await ctx.http().get(`/attempts/${attempt.body.id}`).expect(200);
  });

  it('unapproved and unknown quizzes cannot be taken', async () => {
    const { quiz } = await setup({ isApproved: false });
    const student = await createSession(ctx);
    await start(quiz.id, student.auth).expect(404);
    await start('00000000-0000-0000-0000-000000000000', student.auth).expect(
      404,
    );
  });

  describe('time limits', () => {
    it('a timed quiz reports its deadline', async () => {
      const { quiz } = await setup({
        timeLimitType: 'TOTAL',
        timeLimitTotal: 10 * 60 * 1000,
      });
      const student = await createSession(ctx);
      const res = await start(quiz.id, student.auth).expect(201);
      expect(
        new Date(res.body.deadline).getTime() -
          new Date(res.body.startedAt).getTime(),
      ).toBe(10 * 60 * 1000);
    });

    it('a late submission is refused and counts with no points', async () => {
      const { quiz, tf } = await setup({
        timeLimitType: 'TOTAL',
        timeLimitTotal: 5 * 60 * 1000,
        isRetakeable: false,
      });
      const student = await createSession(ctx);
      const attempt = await start(quiz.id, student.auth).expect(201);
      await ctx.prisma.attempt.update({
        where: { id: attempt.body.id },
        data: { startedAt: new Date(Date.now() - 6 * 60 * 1000) },
      });

      await submit(
        attempt.body.id,
        [{ questionId: tf, answer: ['true'] }],
        student.auth,
      ).expect(400);
      const stored = await ctx.prisma.attempt.findUniqueOrThrow({
        where: { id: attempt.body.id },
      });
      expect(stored.submittedAt).not.toBeNull();
      expect(stored.score).toBe(0);
      await start(quiz.id, student.auth).expect(409);
    });

    it('an expired running attempt is closed when starting again', async () => {
      const { quiz } = await setup({
        timeLimitType: 'TOTAL',
        timeLimitTotal: 5 * 60 * 1000,
      });
      const student = await createSession(ctx);
      const first = await start(quiz.id, student.auth).expect(201);
      await ctx.prisma.attempt.update({
        where: { id: first.body.id },
        data: { startedAt: new Date(Date.now() - 6 * 60 * 1000) },
      });

      const second = await start(quiz.id, student.auth).expect(201);
      expect(second.body.id).not.toBe(first.body.id);
    });

    it('per-question limits zero answers that took too long', async () => {
      const { quiz, tf, fill } = await setup({ timeLimitType: 'PER_QUESTION' });
      await ctx.prisma.question.updateMany({
        where: { quizId: quiz.id },
        data: { timeLimit: 30 },
      });
      const student = await createSession(ctx);
      const attempt = await start(quiz.id, student.auth).expect(201);
      expect(attempt.body.deadline).toBeDefined();

      const res = await submit(
        attempt.body.id,
        [
          { questionId: tf, answer: ['true'], timeTaken: 20 },
          { questionId: fill, answer: ['Vulpes vulpes'], timeTaken: 90 },
        ],
        student.auth,
      ).expect(201);
      expect(res.body.score).toBe(1);
    });
  });

  describe('reading results', () => {
    it('tests hide the correct answers from the student but not from admins', async () => {
      const { owner, quiz, tf } = await setup({ isTest: true });
      const student = await createSession(ctx);
      const attempt = await start(quiz.id, student.auth).expect(201);
      const res = await submit(
        attempt.body.id,
        [{ questionId: tf, answer: ['false'] }],
        student.auth,
      ).expect(201);
      expect(res.body.answers[0]).not.toHaveProperty('correctAnswer');
      expect(res.body.answers[0].isCorrect).toBe(false);

      const asOwner = await ctx
        .http()
        .get(`/attempts/${attempt.body.id}`)
        .set(owner.auth)
        .expect(200);
      expect(asOwner.body.answers[0].correctAnswer).toEqual(['true']);
    });

    it("other users cannot read someone's attempt", async () => {
      const { quiz } = await setup();
      const student = await createSession(ctx);
      const other = await createSession(ctx);
      const attempt = await start(quiz.id, student.auth).expect(201);
      await submit(attempt.body.id, [], student.auth).expect(201);

      await ctx
        .http()
        .get(`/attempts/${attempt.body.id}`)
        .set(other.auth)
        .expect(401);
      await ctx.http().get(`/attempts/${attempt.body.id}`).expect(401);
      await ctx
        .http()
        .get(`/attempts/${attempt.body.id}`)
        .set(student.auth)
        .expect(200);
    });

    it('lists my finished attempts', async () => {
      const { quiz, tf } = await setup();
      const student = await createSession(ctx);
      const attempt = await start(quiz.id, student.auth).expect(201);
      await submit(
        attempt.body.id,
        [{ questionId: tf, answer: ['true'] }],
        student.auth,
      ).expect(201);
      await start(quiz.id, student.auth).expect(201); // running, not listed

      const mine = await ctx
        .http()
        .get('/attempts/mine')
        .query({ quizId: quiz.id })
        .set(student.auth)
        .expect(200);
      expect(mine.body).toHaveLength(1);
      expect(mine.body[0]).toMatchObject({ id: attempt.body.id, score: 1 });
      await ctx.http().get('/attempts/mine').expect(401);
    });

    it('organisation admins see every attempt and per-question statistics', async () => {
      const { owner, quiz, mc, tf } = await setup();
      const a = await createSession(ctx);
      const b = await createSession(ctx);
      const first = await start(quiz.id, a.auth).expect(201);
      await submit(
        first.body.id,
        [
          { questionId: mc, answer: ['crvena', 'smeđa'] },
          { questionId: tf, answer: ['true'] },
        ],
        a.auth,
      ).expect(201);
      const second = await start(quiz.id, b.auth).expect(201);
      await submit(
        second.body.id,
        [{ questionId: mc, answer: ['plava'] }],
        b.auth,
      ).expect(201);

      const res = await ctx
        .http()
        .get(`/attempts/quiz/${quiz.id}/results`)
        .set(owner.auth)
        .expect(200);
      expect(res.body).toMatchObject({
        quizId: quiz.id,
        attemptsAmount: 2,
        averageAttemptScore: 1.5,
      });
      expect(res.body.attempts.map((x: any) => x.username).sort()).toEqual(
        [a.user.username, b.user.username].sort(),
      );
      const mcStats = res.body.questions.find((q: any) => q.id === mc);
      expect(mcStats.correctPercentage).toBe(50);
      expect(mcStats.answerDistribution).toEqual(
        expect.arrayContaining([
          { answer: 'crvena', amount: 1 },
          { answer: 'smeđa', amount: 1 },
          { answer: 'plava', amount: 1 },
        ]),
      );
      const tfStats = res.body.questions.find((q: any) => q.id === tf);
      expect(tfStats.correctPercentage).toBe(50);
    });

    it('results need admin rights in the quiz organisation', async () => {
      const { quiz } = await setup();
      const student = await createSession(ctx);
      await ctx
        .http()
        .get(`/attempts/quiz/${quiz.id}/results`)
        .set(student.auth)
        .expect(401);
      await ctx.http().get(`/attempts/quiz/${quiz.id}/results`).expect(401);
    });
  });
});
