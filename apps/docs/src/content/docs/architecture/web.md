---
title: Web app
description: The Next.js app router frontend, its routes, data fetching and client state.
sidebar:
  order: 3
---

The frontend (`apps/web`) is a Next.js 14 app using the **app router**, React
18, MUI / Joy UI components and SCSS modules. The UI is in English (the
default) and Croatian, see [Translations](#translations).

## Layout of `src/`

```text
src/
├── app/                  Routes (app router), plus:
│   ├── api/              Everything that talks to a server (see below)
│   ├── views/            Page-sized components (DiscoverPageView, SearchPageView, …)
│   ├── utility/
│   │   ├── context/      UserContext, NotificationContext, DiscoverContext, …
│   │   ├── hooks/        useRecordVoice, useOnScrollToBottom, useIsInView, …
│   │   ├── static/       Small pure helpers (dates, county names, profile picture URLs)
│   │   └── wrappers/     Providers and permission gates
│   └── shared/           Frontend-only enums and interfaces
├── components/           ~75 reusable components, one folder each
├── i18n/                 Locales, the locale cookie and next-intl request config
├── assets/, styles/
└── test-utils/           Jest helpers
```

Import aliases: `@/…` points to `src/app/…`, `components/…` to `src/components`.

## Routes

| Route | Page |
| ----- | ---- |
| `/` | Landing page |
| `/discover` | Ranked feed of exponats, posts, organisations and works |
| `/search` | Search with tabs for exponats, posts, organisations, users, works and GBIF literature |
| `/login`, `/register` | Sign in, sign up |
| `/activateUser/[activationCode]` | Account activation from the email link |
| `/resetPassword/[token]` | New password from the email link |
| `/user/[userId]` | Profile: posts, favourites, memberships, saved works |
| `/follows/[userId]` | Followers / following |
| `/createOrganisation` | New organisation form |
| `/organisation/[organisationId]` | Organisation home, exponats, members, social posts, works |
| `/organisation/[id]/createExponat`, `createSocialPost`, `createWork`, `createQuiz` | Creation forms |
| `/exponat/[exponatId]` | Exponat page; `edit`, `createPost`, `admin` below it |
| `/post/[postId]` | Post page; `edit`, `admin` below it |
| `/work/[workId]` | Work page; `admin` below it |

### The `/admin` variants

Unknown users and organisations call Next's `notFound()`, so they answer
`404` with the not-found page.

Public pages render on the server **without** the visitor's token, so the
API hides anything unapproved. When the server fetch comes back empty, the
exponat, post and work pages redirect to their `/admin` variant, which fetches
the same entity **in the browser** with the token. Members who are allowed to
see pending content therefore land on the review page; everybody else sees
"not found".

## Talking to servers: `src/app/api`

Three kinds of module live here:

- **Server fetchers** (`serverExponat.ts`, `serverPosts.ts`, …) run in server
  components. They call `apiFetch(segments, { query })` from `getUrlServer.ts`,
  which builds the URL from configuration and encodes every path segment.
  Next's fetch cache and `revalidate` apply.
- **Client hooks** (`useCreateExponat.ts`, `useToggleLike.ts`, …) wrap the
  axios instance from `shared.ts` in react-query `useQuery` / `useMutation`.
  The axios instance adds `Authorization: Bearer <access_token>` from
  `localStorage`, unwraps `response.data`, and turns errors into the API's
  `message` string (toasting on `401`). Mutations typically show a
  `react-hot-toast` loading toast and replace it with success or error.
- **Server actions** (`"use server"`): `speechToText.ts` (voice input),
  `serverMap.ts` (GBIF occurrence maps), `serverLiterature.ts` (GBIF
  literature). Every export of such a file is a public endpoint, callable by
  anyone with any arguments, so only put functions there that the browser
  needs and that are safe to expose.
- **Server-only modules** (`import "server-only"`): `AI.ts` (completions,
  transcription, text to speech), called from server components. Keys for
  third-party services never reach the browser, and nobody outside can make
  the server spend them.

A few hooks call third-party APIs straight from the browser, e.g.
`useGetSpecies` (GBIF species suggest) while filling in the exponat form.

## Client state

Providers are stacked in `app/layout.tsx`:

```text
DiscoverWrapper → SideMenuWrapper → NotificationsProvider → Header, BodyWrapper → CreateWrapper → page
```

- **`UserContext`** (`useUser()`) loads the current user with `useGetMe`
  (`GET /auth/detailed`) when a token is present, together with followers,
  following, followed organisations, saved works and saved literature. It
  exposes those lists plus `update…` functions that toggle an item in or out,
  so like / favourite / follow buttons update instantly. `logout` clears the
  token.
- **`NotificationContext`** loads `GET /notification-users` and subscribes to
  `/notification-users/subscribe/:userId` with `fetch-event-source` (which,
  unlike `EventSource`, can send the token) for live updates; see
  [Notifications](/docs/features/notifications/).
- **`DiscoverContext`** keeps the page number of each infinite-scrolling
  discover list.
- **`SideMenuContext`**, **`CreateButtonContext`**: UI state for the side menu
  and the floating "create" button.
- `QueryClientWrapper` (used by `UserWrapper`) provides one react-query client with
  `refetchOnWindowFocus` and `refetchOnMount` turned off.

### Permission gates

`utility/wrappers` holds components that render their children only for the
right people, using `UserContext`:

- `AdminCheckingWrapper id={organisationId}`: platform moderators (`SUPER`,
  `ADMIN`), or organisation `ADMIN` / `OWNER` (the exponat edit page).
- `RightCheckingWrapper author={userId}`: platform moderators, or the author
  themselves (edit and delete buttons).
- `useCardPermissions()` on cards: `canModerate(organisationId)` for content
  (exponats, posts, works; includes platform moderators) and
  `isOrganisationAdmin(organisationId)` for membership cards (organisation
  admins and `SUPER` only).

`isSuperRole` / `isModeratorRole` in `utility/static/roles.ts` read the
platform role.

`UserWrapper` is not a gate: it provides the react-query client and the
`UserProvider` to the client parts of a page.

These only hide UI. The API makes the real decision; see
[Roles and permissions](/docs/reference/roles-and-permissions/).

## Logging in

`useLogin` posts to `/auth/login`, stores `access_token` and `loggedTime` in
`localStorage`, then does a full navigation to `/discover` so every provider
starts again with the token. The token lives for 24 hours.

## Images and files

`next.config.js` decides at build time where uploaded files are read from
(`NEXT_PUBLIC_FILES_URL`), mirroring the API's `BlobService` logic, and adds
that host to `images.remotePatterns`. When the files address is plain HTTP
(local or in-network) or a path, the Next image optimiser is turned off,
because the web server cannot be assumed to reach an address meant for the
browser. The Docker image is built with the paths `/api` and `/files`, so it
works on any domain behind the stack's Caddy; server-side calls then go to
`API_INTERNAL_URL`. See
[File storage](/docs/architecture/file-storage/).

The Docker image is built with `output: "standalone"` (`NEXT_OUTPUT`); plain
`next start` is used otherwise.

## Translations

The UI text lives in `apps/web/messages/en.json` and `messages/hr.json`, read
through [next-intl](https://next-intl.dev) (v3) without locale routing: URLs
carry no `/en` or `/hr` prefix.

- **Locale**: the `NEXT_LOCALE` cookie, `en` when it is missing or unknown.
  `src/i18n/request.ts` reads it on every server render; the root layout puts
  the messages in a `NextIntlClientProvider` and sets `<html lang>`.
- **Switching**: `LanguageToggle` (on the landing page, in the side menu, and
  in the "Edit" tab of the user's own profile) uses `useChangeLocale`, which
  writes the cookie and calls `router.refresh()`. For a logged in user it
  also saves the choice with `PATCH /users/language`.
- **Saved preference**: `/auth/detailed` returns the user's `language`, and
  `LocaleSync` (in the layout) switches the cookie to it after login, so the
  choice follows the user to other browsers. New accounts get the language
  they registered in. Account mails (activation, password reset) are written
  in that language too.
- **Using it**: `useTranslations("Namespace")` in client and synchronous
  server components, `await getTranslations("Namespace")` in async server
  components and server actions. Form schemas that need messages are built
  inside the component, or by a factory that takes `t`
  (`createExponatSchema(t)`).
- **Enums** are stored and sent by key (`JOURNAL`, `SPLITSKO_DALMATINSKA`);
  their labels are the `Enums.*`, `Counties`, `ExponatKinds` and
  `MemberRoles` messages (`useCountyName()` for counties). Tab ids in views
  are still the Croatian names, `components/Tabs/useTabLabel.ts` maps them to
  the `Tabs` messages.
- **AI**: descriptions and summaries are asked for in the reader's language,
  and the Wikipedia fallback, voice input and read-aloud follow it too.

To add text, add the same key to both files; `src/i18n/messages.test.ts`
fails when the two files have different keys or ICU arguments. Jest renders
components in Croatian (the messages from `hr.json`) through a `next-intl`
mock in `jest.setup.ts`; `setTestLocale("en")` from `test-utils/intl`
switches a test to English.
