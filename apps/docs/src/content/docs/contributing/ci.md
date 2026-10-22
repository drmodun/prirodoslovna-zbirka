---
title: Continuous integration
description: The GitHub Actions workflows and what each one checks.
sidebar:
  order: 2
---

Three workflows live in `.github/workflows`.

## `ci.yml`: CI

Runs on every push, on pull requests to `master`, and on demand. A newer push
to the same ref cancels the older run. Actions are pinned by commit SHA.

| Job | What it does |
| --- | ------------ |
| **Lint, type-check and build** | `yarn install --frozen-lockfile`, `yarn lint:check`, `yarn type-check`, `yarn build` (every workspace, the docs included) |
| **Unit tests (API and web)** | Builds `@biosfera/types`, runs `prisma generate`, then `yarn workspace api test:ci` and `yarn workspace web test:ci` |
| **API integration tests** | A `postgres:15` service container with `biosfera_test`; runs `yarn workspace api test:integration` with `TEST_DATABASE_URL` |
| **End-to-end tests** | Postgres service, `yarn workspace e2e build:stack`, `playwright install --with-deps chromium`, `yarn workspace e2e test` |

Node comes from `.nvmrc` (22) with the Yarn cache enabled.

## `docker-image.yml`: Docker images

Builds `api`, `web`, `docs` (from `apps/<app>/Dockerfile`) and `piper`
(`docker/piper`) for `linux/amd64` and `linux/arm64`, each on a native runner
with its own GitHub Actions cache scope. On pushes to `master`, `v*` tags and
manual runs it publishes them to GitHub Container Registry as one
multi-platform image per app:

| Trigger         | Tags                                  |
| --------------- | ------------------------------------- |
| push to master  | `latest`, `<commit sha>`              |
| tag `v1.2.3`    | `1.2.3`, `1.2`, `<commit sha>`        |
| manual run      | `<branch>`, `<commit sha>`            |

```text
ghcr.io/<owner>/<repo>-<app>:<tag>
```

Pull requests build every image without publishing. The `compose-smoke` job
then validates both compose files, starts the local stack, loads the seed and
runs `docker/smoke-test.sh` (home page, `/api`, `/docs`, login, an upload read
back through `/files`), then runs the same images through
`docker-compose.prod.yml` (`proxy-host` profile) and repeats the test.

The docs image bakes `PUBLIC_URL` into its sitemap; set it as a repository
variable to the production address.

## `bump.yml`: API documentation on Bump.sh

On pushes to `main` / `master` it deploys `doc/api-documentation.yml` to
Bump.sh as `biosfera-api`; on pull requests it comments the API diff. It
needs the `BUMP_TOKEN` secret and expects that file to exist in the
repository.
