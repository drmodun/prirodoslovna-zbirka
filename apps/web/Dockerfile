# Build from the repo root: docker build -f apps/web/Dockerfile .
FROM node:22-bookworm-slim AS base
WORKDIR /app

# Reduce the monorepo to the web workspace and what it depends on.
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2 prune web --docker

FROM base AS builder
# Manifests and lockfile only, so the install layer survives source edits.
COPY --from=pruner /app/out/json/ .
RUN yarn install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG WEB_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:5500
ENV WEB_URL=$WEB_URL \
  NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
  NEXT_OUTPUT=standalone \
  NEXT_TELEMETRY_DISABLED=1
RUN yarn turbo run build --filter=web

FROM base AS runner
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  HOSTNAME=0.0.0.0 \
  PORT=3000
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
