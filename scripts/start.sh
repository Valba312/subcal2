#!/bin/sh
set -e

# Set environment variables
export HOME=${HOME:-/tmp}
export NPM_CONFIG_CACHE=${NPM_CONFIG_CACHE:-/tmp/.npm}
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export DATABASE_URL=${DATABASE_URL:-file:/var/data/subkeeper.db}

# Debug logging
echo "=== SubKeeper Startup ==="
echo "NODE_VERSION: $(node --version)"
echo "NPM_VERSION: $(npm --version)"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL: $DATABASE_URL"
echo "HOME: $HOME"
echo "PWD: $(pwd)"
echo "========================="

# Create necessary directories
mkdir -p "$HOME" "$NPM_CONFIG_CACHE" /var/data 2>/dev/null || true

# Create .env file with DATABASE_URL if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cat > .env << EOF
DATABASE_URL=$DATABASE_URL
NODE_ENV=$NODE_ENV
EOF
fi

# Check if build exists
if [ ! -f ".next/BUILD_ID" ]; then
  echo "⚠️  No production build found. Building..."
  npm run build
else
  echo "✓ Production build found"
fi

# Verify files exist
if [ ! -d ".next" ]; then
  echo "❌ ERROR: .next directory not found"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "❌ ERROR: node_modules not found"
  exit 1
fi

echo "✓ Starting Next.js server..."
# Start Next.js with explicit host and port
exec node_modules/.bin/next start -H 0.0.0.0 -p "$PORT"
