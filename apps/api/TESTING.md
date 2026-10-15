# Testing the API

| Layer       | Where                | What it uses                                                       | Command                 |
| ----------- | -------------------- | ------------------------------------------------------------------ | ----------------------- |
| Unit        | `src/**/*.spec.ts`   | Jest, a Proxy-based Prisma mock (`src/test-utils/prisma.mock.ts`)  | `yarn test`             |
| Integration | `test/*.int-spec.ts` | The real `AppModule` over HTTP (supertest) against a real Postgres | `yarn test:integration` |

## Unit tests

```bash
yarn test            # all unit tests
yarn test:cov        # with coverage
```

Services are tested against the Prisma mock (asserting the exact queries they
build and the notifications they send), controllers against mocked services
(asserting mapping and permission checks). Raw SQL and Prisma query validity
are only truly exercised by the integration tests.

## Integration tests

They need a **throw-away Postgres** that is separate from the dev stack
(other port, tmpfs storage):

```bash
yarn test:integration:db        # docker compose up postgres:15 on :55432 (biosfera_test)
yarn test:integration           # applies the migrations, runs the suites
yarn test:integration:db:down
```

Use another database with `TEST_DATABASE_URL=postgresql://…/something_test`.
The suite truncates every table between tests, so it **refuses to start unless
the database name ends in `_test`**.

Notes:

- Outbound email is captured in memory (`ctx.mails`); files go to a temporary
  `UPLOAD_DIR` (no S3).
- `NODE_OPTIONS=--experimental-vm-modules` is set by the script: Nest's
  `FileTypeValidator` loads `file-type` with a dynamic `import()`, which fails
  inside Jest's default CommonJS VM and would reject every upload.
- `test/helpers/app.ts` repeats the global pipes/filters of `src/main.ts`; keep
  them in sync.
- `PrismaService` is registered in ~20 modules (one `PrismaClient` and pool
  each), so the harness caps each pool with `connection_limit=2` and
  disconnects every instance on close.

## Known bugs are encoded as `it.failing`

Tests that describe the **intended** behaviour of something that is currently
broken use `it.failing(...)`. The suite stays green, but the moment a bug is
fixed the test starts "passing unexpectedly" and fails: remove `.failing` then.
(`grep -rn "it.failing" src test` lists all of them: 37 unit, 34 integration.)

Highlights (details are in the comment above each test):

**Authorisation**

- `OrganisationsController`: `update`, `remove`, `getRequests` call
  `hasAdminRights` without `await`, so any logged-in user can edit/delete any
  organisation and read its join requests (with emails).
- `PATCH /organisations/:id/approval` has no guard at all.
- `DELETE /exponats/:id`, `DELETE /social-posts/:org/:id`, all
  `categorizations` writes, all `/blobs` uploads and
  `GET /notification-users/subscribe/:userId` (SSE) are unauthenticated.
- `PostsController.toggleApproval`: authors can approve their own posts.
- `WorksService.checkRights` returns un-awaited promises, so every non-author
  passes (anyone can edit/delete anyone's work).
- Quizzes: any organisation admin can approve or delete another
  organisation's quiz (typo `:orgnisationId` in the delete route; approval is
  not tied to the quiz).
- `BlobService` path guard accepts `..`/`.` segments (traversal out of the
  upload directory).
- `GET /users`, favourites/followers lists publish user e-mail addresses.

**Features that cannot work today**

- `POST /posts/:exponatId` always 500s (`isAdmin` leaks into `prisma.post.create`).
- Creating/updating quizzes and listing/creating questions always fail
  validation (`@MinLength` on arrays, `@IsEnum` on Croatian display labels,
  update/query DTOs built from the _create_ DTOs); questions cannot be edited
  because the quiz id is passed where a question id is expected.
- `GET /quizzes` without `page`/`size` is a 500 (`skip: NaN`).
- Exponat filters `minFavoriteCount`/`maxFavoriteCount`/`class` build invalid
  Prisma queries (500); the post `organisationId` filter uses `exponatId`.
- `POST /users` rejects a missing `bio` although it is documented optional.
- `GET /works/:id` hides a pending work from its own author.
- Social-post announcements cannot be published by organisation OWNERs.

**Smaller issues**: approval notification text is inverted for organisations,
`kingom` typo in the categorization response, quiz list returns the
organisation image as its name, `FilteringParams` accepts rules `FilterRule`
does not know (unused), denied member operations answer HTTP 200 with an
error-shaped body (exceptions are returned, not thrown).
