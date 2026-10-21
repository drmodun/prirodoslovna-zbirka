# Personal access tokens (PATs)

Status: **specified, not implemented**. Written 2026-10-22 as a handoff; the
open questions at the end need an answer from the maintainer before or during
implementation.

## Goal

Let users call the API from scripts, MCP servers and self-hosted integrations
with a long-lived token they create, name, limit, see the use of, and revoke,
without handing over their password or a 24-hour login token.

A token acts **as its user**: it never has more rights than the user has at
the moment of the request, and it can be limited to fewer.

### Not in scope

- OAuth 2.1 / "log in with Biosfera" for third-party apps. That is the next
  step if other people's apps need to act for users (the MCP spec prefers
  OAuth for remote servers); PATs cover local MCP servers, scripts and
  self-hosted setups now. Design the token tables so OAuth access tokens could
  live next to them later, but build nothing for it.
- Service credentials. PATs are tied to a person. They are **not** a
  replacement for `INTERNAL_API_KEY` (the web server storing text-to-speech
  recordings for anonymous visitors); do not give the web server a PAT.
- The MCP server itself (a separate package later, using a PAT).

## Current state (what this has to fit into)

- Login: `POST /auth/login` returns a JWT signed with `JWT_SECRET`, valid 24 h
  (`apps/api/src/auth/auth.module.ts`, `auth.service.ts`). The payload holds
  `id`, `email` and `role` as `user` / `admin` / `super` (mapped from
  `Role` in `auth.service.ts`).
- `JwtStrategy` (`auth/jwt.strategy.ts`) checks the user still exists but uses
  the role **from the token**. Handlers read `req.user` (`{ id, email, role }`)
  and check rights with `isSuperUser` / `isModerator` (`auth/roles.ts`) and
  membership checks in the services.
- Guards: `JwtAuthGuard` = `AuthGuard('jwt')`, `OptionalJwtAuthGuard` =
  `AuthGuard(['jwt', 'optional'])`. They are used on almost every protected
  route, so changing these two classes changes every endpoint.
- Hashed one-time tokens already exist: the password-reset token is random,
  stored as a SHA-256 hash (`users.service.ts`, `passwordResetToken`). Reuse
  that pattern.
- Error messages are English in code and translated by
  `src/i18n/error-messages.ts`; every new user-visible message needs a
  Croatian line there.
- There is **no rate limiting** anywhere in the API today.
- Web: the token is kept in `localStorage` as `access_token` and sent by the
  axios instance in `apps/web/src/app/api/shared.ts`. UI strings are
  translated with next-intl (EN and HR).

## Design

### Token format

`bsf_` + 32 random bytes, base64url (43 characters), e.g.
`bsf_Jq3…`. The prefix makes tokens recognisable in logs and lets secret
scanners (GitHub custom patterns) find leaked ones. The full token is shown
**once**, at creation.

Store only `sha256(token)` (hex). A plain SHA-256 is right here, not bcrypt:
the token has 256 bits of entropy, so there is nothing to brute-force, and the
lookup must be a single indexed query per request.

Keep the first 8 characters after `bsf_` as `prefix` so the UI can show
`bsf_Jq3xY8a1…` to tell tokens apart.

### Data model

```prisma
enum ApiTokenScope {
  READ   // GET and HEAD requests
  WRITE  // everything else; implies READ
}

model ApiToken {
  id         String          @id @default(uuid())
  userId     String
  user       User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String          // "MCP on my laptop"
  tokenHash  String          @unique
  prefix     String
  scopes     ApiTokenScope[]
  createdAt  DateTime        @default(now())
  expiresAt  DateTime?       // see open questions
  lastUsedAt DateTime?
  revokedAt  DateTime?
  usage      ApiTokenUsage[]

  @@index([userId])
}

// One row per token per day, for the usage view.
model ApiTokenUsage {
  tokenId  String
  token    ApiToken @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  day      DateTime @db.Date
  requests Int      @default(0)

  @@id([tokenId, day])
}
```

Revoking sets `revokedAt` instead of deleting, so the list can show revoked
tokens and their usage history. A user has at most **10** tokens that are
neither revoked nor expired.

### Authentication

Add a passport strategy `api-token` (`passport-http-bearer`, or
`passport-custom` to avoid a dependency) in `src/auth/`:

1. Take the bearer token. If it does not start with `bsf_`, fail so other
   strategies can try.
2. Look up `tokenHash = sha256(token)`, with its user.
3. Refuse (401) if not found, revoked, expired, or the user no longer exists
   or is not activated.
4. Return `{ id, email, role, tokenId, scopes }`. Map `role` from the
   **current** `User.role` with the same mapping as login. Extract that
   mapping from `auth.service.ts` into a shared helper rather than copying it.
5. Record use (below).

Then:

- `JwtAuthGuard` becomes `AuthGuard(['jwt', 'api-token'])`.
- `OptionalJwtAuthGuard` becomes `AuthGuard(['jwt', 'api-token', 'optional'])`.
  A **bad** `bsf_` token on an optional route must be a 401, not a silent
  anonymous request: users would not notice that their token stopped working.
  Check that the multi-strategy order gives this behaviour, and test it.

Handlers keep reading `req.user` as before; only `tokenId` and `scopes` are
new, and `tokenId` being set is how code tells a PAT request from a login.

### Scopes

Enforced centrally when the strategy authenticates, not in handlers:

- `READ` only: `GET` / `HEAD` pass; any other method is
  `403 This token is read-only`.
- `WRITE`: every method.

A scope only ever narrows the user's rights. All existing rights checks
(roles, memberships, ownership) still run.

### Session-only endpoints

Some actions must need a real login even with a `WRITE` token, so that a
leaked token cannot lock its owner out or create more tokens:

- creating, listing and revoking tokens (`/auth/tokens…`);
- changing password or e-mail, deleting the account;
- anything else the implementer finds in `users.controller.ts` and
  `auth.controller.ts` that changes how someone logs in.

Add a `@SessionOnly()` decorator with a guard that refuses requests where
`req.user.tokenId` is set: `403 This action needs a login, not an API token`.

### Recording use and rate limits

- Per request: upsert `ApiTokenUsage(tokenId, today)` with
  `requests = requests + 1`, and set `lastUsedAt = now()`. Do it without
  delaying the response (fire and forget, errors logged). That is one or two
  small writes per request, which is fine at this project's scale. If it
  ever is not, batch the counts in memory and flush them every few seconds.
- Do **not** store IP addresses or user agents by default (personal data
  under GDPR). See open questions.
- Rate limit per token: add `@nestjs/throttler` with a tracker keyed on
  `tokenId` for PAT requests, e.g. 120 requests a minute, answering `429`.
  The default throttler storage is per process; with several API instances
  each has its own budget. That is acceptable at first; note it in the docs.
  Rate limiting anonymous and login traffic is a separate task.

### Endpoints

All `@SessionOnly()`, for the logged-in user's own tokens:

| Method | Route | Body / result |
| --- | --- | --- |
| `POST` | `/auth/tokens` | `{ name, scopes, expiresInDays }` → `{ id, name, prefix, scopes, createdAt, expiresAt, token }`. `token` appears only here. |
| `GET` | `/auth/tokens` | Own tokens without hash or token: `id, name, prefix, scopes, createdAt, expiresAt, lastUsedAt, revokedAt` |
| `DELETE` | `/auth/tokens/:id` | Revokes (sets `revokedAt`); `404` for someone else's token |
| `GET` | `/auth/tokens/:id/usage` | `[{ day, requests }]` for the last 30 days |

Validate `name` (1–60 chars), `scopes` (non-empty subset), `expiresInDays`
(see open questions). Return `400` at the 10-token limit.

Document the bearer scheme for PATs in Swagger next to the JWT one.

### Web app

A **"API tokens"** section on the user's own profile, next to the edit
form (`EditUserForm`, rendered in `components/UserPageBody`), visible only to
the profile's owner:

- list: name, `bsf_<prefix>…`, scopes, created, last used, expires, revoked
  or a **Revoke** button (with confirmation);
- **New token** modal: name, read-only / read and write, expiry;
- after creating: show the token once with a copy button and a clear warning
  that it will not be shown again;
- optional: a small usage chart per token (30 days).

All strings in EN and HR. Use the existing mutation hook pattern
(`api/use*.ts`, toast on success and error).

### Docs

- New page `features/api-tokens.md`: creating a token, scopes,
  session-only actions, limits, using it with `curl` and an MCP client.
- Update `architecture/api.md` (authentication), `reference/api-endpoints.md`,
  `reference/roles-and-permissions.md`.

## Tests

API unit:

- strategy: valid, unknown, revoked, expired, user deleted, user not
  activated, a non-`bsf_` token falls through to other strategies;
- the role comes from the current `User.role`, not from creation time;
- scope check by method; `@SessionOnly()` guard.

API integration (`test/*.int-spec.ts`):

- create → use on a protected route → revoke → `401`;
- token shown once; list never contains hash or token;
- read-only token: `GET` works, `POST` is `403`;
- a PAT cannot create, list or revoke tokens, or change the password;
- a bad `bsf_` token on an optional-auth route is `401`;
- usage rows and `lastUsedAt` are written;
- rights are the user's: a PAT of a non-member cannot edit an organisation;
- 10-token limit; rate limit gives `429`.

Web: the settings section (list, create modal showing the token once,
revoke) with Testing Library, following `apps/web/TESTING.md`.

## Acceptance criteria

- A user can create a named token with read or read-and-write scope, sees it
  once, and can use it as `Authorization: Bearer bsf_…` on every endpoint a
  login token works on, with the same rights or fewer.
- Revoked, expired and deleted-user tokens stop working immediately.
- Tokens cannot manage tokens or change login details.
- The user sees when each token was last used and how many requests it made
  per day.
- Only the SHA-256 hash is stored; the token never appears in logs.
- Unit and integration suites green; docs updated.

## Open questions for the maintainer

1. **Expiry:** require one (default 90 days, at most 1 year), or allow
   "never"? Recommendation: required, at most 1 year.
2. **IP / user agent of last use:** useful for spotting a leak, but personal
   data. Recommendation: leave out at first.
3. **Password reset / change:** revoke all tokens? GitHub keeps them.
   Recommendation: keep them, and add "revoke all" to the settings section.
4. **Moderation:** may `SUPER` list or revoke other users' tokens (for
   abuse)? Recommendation: revoke only, through an admin endpoint, later.
5. **Rate limit numbers:** 120 requests a minute per token as a start?
