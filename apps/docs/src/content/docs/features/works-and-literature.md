---
title: Works and literature
description: Publications by members, and scientific literature pulled from GBIF.
sidebar:
  order: 5
---

## Works

A **work** is a publication by a member on behalf of an organisation: a
paper, poster, thesis, presentation, report and so on (20 `WorkType`s, from
`JOURNAL` to `FILM`, labelled in Croatian).

Members create one at `/organisation/[id]/createWork` (`WorksForm`,
`POST /works/:organisationId`) with a title, description, type, tags and up
to three files: a **document** (PDF), a **presentation** (PDF; PowerPoint is
not accepted, by design, to keep files small and viewable in the browser)
and a **poster** image. `/work/[workId]` shows them with an in-browser PDF
reader (`DocumentReader`, `react-pdf`).

Only members who are not merely `REQUESTED` (and super users) can post works.

### Review

Works by organisation admins and owners (and super users) are approved on
creation, with the author recorded as `approvedBy`. Other members' works
start unapproved and stay off lists until an admin approves them with
`PATCH /works/:id/approval`; being the author is not enough. Toggling again
clears approval. The author can still open a pending work; `/work/[id]/admin`
is the review page.

### Saving

`PATCH /saved-works/:workId` toggles a bookmark. `GET /saved-works/me` lists
your own, `GET /saved-works/user/:userId` someone else's, and
`GET /saved-works/:workId` who saved a work.

## GBIF literature

The **Literatura** tab on `/search` and the works section of discovery also
show scientific literature from [GBIF's literature API](https://www.gbif.org/resource/search?contentType=literature),
fetched by the web server (`serverLiterature.ts`). Results are mapped to the
same card shape as works (`LiteratureToWorkMapper`): GBIF is shown as the
"organisation", the publisher and authors fill in the rest.

Literature is never copied into Biosfera's database. Saving it
(`PATCH /literature/:literatureId`) stores only the GBIF id in
`SavedLiterature`; `GET /literature/me` lists your saved ids and the web app
fetches the details from GBIF again.
