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
| Written by | Any member of the organisation | Organisation admins and the owner |
| Purpose | A student's article about a specimen | News, events, workshops, EU projects, guides… |
| Starts as | Pending, unless the author is an admin | Published |
| Route | `/post/[id]` | Shown on the organisation page |

## Posts

### Writing

`/exponat/[id]/createPost` uses `PostForm`: title, rich text, an image and a
thumbnail, and optional authorship info (validated as an id when given). It posts to
`POST /posts/:exponatId`. The API checks that the author is a member of the
exponat's organisation.

- **Admins and owners** publish immediately; their followers are notified
  (`POST_BY_FOLLOWED_ACCOUNT`).
- **Members** create a pending post; the organisation's admins and owner are
  notified (`NEW_POST_REQUEST`).


### Review

`PATCH /posts/:id/approval` toggles approval; it needs organisation admin
rights or a super user, being the author is not enough. The author is told either way
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
authorship info. Only organisation admins and the owner (and super users)
may post. The organisation's followers are notified (`NEW_SOCIAL_POST`).

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


The type is validated against the keys above and stored; editing can change
it.

Social posts are published on creation. Admins can hide one again with
`PATCH /social-posts/:org/:id/approval`, edit it with
`PATCH /social-posts/:org/:id` and delete it with
`DELETE /social-posts/:org/:id`; all three only reach that organisation's
posts.

`GET /social-posts` lists approved posts (super users see all), with `title`
and `authorId` (the authorship author) filters and the usual pagination and
sorting.
