---
title: API
description: The NestJS application, its modules, request pipeline, authentication and query conventions.
sidebar:
  order: 2
---

The API (`apps/api`) is a NestJS 10 application on Prisma 5 and PostgreSQL.
It listens on `PORT` (default `5500`) and documents itself with Swagger at
`/api` (UI) and `/api-json` (OpenAPI document, also used as the container
health check).

## Bootstrap

`src/main.ts` sets up, in order:

1. `PrismaClientExceptionFilter`: maps known Prisma errors to HTTP
   statuses: unique-constraint violations (`P2002`) to `409`, missing records
   (`P2025`) to `404`, broken relations (`P2003`, `P2016`, `P2017`) to `400`,
   and connection timeouts (`P1008`, `P1009`, `P1011`) to `408`.
2. `ValidationPipe({ whitelist: true })`: every body and query DTO is
   validated with `class-validator`, and properties without decorators are
   stripped.
3. `ClassSerializerInterceptor`: applies `class-transformer` rules to class
   instances in responses. No entity uses `@Exclude` today; controllers
   build their response objects field by field instead.
4. `enableCors()` with defaults: any origin.
5. Swagger with bearer auth.
6. A `BigInt.prototype.toJSON` shim, because the raw discover queries return
   `COUNT(*)` as `bigint`.

The API integration harness (`apps/api/test/helpers/app.ts`) repeats these
global pipes and filters; keep the two in sync.

## Modules

`AppModule` imports one module per resource. Each has a controller, a service
and, where needed, DTOs built from `@biosfera/types` factories.

| Module | Route prefix | Responsibility |
| ------ | ------------ | -------------- |
| `AuthModule` | `/auth` | Login, current user |
| `UsersModule` | `/users` | Registration, activation, password reset, profiles, profile pictures |
| `OrganisationsModule` | `/organisations` | Organisations, discovery, join requests |
| `MembersModule` | `/members` | Membership requests and role changes |
| `ExponatsModule` | `/exponats` | Exponats, discovery, approval, lookup by serial number |
| `CategorizationsModule` | `/categorizations` | Taxonomy records (from GBIF) that exponats point to |
| `AuthorshipInfoModule` | `/authorship-info` | Who found, identified and photographed something, and where |
| `PostsModule` | `/posts` | Posts about exponats, discovery, approval |
| `SocialPostsModule` | `/social-posts` | Organisation news, events, workshops, announcements |
| `WorksModule` | `/works` | Publications (papers, posters, presentations) |
| `LikesModule` | `/likes` | Toggle likes on posts |
| `FavouriteExponatsModule` | `/favourite-exponats` | Toggle and list favourite exponats |
| `FavouritesOrganisationsModule` | `/favourite-organisations` | Follow organisations |
| `FollowsModule` | `/follows` | Follow users |
| `SavedWorksModule` | `/saved-works` | Save works |
| `LiteratureModule` | `/literature` | Save GBIF literature references |
| `NotificationsModule` | `/notifications` | Creating notification records |
| `NotificationUsersModule` | `/notification-users` | Per-user inbox, read state, live SSE stream |
| `BlobModule` | `/blobs` | Uploads (images, PDFs, audio, 3D models, video) and local file serving |
| `EmailModule` | — | SMTP / SendGrid / log transport |
| `QuizzesModule`, `QuestionsModule` | `/quizzes`, `/questions` | Quizzes (not functional yet, see [Quizzes](/docs/features/quizzes/)) |
| `PrismaModule` | — | `PrismaService`, the database client |

`EventEmitterModule` is used as an in-process pub/sub for live notifications;
see [Notifications](/docs/features/notifications/).

:::note[One Prisma client per module]
`PrismaService` is listed as a provider in about 20 modules rather than
exported once, so each gets its own `PrismaClient` and connection pool. In
production this multiplies connections; the integration harness caps each
pool with `connection_limit=2`.
:::

The full route table is in [API endpoints](/docs/reference/api-endpoints/).

## Authentication

- `POST /auth/login` with `{ email, password }` checks the bcrypt hash of an
  **activated** user and returns a JWT signed with `JWT_SECRET`, valid for
  24 hours. The payload is `{ id, email, role }`, with `role` lower-cased to
  `user`, `admin` or `super`.
- `JwtAuthGuard` (passport-jwt) reads `Authorization: Bearer <token>`, checks
  the user still exists and puts `{ id, email, role }` on `req.user`.
- `OptionalJwtAuthGuard` tries `jwt` and falls back to `passport-anonymous`,
  so public endpoints can still tailor their answer to a logged-in user (for
  instance personalised discovery, or showing unapproved items to admins).
- `GET /auth/me` returns the token's user; `GET /auth/detailed` returns the
  extended profile the web app keeps in `UserContext`.

Permissions are checked inside controllers and services rather than with
role guards; see [Roles and permissions](/docs/reference/roles-and-permissions/).

## Query parameters

Three parameter decorators in `src/config` give list endpoints a common shape.

**Pagination** (`PaginationParams`): `?page=1&size=10`. Missing values default
to page 1, size 10. `size` above 100 is rejected with `400`.

**Sorting** (`SortingParams`): `?attribute=<field>&direction=asc|desc`. Each
endpoint passes the attributes it accepts; anything else is a `400`. The
Prisma `orderBy` objects are built in `@biosfera/types` (`*SortQueryBuilder`).

**Filtering**: most list endpoints take typed query DTOs instead (for
exponats: `name`, `alternateName`, taxonomy ranks such as `genus` or
`family`, `organisationId`, favourite-count bounds…). Text filters use
Postgres full-text search through Prisma's `fullTextSearch` preview feature:
words are OR-ed for names (`a | b`) and treated as a phrase for taxonomy
(`a <-> b`). A generic `FilteringParams` decorator (`?filter=field:rule:value`)
exists but is not used by any endpoint.

## Errors

Most failures are thrown as Nest HTTP exceptions (`BadRequestException`,
`UnauthorizedException`, `NotFoundException`) and serialised as
`{ statusCode, message, error }`. Raw discover queries wrap database errors
in a `500`.

Server-sent event routes are the exception to "check inside the handler":
Nest sends their headers before the handler runs, so rights checks for them
have to be guards (see `OwnStreamGuard` in `notification-users`).
