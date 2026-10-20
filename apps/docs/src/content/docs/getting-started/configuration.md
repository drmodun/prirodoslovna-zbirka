---
title: Configuration
description: Every environment variable, which app reads it, and the fallback when it is empty.
sidebar:
  order: 4
---

Both apps read the root `.env` (`yarn dev` loads it with `dotenv-cli`; the API
scripts use `dotenv -e ../../.env`). Under Docker Compose the same names are
passed through `docker-compose.yml`. The annotated templates are `.env.sample`
and `.env.production.sample`.

The API validates its variables at start-up with Joi
(`apps/api/src/config/environment-variables.ts`): it will not boot without
`DATABASE_URL` and `JWT_SECRET`, and `AWS_S3_FORCE_PATH_STYLE` must be empty,
`true` or `false`.

:::tip[Build time vs run time]
Values marked **build** are inlined into the web bundle by `next build`
(`next.config.js` and the web `Dockerfile`'s `ARG`s). Changing them means
rebuilding the web app or image. Everything else is read when the process
starts.
:::

## Required

| Variable       | Read by  | Meaning |
| -------------- | -------- | ------- |
| `DATABASE_URL` | API      | Postgres connection string used by Prisma |
| `JWT_SECRET`   | API      | Secret for signing login tokens (valid 24 h) |
| `WEB_URL`      | API, web (build) | Public address of the web app; used in email and notification links. Defaults to `http://localhost:3000` |
| `NODE_ENV`     | both     | `development` also allows `yarn workspace api seed` |

## Addresses

| Variable              | Read by     | Default / fallback |
| --------------------- | ----------- | ------------------ |
| `NEXT_PUBLIC_API_URL` | web (build) | `http://localhost:5500`, or `${WEB_URL}/api` when `WEB_URL` is not the local default |
| `API_INTERNAL_URL`    | web (run)   | Where **server-side** code reaches the API (`http://api:5500` in compose). Falls back to the public address |
| `API_PUBLIC_URL`      | API         | Base for links to locally stored files: `${API_PUBLIC_URL}/blobs/file/…`. Defaults to `http://localhost:5500` |
| `PORT`                | API         | Listening port, `5500` |

The web app resolves the API address in `apps/web/src/app/api/getUrlServer.ts`:
the browser always uses the public address, server components use
`API_INTERNAL_URL` when set. All server-side calls go through `apiFetch`,
which takes path segments rather than URLs and encodes each one, so an id
coming from a route cannot redirect the request to another host or endpoint.

## File storage

Uploads go to S3 or any S3-compatible store (SeaweedFS, Garage, MinIO, R2…)
when the key, secret and bucket are all set. Otherwise the API writes files
to disk and serves them itself. See [File storage](/docs/architecture/file-storage/).

| Variable                  | Read by          | Default / fallback |
| ------------------------- | ---------------- | ------------------ |
| `AWS_ACCESS_KEY_ID`       | API              | — (S3 disabled while empty) |
| `AWS_SECRET_ACCESS_KEY`   | API              | — |
| `AWS_S3_BUCKET`           | API, web (build) | — |
| `AWS_REGION`              | API, web (build) | `eu-north-1`; self-hosted stores usually accept anything |
| `AWS_ENDPOINT_URL_S3`     | API, web (build) | Empty means AWS. For other stores, the address the API reaches them at |
| `AWS_S3_FORCE_PATH_STYLE` | API              | `true` when an endpoint is set (`<endpoint>/<bucket>`), else `false` |
| `AWS_S3_URL`              | API, web (build) | Address browsers read files from. Defaults to `<endpoint>/<bucket>` or the bucket's AWS address |
| `UPLOAD_DIR`              | API              | Local fallback directory, `uploads` relative to the API's working directory |
| `NEXT_PUBLIC_FILES_URL`   | web (build)      | Overrides where the web app reads files from |
| `FILES_FALLBACK`          | web (build)      | `local` makes a production build read files from the API (the compose build sets it) |

The bucket must allow anonymous reads: browsers load images directly from it.

## Email

Account activation and password reset mails. SMTP wins if both are set.

| Variable           | Example / default |
| ------------------ | ----------------- |
| `SMTP_URL`         | `smtp://user:pass@mail.example.com:587` (STARTTLS), `smtps://…:465` (TLS) |
| `SENDGRID_API_KEY` | A SendGrid key |
| `MAIL_FROM`        | Sender, defaults to `biosfera.trema@gmail.com`. Must be an address the server may send as |

Gmail works over SMTP with an app password (requires 2-step verification):
`smtp://name%40gmail.com:app-password@smtp.gmail.com:587`, with `@` written
as `%40` and `MAIL_FROM` set to the same address.

**Fallback**: the message, including its link, is written to the API log.

## AI text and speech to text

Read by the web server (Next.js server actions in `apps/web/src/app/api/AI.ts`).
Works with any OpenAI-compatible API: OpenAI, OpenRouter, Groq, Mistral, or
a local server such as Ollama (`OPENAI_BASE_URL=http://localhost:11434/v1`, no
key needed).

| Variable                     | Default |
| ---------------------------- | ------- |
| `OPENAI_API_KEY`             | — |
| `OPENAI_BASE_URL`            | `https://api.openai.com/v1`. Setting it alone enables AI (for keyless local servers) |
| `OPENAI_MODEL`               | `gpt-3.5-turbo-0125` |
| `OPENAI_TRANSCRIPTION_MODEL` | `whisper-1`. Set it to an empty value for providers without transcription |

**Fallbacks**: exponat descriptions come from the Wikipedia lead paragraph
(Croatian, then English); post summaries are the opening sentences of the
post; voice input uses the browser's speech recognition.

## Text to speech

| Variable               | Meaning |
| ---------------------- | ------- |
| `TTS_URL`              | A Piper HTTP server (`docker/piper`); wins over Google. Compose sets `http://piper:5000` |
| `GOOGLE_CLOUD_API_KEY` | Google Cloud Text-to-Speech, voice `sr-RS-Standard-A` |

**Fallback**: the play button reads the text with the browser's speech
synthesis.

## Docker Compose only

| Variable            | Default | Meaning |
| ------------------- | ------- | ------- |
| `PUBLIC_URL`        | `http://localhost` | The address people open. `WEB_URL`, `<PUBLIC_URL>/api`, `<PUBLIC_URL>/files` follow from it. Also the docs' `site` |
| `SITE_ADDRESS`      | `:80`   | What Caddy listens on; a domain name makes it fetch a certificate |
| `POSTGRES_PASSWORD` | `postgres` | Applied only when the database volume is first created |
| `PIPER_VOICE`       | `sr_RS-serbski_institut-medium` | Piper voice baked into the image |
| `PROXY_NETWORK`, `PROXY_ALIAS` | `proxy`, `biosfera` | Production: the main proxy's network and this stack's name on it |
| `*_PORT`            | see [Docker Compose](/docs/getting-started/docker/#files) | Published ports in local mode |
