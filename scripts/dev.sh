#!/bin/sh
# Ensure PORT has a default value and start Next.js dev server
if [ -z "$PORT" ]; then
  PORT=3000
fi
exec next dev -H 0.0.0.0 -p "$PORT"
