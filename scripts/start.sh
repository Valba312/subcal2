#!/bin/sh
# Ensure PORT has a default value
if [ -z "$PORT" ]; then
  PORT=3000
fi

echo "Checking for production build in .next..."
# If BUILD_ID is missing, it's not a valid production build — run build
if [ ! -f ".next/BUILD_ID" ]; then
  echo "Production BUILD_ID not found — running 'npm run build'"
  npm run build || {
    echo "Build failed — aborting start" >&2
    exit 1
  }
else
  echo "Found .next/BUILD_ID — assuming production build is present."
fi

exec next start -H 0.0.0.0 -p "$PORT"
