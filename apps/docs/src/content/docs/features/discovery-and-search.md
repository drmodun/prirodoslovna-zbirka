---
title: Discovery and search
description: How the discover feed ranks content, and what search can filter on.
sidebar:
  order: 6
---

## Discover

`/discover` (`DiscoverPageView`) shows four infinitely scrolling lists:
exponats, posts, organisations and works / literature. Each list keeps its
own page number in `DiscoverContext` and loads the next page when you reach
the bottom (`useOnScrollToBottom`).

The first three come from dedicated endpoints that rank with raw SQL
(`rawQueries.ts` in each module). Every query scores rows with **points**,
orders by points (ties by name) and pages with `LIMIT` / `OFFSET`. Only
approved content is ranked: approved organisations, approved exponats, and
approved posts on approved exponats. All values are bound as query
parameters.

When the request carries a token, a **personalised** variant adds points for
things related to what you already like and follow, and pushes down things
you have already seen.

### Exponats: `GET /exponats/discover`

| Signal | Points |
| ------ | ------ |
| Each favourite | +1 |
| Each follower of its organisation | +½ |
| More than two fun facts | +5 |
| Has attributes | +5 |
| *Personalised:* you follow its organisation | +15 |
| *Personalised:* you favourited another exponat with the same scientific name | +15 |
| *Personalised:* you already favourited it | −10 000 |

### Posts: `GET /posts/discover`

| Signal | Points |
| ------ | ------ |
| Each like | +1 |
| Each favourite of its exponat | +½ |
| Each follower of the exponat's organisation | +¼ |
| Each follower of the author | +½ |
| *Personalised:* you follow the author | +30 |
| *Personalised:* someone else liked it | +15 |
| *Personalised:* you favourited its exponat | +15 |
| *Personalised:* you follow the exponat's organisation | +15 |
| *Personalised:* you already liked it | −1 000 |
| *Personalised:* you wrote it | −1 000 |

### Organisations: `GET /organisations/discover`

| Signal | Points |
| ------ | ------ |
| Each follower | +1 |
| Each exponat | +⅕ |
| Each member (any role except `REQUESTED`) | +⅕ |
| Each post on its exponats | +⅒ |
| Each favourite of its exponats | +⅒ |
| *Personalised:* you already follow it | −1 000 |
| *Personalised:* it is in your county | the total is doubled |

Fractions are integer divisions in SQL, so they only add up in whole steps
(five exponats give one point).


## Search

`/search` (`SearchPageView`) has one tab per entity:

| Tab | Source | Notable filters |
| --- | ------ | --------------- |
| Eksponati | `GET /exponats` | `name`, `alternateName`, taxonomy ranks, organisation, favourite count |
| Objave | `GET /posts` | `title`, `exponatId`, `exponatName`, `userName` |
| Organizacije | `GET /organisations` | `name`, `location` (county) |
| Korisnici | `GET /users` | `name` / `username`, `location` |
| Radovi | `GET /works` | `title`, `type`, `tags` |
| Literatura | GBIF literature API | `q`, `publisher`, `source`, `topics`, `year`, `literatureType` |

The URL holds the state, e.g.
`/search?kind=exponat&name=…&page=2&attribute=name&direction=asc`, where
`kind` is `exponat`, `post`, `organisation`, `user`, `work` or `literature`.
`name` and `title` are interchangeable, so one search box can feed every
tab.
The page renders on the server, so a search can be linked and shared.

Text filters use Postgres full-text search through Prisma. Names match any
of the given words; taxonomy ranks match the words as a phrase. When a text
filter is given and no explicit sort, results are ordered by relevance
(`_relevance`).

Pagination is `page` and `size` (default 10, at most 100), and sorting is
`attribute` + `direction`, with each endpoint accepting its own list of
attributes. See [API](/docs/architecture/api/#query-parameters).
