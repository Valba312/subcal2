#!/bin/sh
# If HOME is unset or not writable (common in scratch/readonly containers),
# make npm use a writable temporary location for cache/logs so npm doesn't
# fail trying to write to '/.npm/_logs'.
if [ -z "$HOME" ] || [ ! -w "$HOME" ]; then
  export HOME=/tmp
fi
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-$HOME/.npm}"
mkdir -p "$NPM_CONFIG_CACHE" || true

# Ensure PORT has a default value (match Dockerfile default)
if [ -z "$PORT" ]; then
  PORT=10000
fi

echo "Checking for production build in .next..."
# If BUILD_ID is missing, it's not a valid production build.
# Many PaaS builders time out if 'start' performs long installs/builds.
# By default we refuse to auto-install/build and exit with guidance.
# To allow auto-install/build during start, set AUTOBUILD=true in env.
if [ ! -f ".next/BUILD_ID" ]; then
  echo "Production BUILD_ID not found."
  if [ "${AUTOBUILD:-false}" = "true" ]; then
    echo "AUTOBUILD=true — proceeding to install dependencies and build."
    if [ ! -d "node_modules" ]; then
      echo "node_modules not found — installing dependencies (npm ci)..."
      npm ci || npm install || {
        echo "Dependency install failed — aborting start" >&2
        exit 1
      }
    fi

    echo "Running 'npm run build'"
    npm run build || {
      echo "Build failed — aborting start" >&2
      exit 1
    }
  else
    echo "AUTOBUILD not enabled — aborting start to avoid long-running installs/builds."
    echo "Set AUTOBUILD=true to enable automatic install+build in start, or build the image beforehand."
    exit 1
  fi
else
  echo "Found .next/BUILD_ID — assuming production build is present."
fi

exec next start -H 0.0.0.0 -p "$PORT"
