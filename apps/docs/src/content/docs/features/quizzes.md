---
title: Quizzes
description: Quizzes and questions, how they are created, reviewed and taken, and how attempts are scored.
sidebar:
  order: 9
---

:::note
Quizzes are now written and taken on Vansy; see
[Quizzes on Vansy](/docs/features/quizzes-on-vansy/). This page describes the
older quiz API, which still works.
:::

Quizzes let organisations test students on their collection. Quizzes are
created, reviewed and read in the API and the web app; **taking** one works
through the API (attempts, server-side scoring, results), but the web app has
no page for it yet.

## Creating a quiz

Organisation admins and the owner create a quiz at
`/organisation/[id]/createQuiz` (`QuizForm`): title, description, cover image,
`difficulty` (`EASY`, `MEDIUM`, `HARD`, `UNSET`), a time limit that is `NONE`,
`TOTAL` (minutes, sent as milliseconds) or `PER_QUESTION`, and the flags
`isTest`, `isRetakeable` and `isAnonymousAllowed`. The checkboxes default to
off, the time limit to `NONE` and the difficulty to `UNSET`.

Questions are added below the form (`QuestionForm`) and listed with
`QuestionInputPreview`, where they can be edited or removed. A question has
text (5+ characters), a type (`MULTIPLE_CHOICE`, `TRUE_FALSE`,
`FILL_IN_THE_BLANK`), `options[]` (multiple choice only), `correct[]`,
`points`, an optional image and, for `PER_QUESTION` quizzes, a time limit in
seconds. A quiz needs at least one question.

The API validates enums by **key** (`MULTIPLE_CHOICE`), the value the
database stores; the labels (from the web app's messages) are only for
display.

Quizzes are always created for the organisation in the URL and start
unapproved. Creating needs organisation admin rights (or `SUPER`); platform
moderators (`ADMIN`) can review and edit quizzes but not create them for an
organisation.

## Review

Admins list their organisation's pending quizzes at
`GET /quizzes/:organisationId/non-approved`, open one (with the correct
answers) at `GET /quizzes/:organisationId/non-approved/:id`, and approve with
`PATCH /quizzes/:organisationId/:id/approval`. Updating, deleting and
approving only reach quizzes of the organisation in the URL; another
organisation's quiz answers `404`.

## Reading

`GET /quizzes` lists approved quizzes, 10 per page by default, filtered by
`title` (full text), `difficulty`, `organisationId` and the boolean flags
(`?isTest=true`). `GET /quizzes/:id` returns a quiz with its questions, but
without correct answers or points; the public question endpoints
(`GET /questions?quizId=…`, `GET /questions/:id`) leave the answers out too.
`attemptsAmount` counts finished attempts, and `averageAttemptScore` is their
average score in points (two decimals).

## Taking a quiz

1. `POST /attempts/quiz/:quizId` starts an attempt and returns
   `{ id, quizId, startedAt, deadline? }`. The quiz must be approved (else
   `404`). Anonymous visitors may only start quizzes with
   `isAnonymousAllowed` (else `401`). For a logged-in user, starting again
   while an attempt is running **resumes** it, so reloading the page does not
   reset the clock. A quiz that is not `isRetakeable` can be finished once;
   starting it again answers `409`. Anonymous attempts cannot be limited
   that way.
2. The client shows the questions from `GET /quizzes/:id` and submits
   `POST /attempts/:id/submit` with
   `{ answers: [{ questionId, answer: string[], timeTaken? }] }`. Questions
   left out score nothing; answers to another quiz's questions, or two
   answers to one question, are a `400` and nothing is stored. Only the
   attempt's user may submit it (anonymous attempts: whoever has the id),
   and only once (`409`).
3. The API scores the answers and returns the result (see below).

### Scoring

Every question is worth its `points` when answered correctly, nothing
otherwise:

- `MULTIPLE_CHOICE`: exactly the options in `correct` (order does not
  matter; a missing or an extra option is wrong).
- `TRUE_FALSE`: `"true"` or `"false"`, matching `correct[0]`.
- `FILL_IN_THE_BLANK`: one answer, matching any entry of `correct`; case and
  surrounding spaces are ignored.

`score` and `maxScore` (the sum of all points) are stored on the attempt,
along with `timeTaken`, which the server measures from `startedAt`.

### Time limits

- `TOTAL`: the deadline is `startedAt + timeLimitTotal` (milliseconds).
- `PER_QUESTION`: the deadline is `startedAt` plus the sum of the questions'
  `timeLimit`s (seconds). In addition, an answer whose client-reported
  `timeTaken` is over its question's limit scores nothing.

Submissions are accepted up to 10 seconds after the deadline (network
latency). Later ones answer `400` and the attempt is closed with no points;
a running attempt that has run out of time is closed the same way when the
user starts the quiz again.

### Results

The submit response and `GET /attempts/:id` return the attempt with
`score`, `maxScore`, `timeTaken`, `startedAt`, `submittedAt` and, per
answer, `answer`, `isCorrect`, `points` and `correctAnswer`. For tests
(`isTest`) the student does not get `correctAnswer`, only whether each answer
was right. An attempt can be read by its user, by anyone with the id of an
anonymous attempt, and by the quiz organisation's admins and platform
moderators.

`GET /attempts/mine?quizId=…` lists your finished attempts.
`GET /attempts/quiz/:quizId/results` (organisation admins, platform
moderators) returns every finished attempt with the username, the average
score, and per question the correct answer, `correctPercentage` (correct
answers / finished attempts) and `answerDistribution` (how often each answer
was given).

## Endpoints

| Method | Route | Who |
| ------ | ----- | --- |
| `POST` | `/quizzes/:organisationId` | Admins |
| `GET` | `/quizzes`, `/quizzes/:id` | Everyone |
| `PATCH` | `/quizzes/:organisationId/:id` | Admins |
| `DELETE` | `/quizzes/:organisationId/:id` | Admins |
| `PATCH` | `/quizzes/:organisationId/:id/approval` | Admins |
| `GET` | `/quizzes/:organisationId/non-approved[/:id]` | Admins |
| `POST` | `/questions/:quizId` | Admins of the quiz's organisation |
| `GET` | `/questions`, `/questions/:id` | Everyone |
| `PATCH`, `DELETE` | `/questions/:quizId/:id` | Admins; the question must belong to the quiz |
| `POST` | `/attempts/quiz/:quizId` | Logged-in users; anonymous if the quiz allows it |
| `POST` | `/attempts/:id/submit` | The attempt's user |
| `GET` | `/attempts/:id` | The attempt's user, quiz admins |
| `GET` | `/attempts/mine` | Logged-in users |
| `GET` | `/attempts/quiz/:quizId/results` | Quiz admins |

"Admins" means organisation admins and the owner. Platform moderators
(`SUPER`, `ADMIN`) pass every check except creating a quiz, which needs
organisation admin rights or `SUPER`.

## Still missing

- A page in the web app for taking a quiz and seeing the result; quizzes are
  only created and edited there.
