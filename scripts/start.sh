#!/bin/sh
# Ensure PORT has a default value
if [ -z "$PORT" ]; then
  PORT=3000
fi

# If production build missing, try to build before starting
echo "Checking for production build in .next..."
# Consider a valid production build present if server files or static files exist
if [ ! -d ".next/server" ] && [ ! -d ".next/static" ]; then
  echo "Production build not found (no .next/server or .next/static) — running 'npm run build'"
  npm run build || {
    echo "Build failed — aborting start" >&2
    exit 1
  }
else
  echo "Production build found. Skipping build step."
fi

exec next start -H 0.0.0.0 -p "$PORT"
