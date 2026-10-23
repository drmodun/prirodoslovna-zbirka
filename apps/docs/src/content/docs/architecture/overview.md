---
title: Overview
description: The monorepo, its workspaces and how a request travels through the stack.
sidebar:
  order: 1
---

Biosfera is a TypeScript monorepo managed with **Yarn 1 workspaces** and
**Turborepo**. The root `package.json` is named `biosfera`.

```text
prirodoslovna-zbirka/
├── apps/
│   ├── api/        NestJS 11 + Prisma 5 on Postgres         (entry: src/main.ts)
│   ├── web/        Next.js 15 app router, React 18, MUI/Joy (entry: src/app/layout.tsx)
│   ├── e2e/        Playwright suite against the built stack
│   └── docs/       This Astro Starlight site
├── packages/
│   ├── types/      @biosfera/types: DTOs, enums, response shapes, query helpers
│   ├── config/     Caddyfile, nginx example, ESLint preset, Tailwind/PostCSS config
│   └── tsconfig/   Shared tsconfig bases (base, nextjs, nestjs, library)
├── docker/piper/   Text-to-speech image
└── docker-compose*.yml
```

## How the pieces talk

```text
                 ┌──────────────── Caddy (reverse-proxy) ────────────────┐
 browser ──────▶ │ /api/*  → api:5500   /files/* → s3:8333   /docs/* → docs │
                 │ everything else → web:3000                             │
                 └────────────────────────────────────────────────────────┘
                         │                    ▲
       server components │ API_INTERNAL_URL   │ axios from the browser,
       & server actions  ▼                    │ Bearer token from localStorage
                 ┌──────────────┐        ┌──────────────┐
                 │   web (Next) │──────▶ │  api (Nest)  │──▶ Postgres (Prisma)
                 └──────────────┘        └──────────────┘──▶ S3 / local disk
                   │  │                         │        ──▶ SMTP / SendGrid
                   │  └─▶ OpenAI-compatible API └─ SSE ──▶ browser notifications
                   └────▶ Piper / Google TTS, GBIF, Wikipedia
```

- The **browser** calls the API directly with axios (`apps/web/src/app/api/shared.ts`),
  attaching the JWT stored in `localStorage` under `access_token`.
- **Server components** fetch through `apiFetch` (`getUrlServer.ts`), using
  the in-network address when `API_INTERNAL_URL` is set.
- **External data** that is not ours (GBIF taxonomy, occurrence maps and
  literature, Wikipedia summaries, AI completions, speech) is fetched by the
  web app, not the API. The API only owns Biosfera's own data, files and mail.

## The shared types package

`packages/types` is imported by both apps (40 import sites in the API, about
120 in the web app). It holds:

- **Enums** mirroring the Prisma enums (`Role`, `MemberRole`, `ExponatKind`,
  `County`, `NotificationType`, `WorkType`, …) plus Croatian display labels
  and `getEnumValue` helpers. The web app labels enums from its own messages
  instead (see [Translations](/docs/architecture/web/#translations)).
- **DTO factories** such as `getCreateExponatDto(ApiProperty?)`. Each returns
  a `class-validator`-decorated class. The API passes Swagger's
  `ApiProperty` so the class is documented; the web app calls it without one
  and uses the same validation rules client side.
- **Response shapes** (`ExponatResponseShort`, `ExtendedUserResponse`, …) so
  both sides agree on what endpoints return.
- **Query helpers**: sorting enums and the Prisma `orderBy` builders such as
  `worksSortQueryBuilder`.

The package is compiled with `tsc` to `dist/` (CommonJS, used by the API) and
also exports its sources for the Next.js build (`transpilePackages`). Turbo
builds it before any app task.

## Build pipeline

`turbo.json` declares `build`, `dev`, `lint`, `lint:check` and `type-check`,
all depending on `^build` (dependencies first). Environment variables that
change the build output are listed in `globalEnv` so that they bust the
cache; secrets are in `globalPassThroughEnv` so they reach tasks without
affecting cache keys.

Every Dockerfile follows the same shape: `turbo prune <app> --docker`, install
from the pruned manifests only (so the dependency layer survives source
edits), copy the sources, `turbo run build --filter=<app>`.

## Where to read next

- [API](/docs/architecture/api/): modules, request pipeline, auth, query parameters.
- [Web app](/docs/architecture/web/): routing, data fetching, contexts.
- [Data model](/docs/architecture/data-model/): the Prisma schema.
- [File storage](/docs/architecture/file-storage/): uploads and how they are served.
