---
title: Production
description: Running the published images on one server, with or without a reverse proxy in front.
sidebar:
  order: 3
---

Production runs `docker-compose.prod.yml` on its own. It pulls the images the
[`docker-image.yml` workflow](/docs/contributing/ci/) publishes and builds
nothing, so the server needs Docker, that file, `packages/config/Caddyfile`
and an env file. A clone of the repository is the simplest way to have all
three.

```sh
cp .env.production.sample .env.production   # PUBLIC_URL, secrets, COMPOSE_PROFILES
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

For a first deployment from an empty server (DNS, firewall, first
administrator, backups), follow the [hosting guide](/docs/getting-started/hosting-guide/).

Updating is the same `pull` and `up -d`. The API applies pending migrations
when it starts. `IMAGE_TAG` picks the version: `latest` follows `master`, a
release tag (`1.4.0`) or a commit SHA pins it.

:::note[Private packages]
GitHub creates container packages as private. Either make the four
`<repo>-api`, `-web`, `-docs` and `-piper` packages public in the package
settings, or log the server in once with
`docker login ghcr.io -u <user>` and a token with `read:packages`.
:::

## Choosing what runs

`COMPOSE_PROFILES` in the env file decides which containers start. The
default, `db,s3,tts,caddy`, is the whole stack on its own.

| Profile         | Starts                    | Without it                                                        |
| --------------- | ------------------------- | ----------------------------------------------------------------- |
| `db`            | Postgres                  | Set `DATABASE_URL` to your own database                           |
| `s3`            | SeaweedFS (S3)            | Set the `AWS_*` variables and `FILES_UPSTREAM`, or keep files on disk |
| `tts`           | Piper text-to-speech      | Set `TTS_URL=` (empty) or point it at another Piper server         |
| `caddy`         | Caddy on ports 80 and 443 | One of the two below                                              |
| `proxy-host`    | Caddy on `127.0.0.1:8080` | One of the others                                                 |
| `proxy-network` | Caddy on the main proxy's Docker network | One of the others                                  |

`api`, `web` and `docs` always run. There is no bundled mail server in
production: set `SMTP_URL` or `SENDGRID_API_KEY`, otherwise activation links
only appear in the API log. The mock-data seed is not part of the file,
because it wipes the database.

## The way in

The stack always answers through its own Caddy, which routes `/api`, `/files`
and `/docs` (see [Docker](/docs/getting-started/docker/)). The three proxy
profiles are the same Caddy, published differently. Enable exactly one.

**`caddy`: nothing in front.** Caddy is the public server. It takes its site
address from `PUBLIC_URL` (or `SITE_ADDRESS`), obtains a certificate and
renews it. Ports 80 and 443 have to be free and reachable from the internet.
`HTTP_PORT` and `HTTPS_PORT` move them, which only makes sense behind
something that forwards those ports.

**`proxy-host`: a proxy on the host itself** (nginx, Apache, an existing
Caddy). Caddy listens on plain HTTP at `PROXY_BIND:PROXY_PORT`,
`127.0.0.1:8080` by default, and the main proxy forwards the site there with
`proxy_pass http://127.0.0.1:8080`.

**`proxy-network`: a proxy running in Docker** (nginx, Traefik,
nginx-proxy-manager). Caddy joins the external network `PROXY_NETWORK`
(`proxy`) as `PROXY_ALIAS` (`biosfera`), and nothing is published on the
host. Create the network first if your proxy does not have one:
`docker network create proxy`. The main proxy forwards the site to
`http://biosfera:80`.

In the last two, the main proxy holds the certificate. An nginx site for
either is in `packages/config/nginx-site.example.conf`. Two of its settings
matter:

- `client_max_body_size` must allow uploads of up to **200 MB** (3D models
  and videos).
- `proxy_buffering off`, because notifications are a server-sent event stream
  and buffering would hold them back.

The stack's Caddy trusts `X-Forwarded-*` headers from private networks only
(`trusted_proxies static private_ranges`).

## Required values

| Variable            | Used for                                                     |
| ------------------- | ------------------------------------------------------------ |
| `PUBLIC_URL`        | The address people open, e.g. `https://biosfera.example.com` |
| `JWT_SECRET`        | Signing login tokens                                         |
| `INTERNAL_API_KEY`  | The web server storing text-to-speech recordings             |
| `POSTGRES_PASSWORD` | The bundled database (or set `DATABASE_URL` instead)         |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | The bundled S3 store (`s3` profile), or your own store |

Compose refuses to start without the first four. The `s3` container exits
with a message when its keys are missing.

`WEB_URL`, the address of the API (`<PUBLIC_URL>/api`) and the files
(`<PUBLIC_URL>/files`) follow from `PUBLIC_URL`. The web image itself holds
no address: it calls `/api` and `/files` on whatever origin the page was
opened at, so one image serves any domain.

## File storage options

Browsers always read files at `<PUBLIC_URL>/files`. Caddy forwards that path
to `FILES_UPSTREAM` + `FILES_PREFIX`:

| Storage                     | API settings                                                       | `FILES_UPSTREAM`                                   | `FILES_PREFIX` |
| --------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- | -------------- |
| Bundled SeaweedFS (`s3`)    | keys only                                                          | `s3:8333` (default)                                | `/<bucket>` (default) |
| AWS S3                      | keys, `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ENDPOINT_URL_S3=`        | `https://<bucket>.s3.<region>.amazonaws.com`       | empty          |
| Other S3 (R2, MinIO, …)     | keys, `AWS_S3_BUCKET`, `AWS_ENDPOINT_URL_S3`                       | the bucket's public address                        | empty, or `/<bucket>` |
| None: the API's disk        | keys cleared (`AWS_ACCESS_KEY_ID=`, `AWS_SECRET_ACCESS_KEY=`)      | `api:5500`                                         | `/blobs/file`  |

To have browsers load files straight from a bucket or CDN instead, set
`AWS_S3_URL` for the API and build the web image yourself with
`NEXT_PUBLIC_FILES_URL` set to that address.

## Logs, restarts and backups

Every service restarts `unless-stopped`, and every log is capped at three
10 MB files. `docker/backup.sh` dumps the bundled database and archives the
uploaded files; scheduling it, copying the backups off the server and
restoring are in the [hosting guide](/docs/getting-started/hosting-guide/#8-back-up).
