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

`src/main.ts` calls `configureApp` (`src/app.setup.ts`) and then sets up the
rest. In order:

1. `LocalisedExceptionFilter`: answers HTTP exceptions in Croatian when the
   request's `Accept-Language` starts with `hr` (the web app sends its
   interface language with every request), see [Errors](#errors).
2. `PrismaClientExceptionFilter`: maps known Prisma errors to HTTP
   statuses: unique-constraint violations (`P2002`) to `409`, missing records
   (`P2025`) to `404`, broken relations (`P2003`, `P2016`, `P2017`) to `400`,
   and connection timeouts (`P1008`, `P1009`, `P1011`) to `408`. It answers
   with a fixed message (`Already exists: email`, `Not Found`, …) in the
   request's language; Prisma's own message names tables and code locations,
   so it is only logged.
3. `ValidationPipe({ whitelist: true })`: every body and query DTO is
   validated with `class-validator`, and properties without decorators are
   stripped.
4. `ClassSerializerInterceptor`: applies `class-transformer` rules to class
   instances in responses. No entity uses `@Exclude` today; controllers
   build their response objects field by field instead.
5. `enableCors()` with defaults: any origin.
6. Swagger with bearer auth.
7. A `BigInt.prototype.toJSON` shim, because the raw discover queries return
   `COUNT(*)` as `bigint`.

The API integration harness (`apps/api/test/helpers/app.ts`) uses the same
`configureApp`, so the tests run with the same filters and pipes.

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
| `QuizzesModule`, `QuestionsModule` | `/quizzes`, `/questions` | Quizzes and their questions, see [Quizzes](/docs/features/quizzes/) |
| `AttemptsModule` | `/attempts` | Taking quizzes: attempts, server-side scoring, results |
| `NotificationBusModule` | — | Global; fans live notifications out to every API instance over Postgres `LISTEN` / `NOTIFY` |
| `PrismaModule` | — | Global; the one shared `PrismaService`, the database client |

Live notifications travel between instances over Postgres `LISTEN` /
`NOTIFY` and are handed to the SSE streams through the in-process
`EventEmitterModule`; see [Notifications](/docs/features/notifications/).

`PrismaModule` and `EmailModule` are global, so every module shares one
`PrismaClient` (one connection pool) and one `EmailService`. Modules do not
list them as providers.
Services shared between modules (`MembersService`, `NotificationsService`,
`NotificationUsersService`, `OrganisationsService`, `FollowsService`,
`ExponatsService`, `BlobService`) are exported by their own module and
imported by the modules that need them, never listed as providers again, so
each exists once per process.

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
(`a <-> b`). A generic `FilteringParams` decorator (`?filter=field:rule:value`, rules as
in `FilterRule`, `isnull` without a value) exists but is not used by any
endpoint.

## Errors

Most failures are thrown as Nest HTTP exceptions (`BadRequestException`,
`UnauthorizedException`, `NotFoundException`) and serialised as
`{ statusCode, message, error }`. Raw discover queries wrap database errors
in a `500`.

Messages are written in English in the code. For requests with
`Accept-Language: hr…`, `LocalisedExceptionFilter` replaces `message` (each
entry, for validation errors) and `error` with the Croatian version from
`src/i18n/error-messages.ts`: an exact-match table plus patterns for messages
that carry a value and for `class-validator`'s defaults. Messages it does not
know are sent unchanged, so add a Croatian line there when you add a new
message a user can see. `PrismaClientExceptionFilter` translates its fixed
messages with the same table.

Server-sent event routes are the exception to "check inside the handler":
Nest sends their headers before the handler runs, so rights checks for them
have to be guards (see `OwnStreamGuard` in `notification-users`).
