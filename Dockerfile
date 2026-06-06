# Production build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || yarn || pnpm i

FROM node:20-alpine AS builder
WORKDIR /app
ARG DATABASE_URL=file:/tmp/subkeeper-build.db
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN mkdir -p public
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Ensure a writable HOME for npm to place cache/logs (prevents writing to /.npm)
ENV HOME=/tmp
ENV NPM_CONFIG_CACHE=$HOME/.npm
ENV DATABASE_URL=file:/var/data/subkeeper.db
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
RUN mkdir -p /var/data
RUN mkdir -p $NPM_CONFIG_CACHE && chmod -R 0777 $NPM_CONFIG_CACHE || true
EXPOSE 10000
CMD ["sh","-c","node scripts/ensure-sqlite-schema.mjs && sh ./scripts/start.sh"]
