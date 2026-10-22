---
title: File storage
description: How uploads are stored in S3 or on disk, and how browsers get them back.
sidebar:
  order: 5
---

All uploads go through the API's `/blobs` endpoints and `BlobService`
(`apps/api/src/blob/blob.service.ts`). Each endpoint stores the file under
`<directory>/<random UUID>` and answers with the file's public URL as plain
text. The web app stores that URL on the entity (e.g. `Exponat.mainImage`).

## Upload endpoints

| Endpoint | Accepts | Limit |
| -------- | ------- | ----- |
| `POST /blobs/:directory` | `image/*` | 10 MB |
| `POST /blobs/pdf/:directory` | `application/pdf` | 100 MB |
| `POST /blobs/audio/:directory/:name` | `audio/*`, only as `audio-<dir>/<id>-<12 hex>`, never replacing a file; needs the internal key | 100 MB |
| `POST /blobs/model/:directory` | any type (3D models) | 200 MB |
| `POST /blobs/video/:directory` | `video/mp4` | 200 MB |
| `GET /blobs/audio/:directory/:name` | — | URL of an existing recording, or `404` |
| `GET /blobs/file/:directory/:name` | — | Streams a locally stored file |

Every upload except audio needs a login (`JwtAuthGuard`); the browser sends
its token with uploads too. Every upload is `multipart/form-data` with the
file in the `file` field.
`:directory` is one of the `Directories` values from `@biosfera/types`
(`user`, `organisation`, `exponat`, `post`, `social-post`, `work`, `quiz`,
`question`, `category`, `blob`); audio uses `audio-<directory>`.

Profile pictures are separate: `PATCH /users/pfp` uploads and sets
`hasProfileImage`.

## Two back ends

`BlobService` picks one when it starts and logs which:

### S3 or S3-compatible

Used when `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_S3_BUCKET` are
all set.

- `AWS_ENDPOINT_URL_S3` empty means AWS itself; anything else is a
  self-hosted or third-party store. With an endpoint, path-style addressing
  (`<endpoint>/<bucket>/<key>`) is the default; override with
  `AWS_S3_FORCE_PATH_STYLE`.
- Request checksums are only sent when required: newer AWS SDKs add CRC32
  checksums that several S3-compatible stores reject.
- Returned URLs are `<AWS_S3_URL>/<key>`. Without `AWS_S3_URL` they are
  `<endpoint>/<bucket>/<key>` or `https://<bucket>.s3.<region>.amazonaws.com/<key>`.
  Set `AWS_S3_URL` when the endpoint is internal (as in compose, where the API
  writes to `http://s3:8333` but browsers read from `<PUBLIC_URL>/files`).
  In compose, Caddy forwards `/files` to `FILES_UPSTREAM` + `FILES_PREFIX`, so
  the same path works for the bundled store, another bucket or the API's disk.

The bucket must be publicly readable. The compose `s3` service configures
SeaweedFS with two identities: `api` (read/write with the key) and
`anonymous` (read-only on the bucket).

### Local disk (fallback)

Used when any of the three S3 settings is missing.

- Files are written to `UPLOAD_DIR` (default `./uploads`) as
  `<directory>/<name>`, with the MIME type kept next to it in
  `<name>.type`.
- URLs point back at the API: `<API_PUBLIC_URL>/blobs/file/<directory>/<name>`.
- `GET /blobs/file/...` streams the file with the stored content type.
- Directory and file names must match `^[\w.-]+$` and must not be `.` or
  `..`; `.type` files cannot be requested.

In compose this fallback is used only if you clear the S3 variables; the
`uploads` volume then keeps the files.

## Reading files in the web app

`next.config.js` works out the base address once, at build time, and inlines
it as `NEXT_PUBLIC_FILES_URL`:

1. `NEXT_PUBLIC_FILES_URL` if set. A path such as `/files` (the Docker
   image's default) is kept as it is and read from the page's own origin.
2. Otherwise, with no S3 settings and either `next dev` or
   `FILES_FALLBACK=local`: the API's `/blobs/file`.
3. Otherwise `AWS_S3_URL`, or the bucket's default address (same rules as the
   API).

The resulting host, if any, is allowed in `images.remotePatterns`. If it is
not HTTPS (a path included),
Next's image optimiser is disabled so the server never tries to fetch an
address only the browser can reach.

## Audio recordings

Text-to-speech output is cached as files: `ttsPrompt` in `AI.ts` names each
recording `<id>-<sha1(text) first 12 chars>` under `audio-<directory>`. It
first asks `GET /blobs/audio/...`; only if that 404s does it synthesise and
upload. Editing the text changes the hash, so a fresh recording is made.

The web server makes the audio upload while rendering a page for any
visitor, so there is no user token to send. It sends `INTERNAL_API_KEY` in
the `x-internal-key` header instead (`InternalKeyGuard`); the key stays on
the server, so browsers cannot store recordings, and without it configured
the API refuses every audio upload. The endpoint also only accepts
directories named `audio-…` and names ending in a 12-character hex hash, and
answers `409` instead of replacing an existing recording. See
[AI and speech](/docs/features/ai-and-speech/).
