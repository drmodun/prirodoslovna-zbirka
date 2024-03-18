FROM node:20-alpine AS builder
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=api --docker


# Add lockfile and package.json's of isolated subworkspace
FROM node:20-alpine AS installer
RUN apk update
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY --from=builder /app/turbo.json ./turbo.json
COPY --from=builder /app/apps/api/prisma ./prisma
RUN yarn install --frozen-lockfile


FROM node:20-alpine AS sourcer
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
COPY .gitignore .gitignore
ENV NODE_OPTIONS=--max_old_space_size=2048
RUN yarn turbo run build
FROM node:20-alpine as runner
WORKDIR /app
COPY --from=sourcer /app/ .
WORKDIR /app/apps/api/
EXPOSE 5500
CMD ["yarn", "start"]