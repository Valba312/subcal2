#!/bin/sh
set -e

export HOME=${HOME:-/tmp}
export NPM_CONFIG_CACHE=${NPM_CONFIG_CACHE:-/tmp/.npm}
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}

mkdir -p "$HOME" "$NPM_CONFIG_CACHE" 2>/dev/null || true

# Check if build exists
if [ ! -f ".next/BUILD_ID" ]; then
  echo "No production build found. Building..."
  npm run build
fi

# Start Next.js
exec node_modules/.bin/next start -H 0.0.0.0 -p "$PORT"
