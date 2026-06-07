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
ENV DATABASE_URL=postgresql://subkeeper:subkeeper@localhost:5432/subkeeper?schema=public

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
ENV PORT=10000
ENV DATABASE_URL=postgresql://subkeeper:subkeeper@db:5432/subkeeper?schema=public

# Create necessary directories
RUN mkdir -p /tmp/.npm && chmod -R 0777 /tmp/.npm

# Copy from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Ensure scripts are executable
RUN chmod +x ./scripts/start.sh

# Expose port (match Amvera runtime)
EXPOSE 10000

# Start command - simple and direct
CMD ["sh", "./scripts/start.sh"]
