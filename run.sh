
set -e
if [ ! -d node_modules ]; then
  npm ci || npm install
fi
export PORT="${PORT:-3000}"
exec npm run dev
