# Build from the repo root: docker build -f apps/docs/Dockerfile .
FROM node:22-bookworm-slim AS base
WORKDIR /app

# Reduce the monorepo to the docs workspace and what it depends on.
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2 prune docs --docker

FROM base AS builder
# Manifests and lockfile only, so the install layer survives source edits.
# No install scripts: the site needs none, and the root devDependencies would
# otherwise download Prisma's engines for nothing.
COPY --from=pruner /app/out/json/ .
RUN yarn install --frozen-lockfile --ignore-scripts
COPY --from=pruner /app/out/full/ .
# Absolute links (sitemap, canonical URLs) are built from it.
ARG PUBLIC_URL=http://localhost
ENV PUBLIC_URL=$PUBLIC_URL \
  ASTRO_TELEMETRY_DISABLED=1
RUN yarn turbo run build --filter=docs

# A static site: Caddy serves it, under /docs like the build expects.
FROM caddy:2 AS runner
COPY apps/docs/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/apps/docs/dist /srv/docs
EXPOSE 80
