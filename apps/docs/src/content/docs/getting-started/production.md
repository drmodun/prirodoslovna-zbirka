---
title: Production
description: Deploying the stack behind an existing reverse proxy.
sidebar:
  order: 3
---

The production setup assumes a server that already runs a main reverse proxy
in Docker (nginx, nginx-proxy-manager, Traefik, another Caddy…). The Biosfera
stack publishes **no ports**: its own Caddy joins the main proxy's network
under the alias `biosfera`, and the main proxy holds the certificate and
forwards the site to `http://biosfera:80`.

```sh
cp .env.production.sample .env.production   # PUBLIC_URL, JWT_SECRET, INTERNAL_API_KEY, passwords, PROXY_NETWORK
docker network create proxy                 # only if the main proxy's network does not exist yet
docker compose --env-file .env.production \
  -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## What `docker-compose.prod.yml` changes

- Every long-running service gets `restart: unless-stopped`.
- `reverse-proxy` listens on plain HTTP (`SITE_ADDRESS=":80"`) and joins the
  external network `${PROXY_NETWORK:-proxy}` with the alias
  `${PROXY_ALIAS:-biosfera}`.
- The API runs with `NODE_ENV=production` and `WEB_URL=${PUBLIC_URL}`.
- The `seed` service is replaced by one that prints a refusal and exits: the
  seed wipes every table.

## Required values

Compose refuses to start unless these are set in the env file; there are no
defaults for them on purpose:

| Variable                | Used for                                             |
| ----------------------- | ---------------------------------------------------- |
| `PUBLIC_URL`            | The address people open, e.g. `https://biosfera.example.com` |
| `JWT_SECRET`            | Signing login tokens                                 |
| `INTERNAL_API_KEY`      | The web server storing text-to-speech recordings     |
| `POSTGRES_PASSWORD`     | The database                                         |
| `AWS_ACCESS_KEY_ID`     | The bundled S3 store's write key (or a real store's) |
| `AWS_SECRET_ACCESS_KEY` | Same                                                 |

`WEB_URL`, the API address (`<PUBLIC_URL>/api`), the files address
(`<PUBLIC_URL>/files`) and the docs (`<PUBLIC_URL>/docs`) all follow from
`PUBLIC_URL`.

## The main proxy

An nginx example lives in `packages/config/nginx-site.example.conf`. Two
settings matter:

- `client_max_body_size` must allow uploads of up to **200 MB** (3D models
  and videos).
- `proxy_buffering off`, because notifications are a server-sent event stream
  and buffering would hold them back.

The stack's Caddy trusts `X-Forwarded-*` headers from private networks only
(`trusted_proxies static private_ranges`).

## Other layouts

- **Main nginx on the host, not in Docker**: the Docker network is not
  reachable from it. Publish the stack's Caddy on a local port instead
  (`ports: ["127.0.0.1:8080:80"]` on `reverse-proxy`) and use
  `proxy_pass http://127.0.0.1:8080`.
- **No main proxy**: use the local compose files with
  `PUBLIC_URL=https://your.domain` and `SITE_ADDRESS=your.domain`; Caddy then
  obtains and renews the certificate itself.

## Images in the registry

The `Docker image build` workflow builds `api`, `web` and `docs` on every push
to a branch other than `master` and pushes them to GitHub Container Registry
as `ghcr.io/<repo>-<app>:<sha>` and `:unstable`.
