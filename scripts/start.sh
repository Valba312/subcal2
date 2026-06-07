#!/bin/sh
set -e

export HOME=${HOME:-/tmp}
export NPM_CONFIG_CACHE=${NPM_CONFIG_CACHE:-/tmp/.npm}
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export NEXT_TELEMETRY_DISABLED=1

echo "=== SubKeeper Startup ==="
echo "NODE: $(node --version)"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "========================="

mkdir -p "$HOME" "$NPM_CONFIG_CACHE" 2>/dev/null || true

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is required at runtime. Set it in Amvera on stage 'Запуск'."
  exit 1
fi

if [ ! -f ".env" ]; then
  cat > .env << EOF
DATABASE_URL=$DATABASE_URL
NODE_ENV=$NODE_ENV
NEXT_TELEMETRY_DISABLED=1
EOF
fi

if [ ! -f ".next/BUILD_ID" ]; then
  echo "Missing .next build output. Run the build step before start."
  exit 1
fi

echo "Starting server..."
exec node_modules/.bin/next start -H 0.0.0.0 -p "$PORT"
