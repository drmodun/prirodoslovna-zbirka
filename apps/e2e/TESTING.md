# End-to-end tests

Playwright drives a real browser against the real stack: the built API, the
built Next.js app and a Postgres database. Nothing is mocked except outbound
e-mail (there is no SMTP server, so the API only logs it) and the GBIF lookups,
which the flows avoid by using minerals (no taxonomy search).

```bash
yarn workspace e2e db            # throw-away Postgres on :55434 (biosfera_e2e)
yarn workspace e2e build:stack   # builds API + web for the e2e ports
yarn workspace e2e test          # starts both servers, runs the tests
yarn workspace e2e db:down
```

Playwright starts the API (`:5610`, applying the migrations first) and the web
app (`:3110`) itself and **never reuses a running server**, so the dev stack
(`:3000` / `:5500`) cannot be hit by accident. The suite truncates tables
between tests and refuses to start unless the database name ends in `_e2e`.
Use `E2E_DATABASE_URL` / `E2E_API_PORT` / `E2E_WEB_PORT` to change them. The web
build bakes the API address in, so re-run `build:stack` after changing ports.

## Layout

- `support/db.ts`: Prisma client for the e2e database plus factories
  (`createUser`, `createOrganisation`, `createExponat`, `createPost`, ...).
  Test data is seeded directly in the database; the flow *under test* is
  driven through the UI.
- `support/fixtures.ts`: `test` with an automatic clean database, and
  `loginAs(page, user)`, which logs in through the API and stores the JWT where
  the app expects it (the way a sign-in does), once per tab.
- `tests/`: `auth`, `discovery`, `organisations`, `exponats`, `engagement`.

## Browser on a machine without Chromium's system libraries

CI installs the browser with `playwright install --with-deps`. Locally, if
Chromium cannot start (`libnspr4.so` missing), run the browser in Docker and
point the tests at it:

```bash
docker run -d --rm --network host --ipc=host mcr.microsoft.com/playwright:v1.64.0-noble \
  npx -y playwright@1.64.0 run-server --port 3200 --host 127.0.0.1
PW_WS_ENDPOINT=ws://127.0.0.1:3200/ yarn workspace e2e test
```

## Known bugs are encoded as `test.fail`

A test that describes the intended behaviour of something broken is marked
`test.fail(...)`: the suite stays green, and once the bug is fixed the test
"passes unexpectedly" and fails: remove `.fail` then. There are none at the
moment.

## Not covered

Anything that needs external services (GBIF species search, OpenAI, speech
synthesis, S3), the 3D model viewer and QR/share widgets, quizzes and the works
(publications) forms.
