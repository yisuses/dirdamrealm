FROM node:18-alpine as node

ENV NODE_ENV=production
ENV PORT=3003
ARG DATABASE_HOST
ARG DATABASE_USERNAME
ARG DATABASE_PASSWORD
ARG DATABASE_SSL
ARG DATABASE_SSL_SELF

FROM node as builder

WORKDIR /app
COPY . .
RUN yarn install --immutable
RUN yarn build:dep:api

FROM node

WORKDIR /app
COPY --from=builder /app/dist/api /app




