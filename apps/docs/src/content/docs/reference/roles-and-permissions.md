---
title: Roles and permissions
description: Platform roles, organisation roles, and who may do what.
sidebar:
  order: 2
---

Permissions combine two independent roles.

**Platform role** (`User.role`, carried in the JWT as `user` / `admin` /
`super`):

- `USER`: everyone.
- `ADMIN`: reserved. It is put in the token, but no check looks for it, so it
  behaves like `USER`.
- `SUPER`: platform administrator. Passes every organisation check as if
  owner, sees unapproved content everywhere, and manages users.

**Organisation role** (`OrganisationUser.role`, per organisation):
`REQUESTED` → `MEMBER` → `ADMIN` → `OWNER`. See
[Organisations and membership](/docs/features/organisations/#roles).

The checks live in the services: `MembersService.hasAdminRights` /
`hasOwnerRights` (super, or the right membership), `ExponatsService.checkForValidity`,
`PostsService.checkValidity` (is the author), `WorksService.checkMembership`
(any role except `REQUESTED`) and `SocialPostsService.checkForValidity`
(organisation `ADMIN`, or super). The web app mirrors them with
[permission gates](/docs/architecture/web/#permission-gates), which only
hide UI.

## Intended matrix

What the code is designed to allow. Where it does not do so today, the last
column says so; details are in [Known issues](/docs/reference/known-issues/).

| Action | Who | Enforced today? |
| ------ | --- | --------------- |
| Create an organisation | Any user | ✓ |
| Edit / delete an organisation | Its admins, owner, super | ✗ any logged-in user |
| Read join requests | Its admins, owner, super | ✗ any logged-in user |
| Approve an organisation | Super | ✗ no guard at all |
| Accept / add / remove members, set roles below owner | Admins, owner, super | ✓ (denials answer 200) |
| Change admins' roles, transfer ownership | Owner, super | ✓ (denials answer 200) |
| Add an exponat | Members (pending), admins (published) | ✓ |
| Approve an exponat | Admins, owner, super | ✓ |
| Delete an exponat | Admins, owner, super | ✗ no guard |
| Write a post | Members (pending), admins (published) | ✓ (currently fails with 500) |
| Approve a post | Admins, owner, super | ✗ authors can approve their own |
| Edit / delete a post | Author, admins, super | ✓ |
| Create a social post | Organisation `ADMIN`, super | ✓ (owners are rejected) |
| Delete a social post | Admins, super | ✗ no guard |
| Add a work | Members (not `REQUESTED`) | ✓ |
| Edit / delete / approve a work | Author, admins, super | ✗ anyone logged in |
| Write categorizations | Logged-in users | ✗ no guard |
| Upload files | Logged-in users | ✗ no guard |
| Listen to a user's notification stream | That user | ✗ no guard |
| Edit / delete any user | Super | ✓ |
| See unapproved content | Admins of its organisation, super | ✓ |

## Visibility of unapproved content

List and detail endpoints take an "approval" flag that the controller sets
from the caller:

- Anonymous visitors and ordinary users only get approved organisations,
  exponats, posts and works.
- Super users get everything (`isAdmin` / `!isAdmin` in the controllers).
- On an exponat, its organisation's admins and owner also see the exponat
  while it is pending, and its pending posts with their `isApproved` flag.
