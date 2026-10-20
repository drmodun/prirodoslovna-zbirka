---
title: Exponats
description: Collection items, how they are added, classified, reviewed and shown.
sidebar:
  order: 3
---

An **exponat** is one item in an organisation's collection: a bacterium
(`PROCARIOT`), a plant, animal or fungus (`EUCARIOT`), or a `MINERAL`.

## Adding one

Organisation members open `/organisation/[id]/createExponat`. The form
(`components/ExponatForm`) collects:

- **Kind**, **name** (common name) and **alternate name**. For living things
  the alternate name must be a species that GBIF knows: as you type, the form
  queries GBIF's species suggest API from the browser (`useGetSpecies`) and
  only accepts a name from the suggestions ("Nomenklatura nije validna"
  otherwise). Minerals skip this.
- **Description** (10+ characters), **fun facts** and free-form
  **attributes** (key/value pairs, sent as a JSON string).
- **Main image** (required), and optionally a **3D model** and an **MP4 video**.
- **Authorship info**: where and when it was found, who identified and
  photographed it, the camera, and literature. This is saved first through
  `POST /authorship-info` and linked by id.

On submit (`useExponatSubmit`):

1. For living things, the chosen GBIF record becomes a **categorization**:
   the form looks it up with `GET /categorizations/name/:species` and creates
   it with `POST /categorizations` if it does not exist yet. The taxonomy
   (`kingdom` … `genus`, `speciesKey`) is copied from GBIF; `domain` is set to
   the exponat kind.
2. The image, model and video are uploaded in parallel to `/blobs`.
3. `POST /exponats/:organisationId` creates the exponat.

## Review

Whether the exponat is published straight away depends on who adds it:

| Added by | `isApproved` | Notified |
| -------- | ------------ | -------- |
| Organisation `ADMIN` / `OWNER`, or a `SUPER` user | `true` | The organisation's members (`EXPONAT_BY_FOLLOWED_ORGANISATION`) |
| Any other member | `false` | The organisation's admins and owner (`NEW_EXPONAT_REQUEST`), with a link to `/exponat/:id/admin` |

Users who are not members get `401`. Admins approve or reject with
`PATCH /exponats/:id/approval` (the
`ToggleApprovalButton` on the admin page). Unapproved exponats are left out
of lists, search and discovery, and the public page redirects to the
`/admin` variant (see [Web app](/docs/architecture/web/#the-admin-variants)).

Editing (`/exponat/[id]/edit`, `PATCH /exponats/:id`) uses the same form;
a name that is not in the GBIF suggestions keeps the stored categorization.
Editing and deleting (`DELETE /exponats/:id`) need admin rights in the
organisation.

## The exponat page

`/exponat/[exponatId]` renders in two steps. The exponat itself (image,
names, taxonomy, attributes, fun facts, authorship table, posts) renders
first; a `Suspense` boundary then streams in the slower extras:

- **Description**: generated per view by `exponatInfoPrompt(alternateName)`,
  a ~200-word Croatian text from the configured AI model, or the Wikipedia
  lead paragraph when no AI service is set up. It is not stored on the
  exponat.
- **Listen**: the description read aloud (`ttsPrompt`), recorded once per
  text and cached in file storage.
- **Occurrence maps**: GBIF density maps for the species, world-wide and for
  Croatia, when GBIF has data for its `speciesKey`.

Buttons on the page open the 3D model (`@google/model-viewer`) and the video,
share the page, add it to favourites, and generate a **QR code** for the
page URL that can be downloaded as an image and printed next to the physical
specimen.

## Serial numbers

Every exponat gets an auto-incrementing `serialNumber`. The `#` button in
the header (`SerialButton` / `SerialModal`) asks for a number and jumps to
the matching exponat via `GET /exponats/serial/:id`. Labels in a physical
collection can carry the number instead of a QR code.

## Favourites

`PATCH /favourite-exponats/:exponatId` toggles a favourite.
`GET /favourite-exponats/user` lists your own; `GET /favourite-exponats/:exponatId`
lists who favourited an exponat. Favourite counts feed the
[discovery ranking](/docs/features/discovery-and-search/).

## Searching and filtering

`GET /exponats` accepts, besides pagination and sorting:

- `name`, `alternateName`: full-text, any of the words.
- `kingdom`, `phylum`, `class`, `order`, `family`, `genus`, `species`:
  full-text phrase match on the categorization; every given rank must match.
- `organisationId`.
- `minFavoriteCount`, `maxFavoriteCount`, which can be combined. Prisma cannot
  filter on a relation count, so the service first groups the favourites by
  exponat and turns the bounds into an id filter (`exponats.query.ts`).
