---
title: Quizzes
description: The quiz feature's design, and why it does not work yet.
sidebar:
  order: 9
---

Quizzes are meant to let organisations test students on their collection.
The data model, API modules, web form and route exist, but the feature
**does not work end to end today**. Treat this page as a map for whoever
finishes it.

## Intended design

- An organisation admin creates a quiz at `/organisation/[id]/createQuiz`
  (`QuizForm`, `QuestionForm`): title, description, cover image,
  `difficulty` (`EASY`, `MEDIUM`, `HARD`, `UNSET`), a time limit that is
  `NONE`, `TOTAL` or `PER_QUESTION`, and the flags `isTest`, `isRetakeable`
  and `isAnonymousAllowed`.
- Questions are `MULTIPLE_CHOICE`, `TRUE_FALSE` or `FILL_IN_THE_BLANK`, with
  `options[]`, `correct[]`, `points` (default 1), an optional image and an
  optional per-question time limit.
- Quizzes start unapproved; admins review them at
  `GET /quizzes/:organisationId/non-approved` and approve with
  `PATCH /quizzes/:organisationId/:id/approval`.
- Taking a quiz creates an `Attempt` (optionally anonymous) with one
  `Answer` per question, each with the time it took.

## Endpoints

| Method | Route | Notes |
| ------ | ----- | ----- |
| `POST` | `/quizzes/:organisationId` | Create |
| `GET` | `/quizzes` | List (needs `page` and `size`) |
| `GET` | `/quizzes/:id` | One quiz with questions |
| `PATCH` | `/quizzes/:organisationId/:id` | Update |
| `DELETE` | `/quizzes/:orgnisationId/:id` | Delete (note the typo in the parameter) |
| `PATCH` | `/quizzes/:organisationId/:id/approval` | Toggle approval |
| `GET` | `/quizzes/:organisationId/non-approved[/:id]` | Review queue |
| `POST` | `/questions/:quizId` | Add a question |
| `GET` | `/questions`, `/questions/:id` | List, one |
| `PATCH`, `DELETE` | `/questions/:quizId/:id` | Edit, remove |

There are no attempt or answer endpoints yet.

## What is broken

From the API and web test suites (each is an `it.failing` test):

- Creating and updating quizzes, and listing or creating questions, always
  fail validation: `@MinLength` is applied to arrays, `@IsEnum` checks
  against the Croatian display labels instead of the keys, and the
  update/query DTOs are built from the create DTOs.
- `GET /quizzes` without `page` and `size` is a 500 (`skip: NaN`).
- Questions cannot be edited: the quiz id is passed where the question id is
  expected.
- Any organisation admin can approve or delete another organisation's quiz.
- The quiz list returns the organisation's image as its name.
- In the web app, `useCreateQuiz` / `useUpdateQuiz` call `/:org/quizzes`
  instead of `/quizzes/:org`, `QuizForm` never renders the questions you add,
  and `QuestionForm` drops uploaded images and cannot submit `points`
  (string vs number).

Fixing a bug turns its `it.failing` test red ("passed unexpectedly"); remove
`.failing` then. See [Testing](/docs/contributing/testing/#known-bugs-as-expected-failures).
