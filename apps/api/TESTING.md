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
`grep -rn "it.failing" src test` lists them.

There are none at the moment: the bugs this suite used to pin (authorisation
gaps, quizzes and posts that could not be created, broken filters, returned
instead of thrown exceptions, ...) were fixed on the `fix/known-issues`
branch. Add a new `it.failing` test whenever you find a bug you are not fixing
straight away. Known limitations that no test pins are listed in the docs
site (`apps/docs`, Reference → Known issues).
