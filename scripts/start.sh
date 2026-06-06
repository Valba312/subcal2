#!/bin/sh
set -e

# Set environment variables
export HOME=${HOME:-/tmp}
export NPM_CONFIG_CACHE=${NPM_CONFIG_CACHE:-/tmp/.npm}
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export DATABASE_URL=${DATABASE_URL:-file:/var/data/subkeeper.db}
export NEXT_TELEMETRY_DISABLED=1

echo "=== SubKeeper Startup ==="
echo "NODE: $(node --version)"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "========================="

# Create necessary directories
mkdir -p "$HOME" "$NPM_CONFIG_CACHE" /var/data 2>/dev/null || true

# Create .env file
if [ ! -f ".env" ]; then
  cat > .env << EOF
DATABASE_URL=$DATABASE_URL
NODE_ENV=$NODE_ENV
NEXT_TELEMETRY_DISABLED=1
EOF
fi

# Build if needed
if [ ! -f ".next/BUILD_ID" ]; then
  echo "Building application..."
  npm run build
fi

# Extract database path from DATABASE_URL
DB_PATH=$(echo "$DATABASE_URL" | sed 's/^file://')

# Initialize database if it doesn't exist
if [ ! -f "$DB_PATH" ]; then
  echo "Initializing database..."
  # Just create the file - Prisma will initialize the schema when needed
  touch "$DB_PATH"
  chmod 0666 "$DB_PATH"
fi

echo "✓ Starting server..."
exec node_modules/.bin/next start -H 0.0.0.0 -p "$PORT"
