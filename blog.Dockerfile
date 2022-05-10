FROM node:18-alpine as node

ENV NODE_ENV=production
ENV PORT=3000

FROM node as builder

WORKDIR /app
COPY . .
RUN yarn install --immutable
RUN yarn build:dep:blog

FROM node

WORKDIR /app
COPY --from=builder /app/dist/blog /app
COPY .yarn /app/.yarn
COPY .yarnrc.yml /app



