---
title: Known issues
description: Limitations that are still open, and the bugs that were fixed on the known-issues and open-issues branches.
sidebar:
  order: 3
---

## How bugs are tracked

A bug that is not fixed straight away gets a test describing the **intended**
behaviour, marked as an expected failure: `it.failing` in Jest (API and web),
`test.fail` in Playwright. The suites stay green while the bug exists; fixing
it makes the test "pass unexpectedly" and fail, which is the signal to drop
`.failing` / `.fail`. List them with:

```sh
grep -rn "it.failing" apps/api/src apps/api/test apps/web/src
grep -rn "test.fail" apps/e2e/tests
```

**There are none at the moment.** Every pinned bug was fixed on the
`fix/known-issues` and `fix/open-issues` branches (summaries below).

## Still open

These are known, but no test pins them, because they are design limits rather
than wrong behaviour, or need a schema change.

- **The text-to-speech upload endpoint is unauthenticated** by design: the web
  server writes recordings to it while rendering pages for anonymous
  visitors. It only accepts recording names (`audio-<dir>/<id>-<hash>`) and
  never replaces a file, see [File storage](/docs/architecture/file-storage/).
- **No page for taking a quiz.** The attempt API exists (see
  [Quizzes](/docs/features/quizzes/#taking-a-quiz)), but the web app has no
  page that uses it yet.

## Fixed on `fix/open-issues`

- **One shared Prisma client.** `PrismaModule` is global and no module
  provides `PrismaService` itself, so there is one connection pool; the same
  goes for `EmailService`. Shared services are exported and imported instead
  of being provided again in every module.
- **E-mail notifications work.** Notifications are mailed to activated users
  with `isEmailNotificationsEnabled`, which can be changed through
  `PATCH /users/:id`.
- **`FilteringParams` is consistent.** Its pattern now accepts exactly the
  `FilterRule` names. It is still not used by an endpoint.
- **The posts-by-organisation route is reachable** at
  `GET /posts/organisation/:organisationId`.
- **Password reset links expire and work once.** The reset link carries its
  own random token (only a SHA-256 hash is stored, in the new
  `passwordResetToken` column), valid for an hour and cleared when used. The
  activation link no longer resets passwords, and `forgot-password` answers
  the same for unknown addresses. The new password must be as strong as at
  registration.
- **Live notifications work with several API instances.** Notifications are
  published with Postgres `NOTIFY`, and every instance `LISTEN`s and passes
  them on to its own SSE streams. No new infrastructure is needed (see
  [Notifications](/docs/features/notifications/)).
- **The platform `ADMIN` role is a content moderator.** It reviews,
  approves, edits and deletes content in every organisation and approves
  organisations, but cannot create content for an organisation, manage
  members or organisation details, manage accounts or see e-mail addresses
  (see [Roles and permissions](/docs/reference/roles-and-permissions/)). The
  web app shows moderation controls to it accordingly.
- **Quizzes can be taken through the API.** Users and, where allowed,
  anonymous visitors start and submit attempts. The server scores them,
  enforces time limits and retake rules, and organisation admins get results
  and per-question statistics. `attemptsAmount` and `averageAttemptScore`
  are real now.
- `GET /posts/:id` checked moderation rights against the post id instead of
  its organisation, so organisation admins and the author got `404` for a
  pending post.
- In the web app, owners of _any_ organisation saw the admin controls for
  exponats and the "new announcement" button on every organisation (an
  operator-precedence slip). The organisation Edit tab is shown to
  organisation admins only, no longer to everyone who may moderate.

## Fixed on `fix/known-issues`

### Authorisation

- Organisation update, delete and join-request handlers checked a pending
  promise, so every logged-in user passed. Approving an organisation had no
  guard; it now needs a super user.
- Membership denials were returned as HTTP 200 with an error body; they are
  thrown (401 / 404 / 400) now.
- Non-members could create exponats for any organisation (and got a 500 on
  the admin path). `DELETE /exponats/:id` needed no login.
- Authors could approve their own posts.
- `WorksService.checkRights` returned un-awaited promises: anyone could edit,
  delete or approve any work.
- Any organisation admin could approve or delete another organisation's quiz.
- Social-post deletion needed no login and passed its arguments in the wrong
  order; update and delete are now scoped to the organisation.
- Categorization writes needed no login; editing or deleting one now needs a
  super user.
- Image, PDF, model and video uploads needed no login. The local storage path
  guard accepted `.` and `..`.
- Anyone could listen to any user's notification stream.
- User lists (search, followers, favourites, saves) included e-mail
  addresses; profiles and organisation member lists showed them to everyone.

### Features that did not work

- Creating a post always failed with a 500.
- Quizzes and questions could not be created, updated or listed (array
  validators on numbers, enums checked against display labels, update and
  query DTOs built from the create DTO, the quiz id checked as a question id).
  The public question endpoints exposed the correct answers.
- The favourite-count and class exponat filters, and the post organisation
  filter, built invalid queries.
- Registration rejected a missing `bio`.
- A pending work was hidden from its own author; admins' works were never
  auto-approved.
- Organisation owners could not publish social posts, and every social post
  was stored as `NEWS`.
- The authorship dialog lost the place and the date (the columns are spelled
  `…Occurence`; the Prisma fields are now mapped to them).
- Unknown users and organisations crashed the page instead of answering 404.

### Web app

- Quiz hooks called `/:org/quizzes`; `QuizForm` never showed added questions;
  `QuestionForm` could not submit points and dropped images.
- `ListInput` discarded its initial values, so edit forms lost tags and facts;
  `WorksForm` could not replace stored files; `SocialPostForm` sent updates
  without a body; `EditUserForm` cleared the profile picture flag; `PostForm`
  dropped `authorshipInfoId`.
- `PostCard` offered moderation buttons to everyone; logged-out visitors
  counted as the current user.
- Ten mutation hooks reported successful requests as failed.
- Discover asked for pages of one item; filter forms rejected every valid sort
  pair; lists reordered the arrays they were given; cancelling a removal still
  changed the shared state; the menu button had no accessible name.

### Discovery and notifications

- Post discovery listed pending posts and counted whom an author follows
  instead of their followers; organisation discovery counted join requests as
  members and listed unapproved organisations.
- Notification links pointed at routes the web app does not have, and the
  organisation approval notice said the opposite of what happened.
