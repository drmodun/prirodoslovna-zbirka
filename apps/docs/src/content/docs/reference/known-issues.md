---
title: Known issues
description: Behaviour that is broken today, as pinned by the test suites and found while writing these docs.
sidebar:
  order: 3
---

Most entries below are encoded as **expected failures** in the test suites:
`it.failing` (Jest, API and web) or `test.fail` (Playwright). The suites stay
green while the bug exists; fixing it makes the test "pass unexpectedly" and
fail, which is the signal to drop `.failing` / `.fail`. List them with:

```sh
grep -rn "it.failing" apps/api/src apps/api/test apps/web/src
grep -rn "test.fail" apps/e2e/tests
```

The comment above each test explains the cause. The per-app `TESTING.md`
files are the source of truth; this page groups them by effect.

## Authorisation

These let users do more than they should. Fix these first.

- **Organisations**: `update`, `remove` and `getRequests` call
  `hasAdminRights` without `await`; a pending promise is truthy, so any
  logged-in user can edit or delete any organisation and read its join
  requests, including email addresses.
- `PATCH /organisations/:id/approval` has no guard.
- **No authentication at all** on `DELETE /exponats/:id`,
  `DELETE /social-posts/:org/:id`, every `/categorizations` write, every
  `/blobs` upload, and the notification stream
  `GET /notification-users/subscribe/:userId`.
- **Posts**: authors can approve their own posts (`toggleApproval` accepts the
  author as well as admins).
- **Works**: `WorksService.checkRights` returns un-awaited Prisma promises,
  so every caller passes: anyone logged in can edit, delete or approve any
  work.
- **Quizzes**: any organisation admin can approve or delete another
  organisation's quiz (the delete route's parameter is misspelt
  `:orgnisationId`, and approval is not tied to the quiz's organisation).
- **Local file storage**: the path guard accepts `.` and `..` segments
  (`^[\w.-]+$`), allowing traversal out of the upload directory.
- **Data exposure**: `GET /users` and the favourites / followers lists include
  users' email addresses.
- **Password reset** reuses the never-changing `activationCode`, so reset
  links do not expire, and `forgot-password` reveals whether an email is
  registered (found in this documentation pass, not covered by a test).

## Features that cannot work today

- **Writing a post**: `POST /posts/:exponatId` always returns 500, because
  `isAdmin` is copied into `prisma.post.create`. The web `PostForm` also
  strips `authorshipInfoId`.
- **Quizzes and questions**: see [Quizzes](/docs/features/quizzes/#what-is-broken).
- **Exponat filters** `minFavoriteCount`, `maxFavoriteCount` and `class`
  build invalid Prisma queries (500). The post filter `organisationId` uses
  `exponatId`.
- **Registration** rejects a missing `bio`, although it is documented as
  optional.
- `GET /works/:id` hides a pending work from its own author.
- **Social posts**: organisation `OWNER`s cannot publish them (only `ADMIN`
  passes the check), and the chosen `type` is stripped by validation, so
  every social post is saved as `NEWS` (the latter found in this
  documentation pass).
- **Works** are never auto-approved for admins: the controller computes the
  flag but the service does not save it (found in this documentation pass).
- **Authorship dialog** loses the place and the date (field name
  `locationOfOccurence`, and no DTO validator for the date), so they are
  stripped.
- **Unknown users and organisations** produce a server error instead of a 404.

## Web app

- **Wrong requests**: `useCreateQuiz` / `useUpdateQuiz` call `/:org/quizzes`;
  `SocialPostForm` sends updates without their body.
- **Data loss**: `EditUserForm` clears `hasProfileImage` on any save without a
  new picture; `ListInput` ignores `initValue`, so edit forms lose their tags;
  `QuestionForm` drops uploaded images and can never submit `points`.
- **Crashes**: `UserPage` dereferences a missing user before its null check;
  `useExponatSubmit` throws when editing with an unknown nomenclature;
  `OrganisationPage` renders `OrganisationBody` with `null`.
- **UI permissions**: `PostCard` defaults `isAdmin` to `true`;
  `isCurrentUser` is `true` for logged-out visitors when the id is
  `undefined`. (The API still refuses the actions.)
- **Smaller**: `refineSortPair` rejects every valid input; `SocialPostCard`
  swaps `getEnumValue` arguments (always "Objava"); `DiscoverPageView` takes
  its page size from `query.page`; removing a post or exponat updates shared
  state even when the confirm dialog is cancelled; `useRemoveWork` reports an
  error after a successful delete; `QuizForm` never renders added questions;
  `CardCollection` sorts its `items` prop in place.
- **Accessibility**: the menu button has no accessible name (`awia-label`
  typo).

## Discovery

- Discover lists posts that are still waiting for approval: the SQL checks
  the exponat's `isApproved`, not the post's.
- In the post ranking, "author followers" counts whom the author follows
  (`GROUP BY "followerId"`), and one personalised term compares
  `fe."ExponatId" = fe."ExponatId"`, which is always true.
- The organisation ranking counts every membership row except `MEMBER`
  (including open requests) as "members", and does not filter out
  unapproved organisations.

## Smaller issues

- The organisation approval notification text is inverted.
- Typo `kingom` in the categorization response.
- The quiz list returns the organisation image as its name.
- `FilteringParams` accepts rules that `FilterRule` does not know (unused).
- Denied member operations answer **HTTP 200** with an error-shaped body,
  because the exceptions are returned, not thrown.
- The membership-request notification links to `/organisations/<userId>` and
  uses the user id as its image.
- `logout` removes `time` from `localStorage` instead of `loggedTime`.
