FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS dependencies

RUN npm ci

FROM dependencies AS build

COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
COPY node-pg-migrate.config.js ./

RUN npm run build

FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
