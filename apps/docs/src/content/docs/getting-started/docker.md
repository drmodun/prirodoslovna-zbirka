---
title: Docker Compose
description: The whole stack on one address, with no .env file and no external accounts.
sidebar:
  order: 2
---

The compose files run everything Biosfera needs, including stand-ins for the
cloud services. No `.env` is required; if one exists, its values win over the
defaults in `docker-compose.yml`.

```sh
docker compose up -d --build   # then open http://localhost
docker compose run --rm seed   # wipe the database and load mock data
```

The seed adds a development login, `dev@biosfera.local` / `biosfera123`
(a `SUPER` user who owns the first organisation).

## Services

| Service         | Image / build                 | Role                                                                    |
| --------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `reverse-proxy` | `caddy:2`                     | The single public address; routes by path (below)                       |
| `web`           | `apps/web/Dockerfile`         | Next.js standalone server on `:3000`                                    |
| `api`           | `apps/api/Dockerfile`         | NestJS on `:5500`; runs `prisma migrate deploy` before starting         |
| `docs`          | `apps/docs/Dockerfile`        | This site, built statically and served by Caddy on `:80`                |
| `postgres`      | `postgres:15`                 | Database `biosfera`, volume `db_data`                                   |
| `s3`            | `chrislusf/seaweedfs`         | S3-compatible file store; anonymous reads, the API writes with a key    |
| `s3-init`       | `chrislusf/seaweedfs`         | One-shot: creates the bucket, then exits                                |
| `piper`         | `docker/piper/Dockerfile`     | Text to speech, Serbian voice (`PIPER_VOICE`)                           |
| `seed`          | `apps/api/Dockerfile` (`seed`)| Profile `seed`: wipes and fills the database                            |
| `mailpit`       | `axllent/mailpit`             | Profile `mail`: catches outgoing mail                                   |

Start-up order is enforced with health checks: `postgres` and `s3` become
healthy, `s3-init` finishes, then `api` starts and answers `/api-json`, and
only then do `web` and `seed` start.

### Routing

`packages/config/Caddyfile` gives the stack one origin:

| Path        | Goes to                                   |
| ----------- | ----------------------------------------- |
| `/api/*`    | `api:5500`, prefix stripped               |
| `/files/*`  | the `s3` bucket, rewritten to `/<bucket>/…` |
| `/docs/*`   | `docs:80`, prefix kept                    |
| everything else | `web:3000`                            |

Because the web app, the API and uploaded files share one origin, nothing
needs CORS and the browser never sees an internal host name.

## Files

- `docker-compose.yml` is the shared base. It publishes **no** ports.
- `docker-compose.override.yml` is picked up automatically by `docker compose`
  and publishes ports for local work.
- `docker-compose.prod.yml` replaces the override in
  [production](/docs/getting-started/production/).

Ports published by the override, each changeable with a variable:

| Port | Service        | Variable          |
| ---- | -------------- | ----------------- |
| 80   | reverse proxy  | `PROXY_PORT`      |
| 443  | reverse proxy  | `PROXY_TLS_PORT`  |
| 3000 | web            | `WEB_PORT`        |
| 5500 | api (Swagger at `/api`) | `API_PORT` |
| 4321 | docs (at `/docs`) | `DOCS_PORT`    |
| 5433 | postgres       | `POSTGRES_PORT`   |
| 8025 | mailpit        | `MAILPIT_PORT`    |

## Trying out email

Without mail settings the API writes every message, including activation
links, to its log (`docker compose logs api`). To see real messages, run
Mailpit and point the API at it:

```sh
SMTP_URL=smtp://mailpit:1025 docker compose --profile mail up -d
```

The inbox is at http://localhost:8025.

## Values baked in at build time

The web image inlines `NEXT_PUBLIC_*` values, `WEB_URL` and the file
addresses into its client bundle, and the docs image builds its absolute
links from `PUBLIC_URL`. After changing `PUBLIC_URL` (or any of the address
variables), rebuild:

```sh
docker compose up -d --build web docs
```

## Swapping in real services

Every bundled stand-in can be replaced from the env file:

- **Files**: set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`
  and, for AWS itself, clear the bundled endpoint with `AWS_ENDPOINT_URL_S3=`
  and `AWS_S3_URL=`. The S3 variables use `${VAR-default}`, so an empty value
  really clears them instead of falling back.
- **Mail**: `SMTP_URL` or `SENDGRID_API_KEY`.
- **AI**: `OPENAI_API_KEY` and optionally `OPENAI_BASE_URL` / `OPENAI_MODEL`.
- **Speech**: `TTS_URL` (defaults to the bundled Piper) or
  `GOOGLE_CLOUD_API_KEY` with `TTS_URL=`.

Details for each are on the [Configuration](/docs/getting-started/configuration/)
page.
