---
title: Working on these docs
description: How the documentation site is built, served and extended.
sidebar:
  order: 3
---

This site is an [Astro Starlight](https://starlight.astro.build/) project in
`apps/docs`, a workspace like the others.

```sh
yarn workspace docs dev       # http://localhost:4321/docs, hot reload
yarn workspace docs build     # static site in apps/docs/dist
yarn workspace docs preview   # serve the build
```

It needs Node 22.22 or newer (Astro 7).

## Layout

```text
apps/docs/
├── astro.config.mjs          site, base path, sidebar
├── src/content/docs/         one Markdown/MDX file per page
│   ├── index.mdx             landing page
│   ├── getting-started/
│   ├── architecture/
│   ├── features/
│   ├── reference/
│   └── contributing/
├── src/styles/theme.css      accent colours
├── public/                   favicon and other static files
├── Dockerfile, Caddyfile     the production image
```

The sidebar is generated from the folders; set `sidebar.order` in a page's
frontmatter to place it. Every page needs a `title` and should have a
`description`.

## The `/docs` base path

The site is built with `base: "/docs"` so it can share an origin with the
web app. Starlight does not rewrite links in Markdown, so **write internal
links with the prefix**: `[Docker](/docs/getting-started/docker/)`.

`site` comes from `PUBLIC_URL` (default `http://localhost`) and is used for
the sitemap and canonical URLs.

## In Docker

`apps/docs/Dockerfile` prunes the monorepo to the docs workspace, builds the
static site and copies it into a `caddy:2` image under `/srv/docs`; the
Caddyfile next to it serves `/srv` and answers unknown paths with the
site's 404 page. The stack's reverse proxy forwards `/docs/*` to it
unchanged, and the local override also publishes it on `DOCS_PORT` (4321),
at http://localhost:4321/docs.

## Writing guidelines

- Describe what the code **does**, not what it was meant to do. Where those
  differ, say so in a `:::caution[Current behaviour]` aside and link to
  [Known issues](/docs/reference/known-issues/).
- Name the file or symbol a statement comes from, so a reader can check it
  and a maintainer can tell when it goes stale.
- When a change alters behaviour described here, update the page in the same
  pull request.
