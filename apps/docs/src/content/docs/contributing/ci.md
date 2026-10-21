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

## `docker-image.yml`: Docker image build

On pushes to any branch except `master`, and on demand. A matrix builds
`api`, `web` and `docs` from `apps/<app>/Dockerfile` with Buildx (GitHub
Actions cache, one scope per app) and pushes to GitHub Container Registry:

```text
ghcr.io/<owner>/<repo>-<app>:<commit sha>
ghcr.io/<owner>/<repo>-<app>:unstable
```

## `bump.yml`: API documentation on Bump.sh

On pushes to `main` / `master` it deploys `doc/api-documentation.yml` to
Bump.sh as `biosfera-api`; on pull requests it comments the API diff. It
needs the `BUMP_TOKEN` secret and expects that file to exist in the
repository.
