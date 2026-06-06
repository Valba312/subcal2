#!/bin/sh
set -e

# Set defaults
export HOME=${HOME:-/tmp}
export NPM_CONFIG_CACHE=${NPM_CONFIG_CACHE:-/tmp/.npm}
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}

# Ensure directories exist
mkdir -p "$HOME" "$NPM_CONFIG_CACHE" 2>/dev/null || true

# Start the application
exec node_modules/.bin/next start -H 0.0.0.0 -p "$PORT"
