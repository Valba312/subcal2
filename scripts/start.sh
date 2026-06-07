#!/bin/sh
set -e

export HOME=${HOME:-/tmp}
export NPM_CONFIG_CACHE=${NPM_CONFIG_CACHE:-/tmp/.npm}
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export DATABASE_URL=${DATABASE_URL:-postgresql://subkeeper:subkeeper@localhost:5432/subkeeper?schema=public}
export NEXT_TELEMETRY_DISABLED=1

echo "=== SubKeeper Startup ==="
echo "NODE: $(node --version)"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "========================="

mkdir -p "$HOME" "$NPM_CONFIG_CACHE" 2>/dev/null || true

if [ ! -f ".env" ]; then
  cat > .env << EOF
DATABASE_URL=$DATABASE_URL
NODE_ENV=$NODE_ENV
NEXT_TELEMETRY_DISABLED=1
EOF
fi

if [ ! -f ".next/BUILD_ID" ]; then
  echo "Building application..."
  npm run build
fi

npx prisma db push --skip-generate

echo "Starting server..."
exec node_modules/.bin/next start -H 0.0.0.0 -p "$PORT"
