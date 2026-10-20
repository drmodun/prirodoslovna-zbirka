---
title: Quizzes
description: Quizzes and questions, how they are created and reviewed, and what is still missing.
sidebar:
  order: 9
---

Quizzes let organisations test students on their collection. Creating,
reviewing and reading quizzes works; **taking** one does not exist yet
(attempts and answers are in the schema, but there are no endpoints or pages
for them).

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
database stores; the Croatian labels are only for display.

Quizzes are always created for the organisation in the URL and start
unapproved.

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

"Admins" means organisation admins and the owner; super users pass every
check.

## Still missing

- Taking a quiz: attempts, answers, scoring (`averageAttemptScore` is always
  0 and `answerDistribution` empty).
- A quiz page in the web app; quizzes are only created and edited there.
