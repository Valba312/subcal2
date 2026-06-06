# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Set npm cache to /tmp to avoid permission issues
ENV npm_config_cache=/tmp/.npm
ENV HOME=/tmp

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Set DATABASE_URL for build process
ENV DATABASE_URL=file:/tmp/build.db

# Build prisma and next
RUN npm run prisma:generate
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Essential environment variables
ENV NODE_ENV=production
ENV npm_config_cache=/tmp/.npm
ENV HOME=/tmp
ENV PORT=3000
ENV DATABASE_URL=file:/var/data/subkeeper.db

# Create necessary directories
RUN mkdir -p /tmp/.npm /var/data && chmod -R 0777 /tmp/.npm /var/data

# Copy from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start command - simple and direct
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
