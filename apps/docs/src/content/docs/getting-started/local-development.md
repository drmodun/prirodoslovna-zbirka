---
title: Local development
description: Run the API, the web app and the docs from source with hot reload.
sidebar:
  order: 1
---

Running from source gives you hot reload for both apps. If you only want to
use or demo the platform, [Docker Compose](/docs/getting-started/docker/) is
quicker.

## Requirements

- **Node.js 22** (`.nvmrc`). The apps themselves accept Node 20+, but the docs
  site (Astro 7) needs 22.22 or newer.
- **Yarn 1** (`packageManager: yarn@1.22.22`).
- **PostgreSQL** 15 or newer. Any instance works. The compose stack's
  database is published on port `5433` if you want to borrow it.

## First run

```sh
cp .env.sample .env        # set DATABASE_URL and JWT_SECRET
yarn install
yarn workspace api migrate # apply the Prisma migrations
yarn workspace api seed    # optional: mock data (wipes existing data!)
yarn dev
```

`yarn dev` runs `turbo run dev` with the root `.env` loaded, which starts:

| App  | Address                 | Notes                                    |
| ---- | ----------------------- | ---------------------------------------- |
| API  | http://localhost:5500   | Swagger UI at `/api`, JSON at `/api-json` |
| Web  | http://localhost:3000   | Next.js dev server                       |
| Docs | http://localhost:4321/docs | This site, Astro dev server           |

Turbo builds `@biosfera/types` first (`dependsOn: ["^build"]`), since both
apps import its compiled output.

:::caution[The seed deletes everything]
`yarn workspace api seed` truncates every table before it loads the fixture
data in `apps/api/prisma/seed.ts` (a generated file of about 230k lines). It
also creates a development login: `dev@biosfera.local` / `biosfera123`, a
`SUPER` user who owns the first organisation.
:::

## The `.env` file

Both apps read the one `.env` in the repository root. Only four values are
required:

```ini
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/biosfera
JWT_SECRET=change-me
WEB_URL=http://localhost:3000
```

Everything else is optional and falls back to something that works offline;
see [Configuration](/docs/getting-started/configuration/).

## Everyday commands

Run from the repository root:

| Command           | What it does                                       |
| ----------------- | -------------------------------------------------- |
| `yarn dev`        | All apps in watch mode                             |
| `yarn build`      | Production build of every workspace                |
| `yarn lint`       | ESLint with `--fix`                                |
| `yarn lint:check` | ESLint without fixing (what CI runs)               |
| `yarn type-check` | `tsc --noEmit` per workspace                       |
| `yarn format`     | Prettier over `**/*.{ts,tsx,md}`                   |

Per workspace:

```sh
yarn workspace api prisma studio     # browse the database
yarn workspace api migrate           # create/apply a migration after editing schema.prisma
yarn workspace api test              # API unit tests
yarn workspace web test              # web unit tests
yarn workspace docs dev              # just the docs
```

See [Testing](/docs/contributing/testing/) for the integration and
end-to-end suites.

## Adding dependencies

Edit the workspace's `package.json` and run `yarn install` **at the
repository root**. `yarn workspace <name> add …` rewrites `yarn.lock` without
the root `resolutions` (security pins for `body-parser`, `multer`, `tar`,
`qs`, `lodash` and others), silently undoing them.
