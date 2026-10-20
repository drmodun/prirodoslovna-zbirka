---
title: Web app
description: The Next.js app router frontend, its routes, data fetching and client state.
sidebar:
  order: 3
---

The frontend (`apps/web`) is a Next.js 14 app using the **app router**, React
18, MUI / Joy UI components and SCSS modules. The UI text is Croatian.

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
| `/resetPassword/[activationCode]` | New password from the email link |
| `/user/[userId]` | Profile: posts, favourites, memberships, saved works |
| `/follows/[userId]` | Followers / following |
| `/createOrganisation` | New organisation form |
| `/organisation/[organisationId]` | Organisation home, exponats, members, social posts, works |
| `/organisation/[id]/createExponat`, `createSocialPost`, `createWork`, `createQuiz` | Creation forms |
| `/exponat/[exponatId]` | Exponat page; `edit`, `createPost`, `admin` below it |
| `/post/[postId]` | Post page; `edit`, `admin` below it |
| `/work/[workId]` | Work page; `admin` below it |

### The `/admin` variants

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
- **Server actions** (`"use server"`): `AI.ts` (completions, transcription,
  text to speech), `serverMap.ts` (GBIF occurrence maps),
  `serverLiterature.ts` (GBIF literature). Keys for third-party services
  therefore never reach the browser.

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
- **`NotificationContext`** loads `GET /notification-users` and opens an
  `EventSource` on `/notification-users/subscribe/:userId` for live updates;
  see [Notifications](/docs/features/notifications/).
- **`DiscoverContext`** keeps the page number of each infinite-scrolling
  discover list.
- **`SideMenuContext`**, **`CreateButtonContext`**: UI state for the side menu
  and the floating "create" button.
- `QueryClientWrapper` (used by `UserWrapper`) provides one react-query client with
  `refetchOnWindowFocus` and `refetchOnMount` turned off.

### Permission gates

`utility/wrappers` holds components that render their children only for the
right people, using `UserContext`:

- `AdminCheckingWrapper id={organisationId}`: super users, or organisation
  `ADMIN` / `OWNER`.
- `RightCheckingWrapper author={userId}`: super users, or the author
  themselves (edit and delete buttons).

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
(local or in-network), the Next image optimiser is turned off, because the
web server cannot be assumed to reach an address meant for the browser. See
[File storage](/docs/architecture/file-storage/).

The Docker image is built with `output: "standalone"` (`NEXT_OUTPUT`); plain
`next start` is used otherwise.
