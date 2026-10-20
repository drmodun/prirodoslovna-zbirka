import { Role } from '@prisma/client';

// Platform roles. In the JWT they are `user` / `admin` / `super`.
//
// - SUPER: platform administrator, can do everything.
// - ADMIN: platform moderator. Passes every content check (exponats, posts,
//   works, social posts, quizzes, categorizations, organisation approval) and
//   sees pending content, but cannot manage user accounts, see e-mail
//   addresses, or change organisation details, memberships or ownership.
type TokenUser = { role?: string } | undefined | null;

export const isSuperUser = (user: TokenUser) => user?.role === 'super';

export const isModerator = (user: TokenUser) =>
  user?.role === 'super' || user?.role === 'admin';

export const isModeratorRole = (role: Role | undefined | null) =>
  role === Role.SUPER || role === Role.ADMIN;
