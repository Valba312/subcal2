#!/bin/sh
# Ensure PORT has a default value
if [ -z "$PORT" ]; then
  PORT=3000
fi

# If production build missing, try to build before starting
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
  echo "Production build not found in .next — running 'npm run build'"
  npm run build || {
    echo "Build failed — aborting start" >&2
    exit 1
  }
fi

exec next start -H 0.0.0.0 -p "$PORT"
