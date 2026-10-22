---
title: API tokens
description: Personal access tokens for scripts, MCP servers and integrations, their scopes, expiry, limits and usage.
sidebar:
  order: 10
---

A personal access token (PAT) lets a script, a local MCP server or a
self-hosted integration call the API as its user, without the password and
without a 24-hour login token. A token acts **as its user**: it never has more
rights than the user has at the moment of the request, and it can have fewer.

PATs are tied to a person. They are not service credentials and do not replace
`INTERNAL_API_KEY` (see [AI and speech](/docs/features/ai-and-speech/)).

## Creating a token

On your own profile, the **Edit** tab has an **API tokens** section (only the
profile's owner sees it, not a super user editing someone else). **New token**
asks for:

- a **name** (1 to 60 characters), e.g. "MCP on my laptop";
- **access**: read only, or read and write (see [Scopes](#scopes));
- **expiry**: 7, 30, 90 (the default) or 365 days, a custom number of days
  from 1 to 365, or **never**. A token that never expires gets a prominent
  warning: it keeps working until it is revoked, even if it leaks.

The token is shown **once**, with a copy button. It looks like
`bsf_Jq3xY8a1…`: `bsf_` and 32 random bytes in base64url. Lose it and you
revoke it and create a new one. The list shows each token's name, its first
eight characters (`bsf_Jq3xY8a1…`), access, creation date, last use, expiry
or revocation, and on request the requests per day over the last 30 days.

A user can have at most **10** tokens that are neither revoked nor expired.

Over the API (with a login token, see [Session-only actions](#session-only-actions)):

```bash
curl -X POST "$API/auth/tokens" \
  -H "Authorization: Bearer $LOGIN_JWT" -H "Content-Type: application/json" \
  -d '{ "name": "MCP on my laptop", "scopes": ["READ"], "expiresInDays": 30 }'
```

Leave `expiresInDays` out for 90 days; send `null` for a token that never
expires.

## Using a token

Send it like a login token:

```bash
curl "$API/auth/me" -H "Authorization: Bearer bsf_…"
```

It works on every endpoint a login works on, with the same rights or fewer.
An MCP server or other tool running for you is configured with the API URL
and the token, and sends the token in that header. (A Biosfera MCP server is
a separate, later package.)

## Scopes

| Scope | Allows |
| ----- | ------ |
| `READ` | `GET` and `HEAD` requests; anything else answers `403 This token is read-only` |
| `WRITE` | Every method; stored together with `READ` |

A scope only narrows the user's rights: every role, membership and ownership
check still runs. The role is read from the user **at each request**, so a
promoted or demoted user's tokens follow at once.

## Session-only actions

Some actions need a real login even with a `WRITE` token, so a leaked token
cannot create more tokens, hide itself or lock its owner out. They answer
`403 This action needs a login, not an API token`:

- creating, listing and revoking tokens and reading their usage
  (`/auth/tokens…`);
- deleting your account (`DELETE /users`), and super users deleting other
  accounts (`DELETE /users/:id`).

There is no endpoint that changes a password or e-mail address while logged
in; the password reset works with the e-mailed link only.

## Revoking

**Revoke** next to a token, or **Revoke all tokens**, stops it at once: the
next request with it answers `401`. Revoked tokens stay in the list with their
usage history. Expired tokens and tokens of deleted or deactivated users stop
working the same way.

A **password reset does not revoke tokens**. Right after the reset the web
app logs the user in and, if they have active tokens, asks whether to revoke
them all ("Revoke all tokens" / "Keep them"). See
[Accounts](/docs/features/accounts/#password-reset).

## Rate limit and notifications

Each token may make **120 requests a minute**. Responses carry
`X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`
(seconds); over the limit the API answers `429` with `Retry-After`. Login
tokens and anonymous requests are not limited.

When a token makes its 96th (80%) and its 120th (100%) request in a minute,
its user gets a notification (in the app and, if enabled, by e-mail), each at
most **once a day** per token. Usage notifications replace keeping IP
addresses or user agents, which the API does not store.

The counts are kept in memory per API process. With several API instances
each has its own budget, so a token can make up to 120 requests a minute per
instance; a shared store (Redis) would fix that if it ever matters.

## How it works

- Only `sha256(token)` (hex) is stored, in `ApiToken.tokenHash`. A plain
  SHA-256 is enough: with 256 random bits there is nothing to brute-force, and
  a lookup stays one indexed query. The token never appears in logs.
- `ApiTokenStrategy` (`src/auth/api-token.strategy.ts`) is a passport strategy
  next to `jwt`. `JwtAuthGuard` is `AuthGuard(['jwt', 'api-token'])` and
  `OptionalJwtAuthGuard` adds `optional`. A bearer token without the `bsf_`
  prefix is left to the JWT strategy; a `bsf_` token that is unknown, revoked
  or expired is an error that ends the chain, so routes with optional login
  answer `401` instead of quietly serving an anonymous request.
- `req.user` is `{ id, email, role, tokenId, scopes }`; `tokenId` being set
  is how code tells a token from a login. `@SessionOnly()`
  (`src/auth/session-only.ts`) replaces `UseGuards(JwtAuthGuard)` on the
  session-only routes.
- Each request upserts `ApiTokenUsage(tokenId, day)` (UTC day) and sets
  `lastUsedAt`, alongside the request; a failure is only logged. Requests
  refused with `429` are not counted.
- Revoking sets `revokedAt`; rows are deleted only with their user.
