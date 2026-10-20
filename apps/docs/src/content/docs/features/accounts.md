---
title: Accounts and sign-in
description: Registration, email activation, login, password reset and profiles.
sidebar:
  order: 1
---

## Registration and activation

1. `/register` posts the form to `POST /users`. The password is hashed with
   bcrypt (10 rounds); `location` is a Croatian county (`County` enum).
2. The API emails an activation link,
   `${WEB_URL}/activateUser/<activationCode>`, and returns the new user's id.
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
2. The API mails `${WEB_URL}/resetPassword/<activationCode>`.
3. The page posts `{ newPassword }` to `POST /users/reset-password/:activationCode`.

:::caution
The reset link reuses the account's `activationCode`, which never changes.
A reset link therefore keeps working after it has been used, and a leaked
activation link is also a reset link. Requesting a reset for an unknown
address answers `404`, which reveals whether an account exists.
:::

## Profiles

- `GET /users/:id`: public profile with posts, memberships, favourite
  exponats and follower counts. Super users also see unapproved posts.
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
