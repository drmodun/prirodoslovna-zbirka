---
title: Posts and social posts
description: Member write-ups about exponats, and organisation news.
sidebar:
  order: 4
---

There are two kinds of post, owned by different things.

| | Post | Social post |
| - | ---- | ----------- |
| Belongs to | An exponat (and through it an organisation) | An organisation |
| Written by | Any member of the organisation | Organisation admins |
| Purpose | A student's article about a specimen | News, events, workshops, EU projects, guides… |
| Starts as | Pending, unless the author is an admin | Published |
| Route | `/post/[id]` | Shown on the organisation page |

## Posts

### Writing

`/exponat/[id]/createPost` uses `PostForm`: title, rich text, an image and a
thumbnail, and optional authorship info. It posts to
`POST /posts/:exponatId`. The API checks that the author is a member of the
exponat's organisation.

- **Admins and owners** publish immediately; their followers are notified
  (`POST_BY_FOLLOWED_ACCOUNT`).
- **Members** create a pending post; the organisation's admins and owner are
  notified (`NEW_POST_REQUEST`).

:::caution[Current behaviour]
Creating a post through the API currently fails with a 500, and the web form
drops `authorshipInfoId`. Both are pinned as expected failures by the tests;
see [Known issues](/docs/reference/known-issues/).
:::

### Review

`PATCH /posts/:id/approval` toggles approval. The author is told either way
(`POST_APPROVAL`, "odobrena" / "odbijena"). The first time a post is
approved, the author's followers are notified too; `IsNotificationMade`
keeps that from happening twice.

Admins list pending posts of their organisation with
`GET /posts/:organisationId/hidden`.

### Reading

`/post/[postId]` shows the post with its author, exponat and likes. As with
exponats, a `Suspense` boundary streams in:

- a **summary** from `summarisePostPrompt`, about a fifth to a third of the
  post's length, in Croatian; without an AI service, the opening sentences
  of the post;
- an **audio** version of the title and text (`ttsPrompt`).

`POST /likes/:postId` toggles a like. Likes, together with the exponat's
favourites and the organisation's and author's followers, rank posts in
[discovery](/docs/features/discovery-and-search/).

Editing and deleting (`PATCH` / `DELETE /posts/:id`) is allowed for the
author, organisation admins and super users.

## Social posts

Created at `/organisation/[id]/createSocialPost` (`SocialPostForm`) with
`POST /social-posts/:organisationId`: title, text, images and optional
authorship info. Only organisation `ADMIN`s (and super users) may post. The
organisation's followers are notified (`NEW_SOCIAL_POST`).

Each social post has a `type`, shown with its Croatian label from
`@biosfera/types`:

| `SocialPostType` | Label |
| ---------------- | ----- |
| `NEWS` (default) | Vijesti |
| `STORY` | Priča |
| `EVENT` | Događaj |
| `ANNOUNCEMENT` | Najava |
| `WORKSHOP` | Radionica |
| `EU_PROJECT` | EU Projekt |
| `GUIDE` | Vodič |
| `OTHER` | Ostalo |

:::note[Current behaviour]
The form lets you pick a type, but the API's create DTO has no `type`
property, so the global `ValidationPipe({ whitelist: true })` strips it and
every social post is stored as `NEWS`.
:::

Social posts are published on creation. Admins can hide one again with
`PATCH /social-posts/:org/:id/approval`.

`GET /social-posts` lists them, with `title` and `authorId` filters and the
usual pagination and sorting.
