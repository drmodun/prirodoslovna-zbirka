---
title: Organisations and membership
description: Creating organisations, joining them, and how member roles change.
sidebar:
  order: 2
---

An organisation is usually a school or a club. It owns exponats, works, social
posts and quizzes; users take part through **membership**.

## Creating one

Any logged-in user can create an organisation at `/createOrganisation`
(`POST /organisations`). The creator becomes its `OWNER`. New organisations
are approved by default (`isApproved = true`); `PATCH /organisations/:id/approval`
toggles that (super users only) and notifies the members
(`ORGANISATION_APPROVAL`).

Unapproved organisations are hidden from lists and discovery for everyone but
super users.

## Joining

```text
            POST /members/:org                PATCH /members/:org/:user {role}
 (nobody) ─────────────────────▶ REQUESTED ─────────────────────────────────▶ MEMBER / ADMIN
                                    │  admins and owners are notified
                                    │  (MEMBERSHIP_REQUEST)
                                    └─ DELETE /members/:org/:user/remove ──▶ (nobody)
```

- A user asks to join with `POST /members/:organisationId`. The membership row
  is created with role `REQUESTED`, and the organisation's admins and owner
  get a notification.
- Admins see open requests at `GET /organisations/:id/requests` and accept
  them by setting a role.
- Admins can also add a user directly (`POST /members/:org/:user/add`, as
  `MEMBER`) or remove one (`DELETE /members/:org/:user/remove`).
- Members leave with `DELETE /members/:organisationId/leave`.

Being added, promoted, demoted or removed notifies the affected user
(`MEMBERSHIP_CHANGE`).

## Roles

| Action | `MEMBER` | `ADMIN` | `OWNER` |
| ------ | :------: | :-----: | :-----: |
| Add exponats, posts, works for review | ✓ | ✓ | ✓ |
| Publish without review | | ✓ | ✓ |
| Approve or reject others' content | | ✓ | ✓ |
| Accept requests, add and remove members | | ✓ | ✓ |
| Set the role of a `REQUESTED` or `MEMBER` user, up to `ADMIN` (`PATCH /members/:org/:user`) | | ✓ | ✓ |
| Change anyone's role, including other admins' (`POST /members/:org/:user/owner`) | | | ✓ |
| Transfer ownership (`PUT /members/:org/:user/transfer`) | | | ✓ |
| Edit or delete the organisation | | ✓ | ✓ |

Nobody can be made `OWNER` through the normal role endpoint. Transferring
ownership demotes the current owner to `MEMBER` and promotes the target.

Platform `SUPER` users pass every organisation check as if they were the
owner.

## Following

Following an organisation (`PATCH /favourite-organisations/:id`, a toggle) is
separate from membership: it costs nothing, needs no approval and feeds
[discovery](/docs/features/discovery-and-search/). Organisations with more
followers rank higher, and so do their exponats and posts.

## The organisation page

`/organisation/[id]` shows the organisation's profile, its exponats, social
posts, works and members. Admin-only actions (creating content, the members
table with role controls, deleting the organisation) are wrapped in
`AdminCheckingWrapper`.

