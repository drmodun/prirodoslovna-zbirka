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
  │      → EventEmitter2.emitAsync(userId, notification) for each recipient
  ▼
GET /notification-users/subscribe/:userId   (SSE, @Sse, JwtAuthGuard + OwnStreamGuard)
  │ fromEvent(eventEmitter, userId) → { data: JSON.stringify(notification) }
  ▼
NotificationContext (fetch-event-source) → prepended to the list, toast "Nova obavijest stigla: …"
```

The event bus is the in-process `@nestjs/event-emitter`, keyed by user id.
This keeps the setup simple, but it means live delivery only works with a
**single API instance**: an event emitted on one replica never reaches a
browser connected to another. The stored notification is still there on the
next page load. The service carries a comment to move this to an external
service if it ever becomes a bottleneck.

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

Texts are Croatian and built in the service that sends them. Links point at
web routes (`/exponat/…`, `/post/…`, `/organisation/…`, `/user/…`): absolute
(`${WEB_URL}/…`) for exponats, posts and organisation approval, relative for
the rest.

## Email

`User.IsEmailNotificationsEnabled` exists, but notifications are not mailed
today. The only emails are account activation and password reset.

