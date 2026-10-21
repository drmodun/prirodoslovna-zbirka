import {
  createAuthorshipInfo,
  createExponat,
  createOrganisation,
  createSession,
  createTestContext,
  createUser,
  TestContext,
} from './helpers/app';

// The platform ADMIN role is a content moderator: it passes content checks in
// every organisation, but cannot manage accounts, memberships or organisation
// details (those stay with SUPER).
describe('platform ADMIN (moderator) role (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());
  beforeEach(() => ctx.reset());

  async function organisationWithPendingPost() {
    const author = await createSession(ctx);
    const org = await createOrganisation(ctx, {}, [
      { userId: author.user.id, role: 'MEMBER' },
    ]);
    const exponat = await createExponat(ctx, org.id);
    const info = await createAuthorshipInfo(ctx, author.user.id);
    const post = await ctx.prisma.post.create({
      data: {
        title: 'Pending post',
        text: 'Pending post text',
        image: 'i',
        thumbnailImage: 't',
        authorId: author.user.id,
        ExponatId: exponat.id,
        authorshipInfoId: info.id,
        isApproved: false,
      },
    });
    return { author, org, exponat, post };
  }

  it('moderates posts and exponats in organisations it is not a member of', async () => {
    const moderator = await createSession(ctx, { role: 'ADMIN' });
    const { org, exponat, post } = await organisationWithPendingPost();

    await ctx.http().get(`/posts/${post.id}`).set(moderator.auth).expect(200);
    const hidden = await ctx
      .http()
      .get(`/posts/${org.id}/hidden`)
      .set(moderator.auth)
      .expect(200);
    expect(hidden.body.map((p: any) => p.id)).toEqual([post.id]);

    await ctx
      .http()
      .patch(`/posts/${post.id}/approval`)
      .set(moderator.auth)
      .expect(200);
    expect(
      (await ctx.prisma.post.findUniqueOrThrow({ where: { id: post.id } }))
        .isApproved,
    ).toBe(true);

    await ctx
      .http()
      .delete(`/exponats/${exponat.id}`)
      .set(moderator.auth)
      .expect(200);
    expect(await ctx.prisma.exponat.count()).toBe(0);
  });

  it("approves another organisation's quiz", async () => {
    const moderator = await createSession(ctx, { role: 'ADMIN' });
    const org = await createOrganisation(ctx);
    const quiz = await ctx.prisma.quiz.create({
      data: {
        title: 'Kviz o lisicama',
        description: 'Provjerite znanje',
        difficulty: 'EASY',
        timeLimitType: 'NONE',
        organisationId: org.id,
      },
    });

    await ctx
      .http()
      .get(`/quizzes/${org.id}/non-approved`)
      .set(moderator.auth)
      .expect(200);
    await ctx
      .http()
      .patch(`/quizzes/${org.id}/${quiz.id}/approval`)
      .set(moderator.auth)
      .expect(200);
    expect(
      (await ctx.prisma.quiz.findUniqueOrThrow({ where: { id: quiz.id } }))
        .isApproved,
    ).toBe(true);
  });

  it('approves organisations and sees unapproved ones', async () => {
    const moderator = await createSession(ctx, { role: 'ADMIN' });
    const org = await createOrganisation(ctx, { isApproved: false });

    await ctx
      .http()
      .get(`/organisations/${org.id}`)
      .set(moderator.auth)
      .expect(200);
    await ctx
      .http()
      .patch(`/organisations/${org.id}/approval`)
      .set(moderator.auth)
      .expect(200);
    expect(
      (
        await ctx.prisma.organisation.findUniqueOrThrow({
          where: { id: org.id },
        })
      ).isApproved,
    ).toBe(true);
  });

  it('cannot create content for organisations it is not a member of', async () => {
    const moderator = await createSession(ctx, { role: 'ADMIN' });
    const org = await createOrganisation(ctx);
    const info = await createAuthorshipInfo(ctx, moderator.user.id);

    await ctx
      .http()
      .post(`/exponats/${org.id}`)
      .set(moderator.auth)
      .send({
        name: 'Crvena lisica',
        alternateName: 'Vulpes vulpes',
        description: 'Mala zvijer iz porodice pasa',
        mainImage: 'https://example.org/fox.png',
        funFacts: ['Brza'],
        ExponatKind: 'EUCARIOT',
        attributes: '{"visina":"40cm"}',
        authorshipInfoId: info.id,
      })
      .expect(401);
    await ctx
      .http()
      .post(`/social-posts/${org.id}`)
      .set(moderator.auth)
      .send({
        title: 'Dan otvorenih vrata',
        text: 'Pridružite nam se na danu otvorenih vrata muzeja',
        images: ['https://example.org/a.png'],
        authorshipInfoId: info.id,
      })
      .expect(401);
    await ctx
      .http()
      .post(`/quizzes/${org.id}`)
      .set(moderator.auth)
      .send({
        title: 'Novi kviz o pticama',
        description: 'Kratki kviz',
        coverImage: 'https://example.org/c.png',
        timeLimitType: 'NONE',
        isTest: false,
        difficulty: 'EASY',
        questions: [
          {
            question: 'Koja je glavna boja lisice?',
            questionType: 'MULTIPLE_CHOICE',
            options: ['crvena', 'plava'],
            correct: ['crvena'],
            points: 2,
          },
        ],
      })
      .expect(401);

    expect(await ctx.prisma.exponat.count()).toBe(0);
    expect(await ctx.prisma.socialPost.count()).toBe(0);
    expect(await ctx.prisma.quiz.count()).toBe(0);
  });

  it('cannot change organisation details or memberships', async () => {
    const moderator = await createSession(ctx, { role: 'ADMIN' });
    const member = await createUser(ctx);
    const org = await createOrganisation(ctx, {}, [
      { userId: member.id, role: 'MEMBER' },
    ]);

    await ctx
      .http()
      .patch(`/organisations/${org.id}`)
      .set(moderator.auth)
      .send({
        name: 'Taken over',
        description: 'Muzej prirodnih znanosti',
        email: org.email,
        websiteUrl: 'https://muzej.example.hr',
        mainImage: 'https://muzej.example.hr/logo.png',
        location: 'GRAD_ZAGREB',
      })
      .expect(401);
    await ctx
      .http()
      .delete(`/organisations/${org.id}`)
      .set(moderator.auth)
      .expect(401);
    await ctx
      .http()
      .get(`/organisations/${org.id}/requests`)
      .set(moderator.auth)
      .expect(401);
    await ctx
      .http()
      .patch(`/members/${org.id}/${member.id}`)
      .set(moderator.auth)
      .send({ role: 'ADMIN' })
      .expect(401);
    await ctx
      .http()
      .delete(`/members/${org.id}/${member.id}/remove`)
      .set(moderator.auth)
      .expect(401);
    expect(
      (
        await ctx.prisma.organisationUser.findFirstOrThrow({
          where: { userId: member.id },
        })
      ).role,
    ).toBe('MEMBER');
  });

  it('cannot manage accounts or see e-mail addresses', async () => {
    const moderator = await createSession(ctx, { role: 'ADMIN' });
    const victim = await createUser(ctx);

    await ctx
      .http()
      .delete(`/users/${victim.id}`)
      .set(moderator.auth)
      .expect(401);
    await ctx
      .http()
      .patch(`/users/${victim.id}`)
      .set(moderator.auth)
      .send({
        firstName: 'Novo',
        lastName: 'Ime',
        username: 'novo_ime',
        location: 'ISTARSKA',
        bio: 'Nova biografija',
        hasProfileImage: false,
      })
      .expect(401);
    const profile = await ctx
      .http()
      .get(`/users/${victim.id}`)
      .set(moderator.auth)
      .expect(200);
    expect(profile.body).not.toHaveProperty('email');
  });
});
