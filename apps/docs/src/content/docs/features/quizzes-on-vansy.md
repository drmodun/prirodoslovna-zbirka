---
title: Quizzes on Vansy
description: Quizzes are written, approved, taken and proctored on Vansy, the shared exam platform; how Biosfera sends people there and gets results back.
sidebar:
  order: 10
---

Quizzes are written, approved, taken, proctored and reviewed in **Vansy**, a
separate exam platform shared with the tournament app. Biosfera keeps its
users, organisations and rights; it sends a signed-in person to Vansy with a
one-time launch and receives signed results back. The old quiz and attempt API
([Quizzes](/docs/features/quizzes/)) still works but the web app no longer
writes quizzes through it.

## In the web app

The organisation page has a **Quizzes** tab (`Kvizovi`):

- everyone sees the organisation's published quizzes and can take them;
  visitors without an account only quizzes that allow anonymous takers;
- organisation admins (and the owner) get **Write quizzes in Vansy**;
- moderators (organisation admins and platform moderators) also see quizzes
  waiting for approval, and get **Approval and review** and **Proctor**.

Every button asks the API for a launch and the browser follows the URL it gets.

## Rights

The rights are Biosfera's own (`MembersService`); Vansy only receives what
they allow.

| Launch | Who may | Sent to Vansy |
|---|---|---|
| Author | `hasAdminRights(org)` | `author` (and `moderate` with `hasModerationRights`) for owner `org:<id>` |
| Review | `hasModerationRights(org)` | `moderate` for owner `org:<id>`: the approval queue and integrity reviews |
| Proctor | `hasModerationRights(org)` | `proctor` for one of the organisation's quizzes |
| Take | anyone; anonymous only when the quiz allows it | the user (id and name), or no subject |

Vansy's `zbirka` tenant requires approval, so an author submits a quiz for
review and a moderator publishes it, as with `isApproved` before. Moderators
can publish directly.

## Endpoints

| Route | Guard | Purpose |
|---|---|---|
| `POST /quiz-launch/author/:organisationId` | `JwtAuthGuard` | Open the editor |
| `POST /quiz-launch/review/:organisationId` | `JwtAuthGuard` | Approval queue and integrity reviews |
| `POST /quiz-launch/proctor/:organisationId/:quizId` | `JwtAuthGuard` | Proctor dashboard |
| `POST /quiz-launch/take/:quizId` | `OptionalJwtAuthGuard` | Take a quiz |
| `GET /quiz-launch/organisation/:organisationId/quizzes` | `OptionalJwtAuthGuard` | The organisation's quizzes (all states for moderators) |
| `GET /quiz-launch/results/mine` | `JwtAuthGuard` | The caller's results |
| `POST /integrations/vansy/webhook` | Vansy's signature | Results from Vansy |

## Results

The webhook receiver checks the `Vansy-Signature` JWT (issuer `vansy`,
audience `zbirka`, at most five minutes old, the SHA-256 of the raw body and
the event id) and handles each `eventId` once (`VansyWebhookEvent`), since
Vansy delivers at least once. `attempt.completed` and `attempt.reviewed` are
stored in `VansyAttemptResult` with the user when they still exist.

## Configuration

| Variable | Meaning |
|---|---|
| `VANSY_URL` | Vansy's API as the server reaches it |
| `VANSY_PRIVATE_KEY` | This app's Ed25519 private JWK; the public half is in Vansy's tenant file |
| `VANSY_TENANT_ID` | `zbirka` |
| `VANSY_PUBLIC_KEY` | Optional; Vansy's public JWK, otherwise read from Vansy's JWKS |

Without `VANSY_URL` and `VANSY_PRIVATE_KEY` the launches answer `503`.
