FROM strapi/strapi as node

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003
ARG DATABASE_HOST
ARG DATABASE_USERNAME
ARG DATABASE_PASSWORD
ARG DATABASE_SSL
ARG DATABASE_SSL_SELF

FROM node as builder

COPY . .
RUN yarn install --immutable
RUN yarn build:api

ENTRYPOINT ["yarn", "start:api"]




