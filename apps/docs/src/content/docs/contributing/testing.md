---
title: Testing
description: Unit, integration and end-to-end suites, how to run them, and their conventions.
sidebar:
  order: 1
---

| Layer | Where | Uses | Command |
| ----- | ----- | ---- | ------- |
| API unit | `apps/api/src/**/*.spec.ts` | Jest, a Proxy-based Prisma mock | `yarn workspace api test` |
| API integration | `apps/api/test/*.int-spec.ts` | The real `AppModule` over HTTP (supertest) on a real Postgres | `yarn workspace api test:integration` |
| Web unit | `apps/web/src/**/*.test.ts(x)` | Jest, React Testing Library, jsdom | `yarn workspace web test` |
| End-to-end | `apps/e2e/tests/*.spec.ts` | Playwright against the built API and web app | `yarn workspace e2e test` |

Each app has a `TESTING.md` with the details; this page is the overview.

Both apps' unit tests need the compiled shared types and the generated
Prisma client, which a normal `yarn install` + `yarn build` gives you. CI does
it explicitly:

```sh
yarn workspace @biosfera/types build
(cd apps/api && npx prisma generate)
```

## API unit tests

Services are tested against `src/test-utils/prisma.mock.ts`, asserting the
exact Prisma queries they build and the notifications they send. Controllers
are tested against mocked services, asserting response mapping and
permission checks. Raw SQL validity is only exercised by the integration
tests.

## API integration tests

They need a throw-away Postgres separate from the dev stack:

```sh
yarn workspace api test:integration:db        # postgres:15 on :55432, database biosfera_test, tmpfs
yarn workspace api test:integration           # applies migrations, runs the suites
yarn workspace api test:integration:db:down
```

- Use another database with `TEST_DATABASE_URL=…/something_test`. Every table
  is truncated between tests, so the suite **refuses to run unless the
  database name ends in `_test`**.
- Outgoing mail is captured in memory (`ctx.mails`); files go to a temporary
  `UPLOAD_DIR`.
- `NODE_OPTIONS=--experimental-vm-modules` is set by the script, because
  Nest's `FileTypeValidator` loads `file-type` with a dynamic `import()`.
- `test/helpers/app.ts` repeats the global pipes and filters of `main.ts`;
  keep them in sync.

## Web unit tests

- `jest.config.js` uses `next/jest` with the `@/` and `src/` aliases;
  `query-string` (ESM-only) is transformed.
- `jest.setup.ts` loads `jest-dom`, mocks `react-hot-toast` and
  `next/navigation`, creates the `#portal` element modals render into, and
  resets mocks between tests.
- Hooks are tested by mocking the axios client from `@/api/shared` and
  asserting the URL and method they call, written against the routes the API
  really exposes.
- `test-utils/userContext` is a controllable stand-in for `useUser()`;
  `test-utils/stubs` replaces child components. `jest.mock` factories are
  hoisted, so `require` helpers inside the factory.
- Modules with module-level state that reads `process.env` (`getUrlServer`,
  `AI`, `useRecordVoice`) are loaded per test with `jest.resetModules()`.

## End-to-end tests

```sh
yarn workspace e2e db            # throw-away Postgres on :55434, database biosfera_e2e
yarn workspace e2e build:stack   # builds the API and web app for the e2e ports
yarn workspace e2e test          # starts both servers, runs the tests
yarn workspace e2e db:down
```

Playwright starts the API on `:5610` (applying migrations) and the web app
on `:3110` and never reuses a running server, so the dev stack can't be hit
by accident. The database name must end in `_e2e`. The web build bakes in the
API address, so re-run `build:stack` after changing `E2E_API_PORT` /
`E2E_WEB_PORT`.

Test data is created directly in the database (`support/db.ts` factories);
the flow under test is driven through the UI. `loginAs(page, user)` logs in
through the API and stores the token the way the sign-in form does.

If Chromium can't start locally (`libnspr4.so` missing), run the browser in
Docker and point the tests at it:

```sh
docker run -d --rm --network host --ipc=host mcr.microsoft.com/playwright:v1.64.0-noble \
  npx -y playwright@1.64.0 run-server --port 3200 --host 127.0.0.1
PW_WS_ENDPOINT=ws://127.0.0.1:3200/ yarn workspace e2e test
```

Not covered end to end: anything needing external services (GBIF species
search, AI, speech, S3), the 3D viewer, QR and share widgets, quizzes and
the works forms.

## Known bugs as expected failures

A test that describes the **intended** behaviour of something broken is
written as `it.failing(...)` (Jest) or `test.fail(...)` (Playwright). The
suite stays green; once the bug is fixed the test reports "passed
unexpectedly" and fails, and you remove the marker. This keeps the list of
known bugs executable. There are none at the moment; what is still open but
not pinned is on [Known issues](/docs/reference/known-issues/).

## The docs site

The docs have no test suite of their own; `yarn workspace docs build` fails
on broken frontmatter or configuration, and CI runs it as part of
`yarn build`.
