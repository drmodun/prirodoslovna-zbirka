---
title: Notifications
description: How notifications are stored, delivered live over server-sent events, and marked read.
sidebar:
  order: 7
---

Notifications tell people about approvals, membership changes, new
followers and new content from accounts they follow. They are stored in the
database **and** pushed live to anyone who has the site open.

## Flow

```text
service (e.g. PostsService.toggleApproval)
  │ 1. NotificationsService.create(dto, userIds)
  │      → one Notification row + one UserNotification row per recipient
  │ 2. NotificationUsersService.publishManyNotifications(userIds, notification)
  │      → NotificationBusService.publish(userId, notification) for each recipient
  │      → SELECT pg_notify('user_notifications', { userId, message })
  ▼
Postgres delivers the NOTIFY to every API instance that LISTENs (this one too)
  │ NotificationBusService → EventEmitter2.emit(userId, notification), locally
  ▼
GET /notification-users/subscribe/:userId   (SSE, @Sse, JwtAuthGuard + OwnStreamGuard)
  │ fromEvent(eventEmitter, userId) → { data: JSON.stringify(notification) }
  ▼
NotificationContext (fetch-event-source) → prepended to the list, toast "Nova obavijest stigla: …"
```

Live delivery works with **any number of API instances** and needs no extra
infrastructure: each instance (`NotificationBusService`, a global provider)
keeps one dedicated Postgres connection that `LISTEN`s on the
`user_notifications` channel. Publishing sends a `NOTIFY`; Postgres hands it
to every listening instance, and each one re-emits it on its in-process
`@nestjs/event-emitter`, keyed by user id, where the SSE streams of the
browsers connected to *that* instance pick it up.

Details:

- The listener connects with `DATABASE_URL`, minus Prisma-only parameters
  such as `schema` or `connection_limit` (`sslmode` is kept). It does not go
  through PgBouncer-style transaction pooling, which does not support
  `LISTEN`; point it at Postgres directly in such setups.
- If the listener connection drops, the instance reconnects every 5 seconds.
  Until then, and if a `NOTIFY` fails, notifications are emitted locally
  only, so browsers on the same instance still get them.
- Postgres limits a `NOTIFY` payload to 8000 bytes; larger notifications are
  delivered locally only. Notification texts are far below that.
- Either way the notification is stored, so it shows up everywhere on the
  next page load.

The stream needs the subscriber's own login: native `EventSource` cannot send
an `Authorization` header, so the web app subscribes with
`@microsoft/fetch-event-source`. `OwnStreamGuard` checks that the token's
user matches `:userId`; it has to be a guard because Nest sends SSE headers
before the handler runs.

Proxies in front of the API must not buffer the stream
(`proxy_buffering off` in nginx; see [Production](/docs/getting-started/production/)).

## Reading and marking

| Endpoint | Effect |
| -------- | ------ |
| `GET /notification-users` | Your notifications with `title`, `text`, `link`, `notificationImage`, `type`, `read`, `createdAt` |
| `PATCH /notification-users/read/:id` | Mark one read |
| `PATCH /notification-users/read/all` | Mark all read |

In the web app the bell in the header (`NotificationBell`) shows the unread
count and opens `NotificationModal`, which lists `NotificationCard`s; clicking
one follows its `link`.

## When notifications are sent

| `NotificationType` | Sent to | Trigger |
| ------------------ | ------- | ------- |
| `NEW_FOLLOWER` | The followed user | Someone follows them |
| `MEMBERSHIP_REQUEST` | Organisation admins and owner | A user asks to join |
| `MEMBERSHIP_CHANGE` | The member | Added, role changed, removed |
| `ORGANISATION_APPROVAL` | The organisation's members | Approval toggled |
| `NEW_EXPONAT_REQUEST` | Organisation admins and owner | A member adds an exponat |
| `EXPONAT_BY_FOLLOWED_ORGANISATION` | The organisation's members | An admin adds an exponat |
| `NEW_POST_REQUEST` | Organisation admins and owner | A member writes a post |
| `POST_APPROVAL` | The post's author | Approval toggled |
| `POST_BY_FOLLOWED_ACCOUNT` | The author's followers | A post is published |
| `NEW_SOCIAL_POST` | The organisation's followers | A social post is created |

`EXPONAT_APPROVAL`, `WORK_BY_FOLLOWED_ORGANISATION`, `NEW_WORK_REQUEST`,
`POINT_MILESTONE` and `OTHER` exist in the enum but nothing sends them yet.

Each notification is stored as a `messageKey` (such as `newFollower`) and
its `params` (`{ username }`). `src/notifications/notification-messages.ts`
holds the English and Croatian templates; the API renders them in the
reader's saved `language` for the list (`GET /notification-users`), the live
stream and the e-mail, so a reader who switches language sees older
notifications in the new language too. `title` and `text` keep an English
copy. Rows from before message keys existed were given a key by the
`backfill_notification_message_keys` migration, which reads the parameters
back out of their Croatian text; the few that did not match their template
are shown with the text they were stored with. Links point at
web routes (`/exponat/…`, `/post/…`, `/organisation/…`, `/user/…`): absolute
(`${WEB_URL}/…`) for exponats, posts and organisation approval, relative for
the rest.

## Email

Besides account activation and password reset, every notification is also
mailed to activated users whose `isEmailNotificationsEnabled` is on (the
default). The mail carries the title, text and a link under `WEB_URL`. Users
change the setting with `PATCH /users/:id`. A notification sent to many users looks up all recipients in one query.
Mailing is best effort: a failure
is logged and never fails the action that caused the notification.

