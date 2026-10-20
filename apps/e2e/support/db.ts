import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DATABASE_URL, assertSafeDatabase } from "./env";

assertSafeDatabase();

export const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

/** Password of every user created by `createUser`. */
export const PASSWORD = "Str0ng!Passw0rd";
// bcrypt hash of PASSWORD (cost 10), so fixtures do not need bcrypt themselves.
const PASSWORD_HASH =
  "$2b$10$40zdWsQAOiWmr1WcQgy5vOO4OKvm05wJzIy.XbMP73Axkzurmgilm";

const tag = () => randomUUID().slice(0, 8);

export const resetDatabase = async () => {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length)
    await prisma.$executeRawUnsafe(
      `TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`,
    );
};

export const createUser = (
  over: Partial<{
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: "USER" | "ADMIN" | "SUPER";
    isActivated: boolean;
  }> = {},
) => {
  const id = tag();
  return prisma.user.create({
    data: {
      email: `user-${id}@test.hr`,
      username: `user_${id}`,
      firstName: "Test",
      lastName: "Korisnik",
      location: "GRAD_ZAGREB",
      password: PASSWORD_HASH,
      isActivated: true,
      ...over,
    },
  });
};

/**
 * Issues a password reset link the way `POST /users/forgot-password` does:
 * the user gets the token, the database only its SHA-256 hash.
 */
export const createPasswordResetToken = async (
  userId: string,
  expiresAt = new Date(Date.now() + 60 * 60 * 1000),
) => {
  const token = randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: createHash("sha256").update(token).digest("hex"),
      passwordResetExpiresAt: expiresAt,
    },
  });
  return token;
};

export const createOrganisation = (
  over: Partial<{ name: string; isApproved: boolean }> = {},
  members: { userId: string; role: "OWNER" | "ADMIN" | "MEMBER" | "REQUESTED" }[] = [],
) => {
  const id = tag();
  return prisma.organisation.create({
    data: {
      name: `Organizacija ${id}`,
      description: "Opis testne organizacije",
      email: `org-${id}@test.hr`,
      websiteUrl: "https://example.org",
      mainImage: "https://example.org/logo.png",
      location: "GRAD_ZAGREB",
      ...over,
      OrganisationUsers: { create: members },
    },
  });
};

export const createExponat = (
  organisationId: string,
  over: Partial<{ name: string; alternateName: string; isApproved: boolean }> = {},
) => {
  const id = tag();
  return prisma.exponat.create({
    data: {
      name: `Eksponat ${id}`,
      alternateName: `Alternativni ${id}`,
      description: "Opis testnog eksponata",
      ExponatKind: "MINERAL",
      funFacts: ["Zanimljivost"],
      // the app stores the attributes as a JSON string (see useExponatSubmit)
      attributes: JSON.stringify({ tvrdoća: "7" }) as never,
      mainImage: "https://example.org/e.png",
      organisationId,
      ...over,
    },
  });
};

export const createAuthorshipInfo = (authorId: string) =>
  prisma.authorshipInfo.create({
    data: { authorId, photographer: "Test Fotograf" },
  });

export const createPost = async (
  authorId: string,
  exponatId: string,
  over: Partial<{ title: string; isApproved: boolean }> = {},
) => {
  const info = await createAuthorshipInfo(authorId);
  return prisma.post.create({
    data: {
      title: "Testna objava",
      text: "Tekst testne objave koji je dovoljno dug.",
      image: "https://example.org/p.png",
      thumbnailImage: "https://example.org/t.png",
      authorId,
      ExponatId: exponatId,
      authorshipInfoId: info.id,
      isApproved: true,
      ...over,
    },
  });
};
