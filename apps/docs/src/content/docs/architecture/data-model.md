---
title: Data model
description: The Prisma schema, entity by entity, and the conventions it follows.
sidebar:
  order: 4
---

The schema lives in `apps/api/prisma/schema.prisma`; migrations are in
`apps/api/prisma/migrations`. The generator enables the `fullTextSearch`
preview feature, which the search filters rely on.

## Entities at a glance

```text
User ──< OrganisationUser >── Organisation ──< Exponat >── Categorization
 │  \                             │   │   \         │
 │   \──< UserOrganisationFollower┘   │    \──< Work │──< Post ──< Like
 │                                    │             │
 │──< UserFollows (follower/followee) └──< SocialPost└──< FavouriteExponat
 │──< SavedWorks, SavedLiterature
 │──< UserNotification >── Notification
 └──< AuthorshipInfo (1:1 with an Exponat, Post or SocialPost)

Organisation ──< Quiz ──< Question ──< Answer >── Attempt
```

`──<` reads "has many". Join tables use composite primary keys
(`@@id([organisationId, userId])` and so on), so a user can like a post,
favourite an exponat or follow someone at most once; the API's "toggle"
endpoints create or delete that row.

## Users and organisations

**User**: `email` (unique), `username`, `firstName`, `lastName`, `bio`
(defaults to "Homo sapiens u biosferi"), `location` (a Croatian `County`),
`password` (bcrypt hash), `hasProfileImage`, `isActivated`,
`isEmailNotificationsEnabled`, `language` (`EN` or `HR`, default `EN`: the
interface and account mail language), and a platform `role`:

| `Role`  | Meaning |
| ------- | ------- |
| `USER`  | Everyone, by default |
| `ADMIN` | Platform moderator: reviews, approves, edits and deletes content in every organisation and approves organisations, but cannot manage users or memberships |
| `SUPER` | Platform administrator: bypasses organisation checks, sees unapproved content, manages users |

`activationCode` (a UUID) is the activation link. Password resets use a
separate, single-use token: only its SHA-256 hash is stored in
`passwordResetToken`, with `passwordResetExpiresAt` one hour after the
request.

**Organisation**: `name`, `email` (unique), `websiteUrl`, `description`,
`mainImage`, `location`, `isApproved` (default `true`).

**OrganisationUser** joins the two with a `MemberRole`:

| `MemberRole` | Meaning |
| ------------ | ------- |
| `REQUESTED`  | Asked to join, not a member yet |
| `MEMBER`     | Can add exponats, posts and works for review |
| `ADMIN`      | Publishes directly and approves others' content |
| `OWNER`      | Admin who can also promote admins and transfer ownership |

## The collection

**Exponat**, one item in an organisation's collection:

| Field | Notes |
| ----- | ----- |
| `name`, `alternateName` | Common name and (usually) the scientific name; at least 5 characters each |
| `ExponatKind` | `PROCARIOT`, `EUCARIOT` or `MINERAL` |
| `description` | At least 10 characters; can be AI- or Wikipedia-generated in the form |
| `funFacts` | String array |
| `attributes` | Free-form JSON key/value pairs (e.g. habitat, hardness) |
| `mainImage`, `video`, `thirdDimensionalModel` | File URLs |
| `serialNumber` | Auto-increment integer, unique; printed as a QR / lookup code |
| `categorizationId` | Optional link to the taxonomy |
| `authorshipInfoId` | Optional, unique: who found and documented it |
| `isApproved` | Default `true` in the schema, but set explicitly on create |
| `IsNotificationMade` | Prevents sending "new exponat" notifications twice |

**Categorization**: the taxonomy path `domain`, `kingdom`, `phylum`, `class`,
`order`, `family`, `genus`, the unique `species` name, and GBIF's
`speciesKey`. Exponats of the same species share a row.

**AuthorshipInfo**: field data attached one-to-one to an exponat, post or
social post: `locationOfOccurrence`, `dateOfOccurrence`, `identifiedBy`,
`photographer`, `deviceName`, `literature` (string array), and either a
platform `authorId` or a free-text `nonPlatformAuthor`.

## Content

**Post**: a write-up about one exponat: `title`, `text`, `image`,
`thumbnailImage`, `authorId`, `ExponatId`, `isApproved` (default `false`),
`IsNotificationMade`, optional `authorshipInfoId`.

**SocialPost**: organisation news: `title`, `text`, `images[]`, `type`
(`SocialPostType`: `STORY`, `EU_PROJECT`, `NEWS`, `EVENT`, `ANNOUNCEMENT`,
`WORKSHOP`, `GUIDE`, `OTHER`), `isApproved` (default `true`).

**Work**: a publication: `title`, `description`, `type` (one of 20
`WorkType`s, from `JOURNAL` and `THESIS` to `FILM`), optional `document`
(PDF), `presentation` (PDF), `poster` (image), `tags[]`, `authorId`,
`organisationId`, `isApproved` (default `false`), `approvedBy`,
`firstPublished`.

**SavedWorks** / **SavedLiterature**: bookmarks. `SavedLiterature` stores only
a `literatureId`, an id in GBIF's literature API, not a local record.

## Notifications

**Notification** holds the message once (`messageKey` and `params`, which the
API renders in each reader's language, an English `title` and `text`, `link`,
`notificationImage`, `type`); **UserNotification** fans it out to recipients
with a per-user `isRead`. `NotificationType` lists every reason a
notification is sent (approvals, membership requests and changes, new
followers, new content by followed accounts, point milestones, …).

## Quizzes

**Quiz** (`difficulty`, `timeLimitType` of `NONE` / `TOTAL` / `PER_QUESTION`,
`isTest`, `isRetakeable`, `isAnonymousAllowed`, `isApproved`),
**Question** (`questionType`: `MULTIPLE_CHOICE`, `TRUE_FALSE`,
`FILL_IN_THE_BLANK`; `options[]`, `correct[]`, `points`, optional time limit
and image), **Attempt** (`userId`, null for anonymous attempts;
`startedAt`, `submittedAt` (null while running), server-measured `timeTaken`
in milliseconds, `score`, `maxScore`) and **Answer** (one per attempt and
question: the given `answer` as a JSON array, `isCorrect`, `points`, the
client-reported `timeTaken` in seconds). See [Quizzes](/docs/features/quizzes/).

## Conventions and quirks

- Ids are UUID strings (`@default(uuid())`), except `Exponat.serialNumber`.
- `createdAt` / `updatedAt` on most models, with `@updatedAt`.
- `AuthorshipInfo.locationOfOccurrence` / `dateOfOccurrence` are mapped with
  `@map` onto the original, misspelled columns `locationOfOccurence` /
  `dateOfOccurence`; use the correct spelling everywhere except raw SQL.
- Relation field casing is inconsistent (`ExponatId`, `Exponat`, `IsNotificationMade`
  next to camelCase fields). Raw SQL has to quote them: `p."ExponatId"`.
- Deleting a user, organisation or exponat cascades to the rows that depend
  on it (memberships, posts, likes, favourites, notifications). `Work.approvedBy`
  is set to null instead when the approver is deleted.
- `Organisation.isApproved` and `Exponat.isApproved` default to `true`,
  `Post.isApproved` and `Work.isApproved` to `false`.
