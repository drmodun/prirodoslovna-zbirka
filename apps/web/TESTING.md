# Testing the web app

```bash
yarn test            # all tests (Jest + React Testing Library, jsdom)
yarn test:watch
yarn test --coverage
```

Tests live next to the code they cover (`*.test.ts(x)`) or, for components,
in `src/components/__tests__/`. Shared helpers are in `src/test-utils/`.

## Setup

- `jest.config.js` uses `next/jest` (SWC transform, CSS/SCSS-module and image
  stubs) plus the `@/` and `src/` import aliases. `query-string` is ESM-only
  and is added to the transformed packages.
- `jest.setup.ts` loads `jest-dom`, mocks `react-hot-toast` (calls are
  recorded: `toast.error`, `toast.success`, ...) and `next/navigation`
  (`test-utils/router`), creates the `#portal` element modals render into,
  silences console noise and resets mocks between tests.

## Conventions

- **Network**: the axios client (`@/api/shared`) is mocked in hook tests; server
  fetchers are tested by mocking `apiFetch`/`fetch`. Tests assert the _URL and
  method each hook calls_, written against the routes the API really exposes.
- **User state**: `test-utils/userContext` is a controllable stand-in for
  `useUser()`:

  ```ts
  jest.mock("@/utility/context/UserContext", () => ({
    __esModule: true,
    default: () => require("test-utils/userContext").mockUserContext,
  }));
  setUserContext({ memberships: [{ id: "o1", role: "ADMIN" }] });
  ```

- **Stubs**: `test-utils/stubs` has `stub`, `entityStub` and `marker` for
  replacing child components. `jest.mock` factories are hoisted, so they must
  `require("test-utils/stubs")` inside the factory.
- **`it.each` pitfall**: a row with fewer values than the callback has
  parameters makes Jest wait for a `done` callback and time out.
- Modules that read `process.env` or keep module-level state
  (`getUrlServer`, `AI`, `useRecordVoice`) are loaded per test with
  `jest.resetModules()`; remember to reload React / Testing Library with them
  (see `useRecordVoice.test.tsx`).

## Known bugs are encoded as `it.failing`

Tests that describe the intended behaviour of something that is currently
broken use `it.failing`. The suite stays green, and once a bug is fixed the
test fails with "passes unexpectedly": remove `.failing` then.
`grep -rn "it.failing" src` lists them.

There are none at the moment; the ones this suite used to pin (wrong quiz
URLs, edit forms losing data, crashing pages, permission defaults, ...) were
fixed on the `fix/known-issues` branch.

## Not covered (yet)

Mostly presentational or browser-API heavy: `AudioButton`, `QrCodeButton`,
`ShareButton`, `DocumentReader`, `SpeechToText` (microphone UI), the 3D model
viewer, `OrganisationBody`/`OrganisationHomepage`/`SingleExponatView` and a few
remaining pages. Anything that needs a real browser or the real API belongs in
the end-to-end layer.
