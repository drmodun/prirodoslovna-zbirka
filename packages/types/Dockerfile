FROM node:20-alpine AS builder
RUN apk update
# Set working directory
WORKDIR /app
COPY . .


# Add lockfile and package.json's of isolated subworkspace

FROM node:20-alpine AS sourcer
WORKDIR /app
#COPY --from=builder /app/packages/types/index .
COPY .gitignore .gitignore
RUN yarn turbo run build

FROM node:20-alpine as runner
WORKDIR /app
COPY --from=sourcer /app/ .
CMD [ "yarn", "dev" ]
