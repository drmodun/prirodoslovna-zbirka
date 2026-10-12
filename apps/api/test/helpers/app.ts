import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { EmailService } from 'src/email/email.service';
import { PrismaClientExceptionFilter } from 'src/prisma-client-exception/prisma-client-exception.filter';
import { PrismaService } from 'src/prisma/prisma.service';

export interface SentMail {
  to: string;
  subject: string;
  text: string;
}

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  /** every email the application tried to send since the last reset */
  mails: SentMail[];
  http: () => ReturnType<typeof request>;
  /** wipe every table (keeps the migration history) and the mail outbox */
  reset: () => Promise<void>;
  close: () => Promise<void>;
}

/**
 * Boots the complete application (all modules, real Prisma + Postgres) and
 * applies the same global pipes/filters as src/main.ts. Only outbound email is
 * replaced; files go to a temp directory because no S3 credentials are set.
 *
 * NOTE: keep in sync with the bootstrap in src/main.ts.
 */
export async function createTestContext(): Promise<TestContext> {
  const mails: SentMail[] = [];
  // The exception filter and notification service log every handled error;
  // keep the test output readable.
  const silenced = [
    jest.spyOn(console, 'error').mockImplementation(),
    jest.spyOn(console, 'log').mockImplementation(),
  ];

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(EmailService)
    .useValue({
      sendMail: async (to: string, subject: string, text: string) => {
        mails.push({ to, subject, text });
      },
    })
    .compile();

  const app = moduleRef.createNestApplication();
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  BigInt.prototype['toJSON'] = function () {
    return Number.parseInt(this.toString());
  };
  await app.init();

  const prisma = app.get(PrismaService);

  const reset = async () => {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
    if (tables.length)
      await prisma.$executeRawUnsafe(
        `TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`,
      );
    mails.length = 0;
  };

  return {
    app,
    prisma,
    mails,
    http: () => request(app.getHttpServer()),
    reset,
    close: async () => {
      silenced.forEach((spy) => spy.mockRestore());
      await app.close();
    },
  };
}

// ---------------------------------------------------------------------------
// Factories. They write straight to the database so that each test only
// exercises the endpoint it is about.
// ---------------------------------------------------------------------------

export const PASSWORD = 'Str0ng!Passw0rd';
let passwordHash: string | undefined;

type Role = 'USER' | 'ADMIN' | 'SUPER';
const unique = () => randomUUID().slice(0, 8);

export async function createUser(
  ctx: TestContext,
  over: Partial<{
    role: Role;
    isActivated: boolean;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  }> = {},
) {
  passwordHash ??= await bcrypt.hash(PASSWORD, 4);
  const tag = unique();
  return ctx.prisma.user.create({
    data: {
      email: `user-${tag}@test.hr`,
      username: `user_${tag}`,
      firstName: 'Test',
      lastName: 'User',
      location: 'GRAD_ZAGREB',
      password: passwordHash,
      isActivated: true,
      ...over,
    },
  });
}

export async function loginAs(
  ctx: TestContext,
  user: { email: string },
): Promise<string> {
  const res = await ctx
    .http()
    .post('/auth/login')
    .send({ email: user.email, password: PASSWORD })
    .expect(201);
  return res.body.access_token;
}

/** A user plus a bearer token and ready-made Authorization header. */
export async function createSession(
  ctx: TestContext,
  over: Parameters<typeof createUser>[1] = {},
) {
  const user = await createUser(ctx, over);
  const token = await loginAs(ctx, user);
  return { user, token, auth: { Authorization: `Bearer ${token}` } };
}

export async function createOrganisation(
  ctx: TestContext,
  over: Partial<{ name: string; isApproved: boolean }> = {},
  members: {
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'REQUESTED';
  }[] = [],
) {
  const tag = unique();
  return ctx.prisma.organisation.create({
    data: {
      name: `Organisation ${tag}`,
      description: 'A test organisation',
      email: `org-${tag}@test.hr`,
      websiteUrl: 'https://example.org',
      mainImage: 'https://example.org/img.png',
      location: 'GRAD_ZAGREB',
      ...over,
      OrganisationUsers: { create: members },
    },
  });
}

export async function createExponat(
  ctx: TestContext,
  organisationId: string,
  over: Partial<{ name: string; isApproved: boolean }> = {},
) {
  const tag = unique();
  return ctx.prisma.exponat.create({
    data: {
      name: `Exponat ${tag}`,
      alternateName: `Alternate ${tag}`,
      description: 'A test exponat description',
      ExponatKind: 'EUCARIOT',
      funFacts: ['one'],
      attributes: {},
      mainImage: 'https://example.org/e.png',
      organisationId,
      ...over,
    },
  });
}

export async function createAuthorshipInfo(ctx: TestContext, authorId: string) {
  return ctx.prisma.authorshipInfo.create({
    data: { authorId, photographer: 'Test Photographer' },
  });
}
