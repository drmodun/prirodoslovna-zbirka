# Build from the repo root: docker build -f apps/api/Dockerfile .
FROM node:22-bookworm-slim AS base
# Prisma's query engine needs OpenSSL at runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Reduce the monorepo to the api workspace and what it depends on.
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2 prune api --docker

FROM base AS builder
# Manifests and lockfile only, so the install layer survives source edits.
COPY --from=pruner /app/out/json/ .
RUN yarn install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN yarn turbo run build --filter=api

# One-shot: wipes the database and loads the mock data.
# docker compose run --rm seed
FROM builder AS seed
WORKDIR /app/apps/api
ENV NODE_ENV=development
CMD ["yarn", "prisma", "db", "seed"]

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/ .
WORKDIR /app/apps/api
# Local file storage, used when S3 is not configured. Created here so a
# volume mounted on it starts out writable by the node user.
RUN mkdir uploads && chown node:node uploads
USER node
EXPOSE 5500
CMD ["sh", "-c", "yarn prisma migrate deploy && node dist/main"]
