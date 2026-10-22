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
- `ADMIN`: platform moderator. Passes every **content** check in every
  organisation: reviews, approves, edits, hides and deletes exponats, posts,
  works, social posts, quizzes and categorizations, sees pending content, and
  approves organisations. It does not create content on an organisation's
  behalf, change organisation details, memberships or ownership, manage user
  accounts, or see e-mail addresses.
- `SUPER`: platform administrator. Passes every organisation check as if
  owner, sees unapproved content everywhere, and manages users.

"Platform moderators" below means `SUPER` and `ADMIN`. The helpers are in
`src/auth/roles.ts` (`isSuperUser`, `isModerator`, `isModeratorRole`).

A [personal access token](/docs/features/api-tokens/) acts as its user with
the user's **current** platform role, and can only narrow it: a read-only
token passes `GET` and `HEAD` requests only, and no token can manage tokens or
delete accounts.

**Organisation role** (`OrganisationUser.role`, per organisation):
`REQUESTED` → `MEMBER` → `ADMIN` → `OWNER`. See
[Organisations and membership](/docs/features/organisations/#roles).

The checks live in the services: `MembersService.hasAdminRights` /
`hasOwnerRights` (super, or the right membership; used for organisation and
membership changes and for creating content), `MembersService.hasModerationRights`
(platform moderators, or organisation admins and owner; used for content
moderation), `ExponatsService.checkForValidity` (members, optionally admins
only; moderators except when creating), `PostsService.checkValidity` (is the
author), `WorksService.checkRights` (author, admins, moderators; `moderation`
leaves the author out), `SocialPostsService.checkForValidity` (admins and
owner, or moderators except when creating) and
`QuestionsService.hasQuizEditPermission`. The web app mirrors them with
[permission gates](/docs/architecture/web/#permission-gates), which only
hide UI.

## Who may do what

Denials answer `401`. Requests for another organisation's quiz or social post
through your own organisation's URL answer `404`.

| Action | Who |
| ------ | --- |
| Create an organisation | Any logged-in user (becomes `OWNER`) |
| Edit / delete an organisation, read its join requests | Its admins and owner, super users |
| Approve an organisation | Platform moderators |
| Accept / add / remove members, set roles below `ADMIN` | Admins and owner, super users |
| Change admins' roles, transfer ownership | Owner, super users |
| Add an exponat | Members (pending) or admins and owner (published) |
| Edit, approve, delete an exponat | Admins and owner, platform moderators |
| Write a post | Members (pending) or admins and owner (published) |
| Approve a post | Admins and owner, platform moderators (not the author) |
| Edit / delete a post | The author, admins and owner, platform moderators |
| Create a social post | Admins and owner, super users |
| Edit, hide, delete a social post | Admins and owner, platform moderators |
| Add a work | Members (not `REQUESTED`), super users |
| Edit / delete a work | The author, admins and owner, platform moderators |
| Approve a work | Admins and owner, platform moderators (not the author) |
| Create a quiz | Admins and owner of the organisation, super users |
| Edit, approve, delete a quiz; add and edit questions | Admins and owner of the quiz's organisation, platform moderators |
| Take a quiz | Logged-in users; anonymous visitors if the quiz allows it |
| See every attempt and the statistics of a quiz | Admins and owner of the quiz's organisation, platform moderators |
| Create a categorization | Any logged-in user |
| Edit / delete a categorization | Platform moderators |
| Upload images, PDFs, models, videos | Any logged-in user |
| Listen to a notification stream | Only its own user |
| Edit / delete any user | Super users (deleting needs a login, not an API token) |
| Create, list, revoke API tokens | Their user, with a login |

## Visibility of unapproved content

List and detail endpoints take an "approval" flag that the controller sets
from the caller:

- Anonymous visitors and ordinary users only get approved organisations,
  exponats, posts and works.
- Platform moderators get everything (`isAdmin` / `!isAdmin` in the
  controllers).
- Authors see their own pending works.
- On an exponat, its organisation's admins and owner also see the exponat
  while it is pending, and its pending posts with their `isApproved` flag.
