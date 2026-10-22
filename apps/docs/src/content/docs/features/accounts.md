---
title: Accounts and sign-in
description: Registration, email activation, login, password reset and profiles.
sidebar:
  order: 1
---

## Registration and activation

1. `/register` posts the form to `POST /users`. The password is hashed with
   bcrypt (10 rounds); `location` is a Croatian county (`County` enum); `bio`
   is optional and defaults to "Homo sapiens u biosferi".
2. The API emails an activation link,
   `${WEB_URL}/activateUser/<activationCode>`, and returns the new user's id.
   The form also sends the interface language (`EN` or `HR`); it is stored
   as the user's `language` and the activation and password reset mails are
   written in it.
3. Opening the link calls `POST /users/verify/:activationCode`, which sets
   `isActivated = true`.
4. Only activated users can log in.

:::tip[No mail server?]
Without `SMTP_URL` or `SENDGRID_API_KEY` the activation link is printed in
the API log (`docker compose logs api`). Or run Mailpit, see
[Docker Compose](/docs/getting-started/docker/#trying-out-email).
:::

## Login

`POST /auth/login` returns `{ access_token }`, a JWT valid for 24 hours. The
web app keeps it in `localStorage` and sends it as a bearer token on every
browser request. Login fails with `400` and "User not found" for unknown
**or not yet activated** accounts, and "Invalid credentials" for a wrong
password.

## Password reset

1. `/resetPassword` (the "forgot password" form) calls
   `POST /users/forgot-password/:email`.
2. The API creates a random token (32 bytes, hex), stores its SHA-256 hash
   and an expiry one hour ahead on the user (`passwordResetToken`,
   `passwordResetExpiresAt`), and mails `${WEB_URL}/resetPassword/<token>`.
   Requesting again replaces the previous link.
3. The page posts `{ newPassword }` to `POST /users/reset-password/:token`.
   The new password has to be as strong as at registration. A valid token
   sets the password and is cleared, so every link works once. Unknown,
   used and expired tokens answer `400`.
4. The answer is `{ access_token, activeApiTokens }`: the user is logged in
   straight away (`access_token` is `null` for an account that is not
   activated yet, which goes to `/login` instead). A reset does **not**
   revoke [API tokens](/docs/features/api-tokens/); if `activeApiTokens` is
   above 0 the page asks whether to revoke them all before going on to
   `/discover`.

Unknown addresses get the same `201` as known ones and no mail is sent, so
the endpoint does not reveal which addresses have an account. The activation
link cannot be used to reset a password.

## Profiles

- `GET /users/:id`: public profile with posts, memberships, favourite
  exponats and follower counts. The e-mail address is only included for the
  user themself and super users. Platform moderators (`SUPER`, `ADMIN`) also
  see unapproved posts. User lists
  (search, followers, favourites, saves) never include e-mail addresses.
- `PATCH /users`: edit your own profile. `PATCH /users/pfp`: upload a profile
  picture (stored under `user/<id>`, sets `hasProfileImage`).
- `DELETE /users`: delete your own account (cascades to everything you own).
- `GET /users/requests`: your pending organisation join requests.

Super users can additionally `PATCH /users/:id`, `DELETE /users/:id` and read
`GET /users/:id/requests` for anyone.

## Following people

`POST /follows/:userId` toggles following a user and notifies them
(`NEW_FOLLOWER`). `GET /follows/:userId/followers` and `/following` list the
two sides; the web app shows them on `/follows/[userId]`. Followers are
notified when a post by someone they follow is published.

## The development account

The seed creates `dev@biosfera.local` / `biosfera123`, an activated `SUPER`
user who owns the first organisation. Use it to see every moderation screen.
