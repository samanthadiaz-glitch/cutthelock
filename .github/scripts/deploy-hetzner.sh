set -euo pipefail

echo "Connected to $(hostname) as $(whoami)"

if [ -z "${APP_DIR:-}" ]; then
  echo "Error: APP_DIR is missing"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "Error: app directory does not exist: $APP_DIR"
  exit 1
fi

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Error: app directory is not a Git checkout: $APP_DIR"
  exit 1
fi

cd "$APP_DIR"
command -v git
command -v npm
command -v pm2

git pull --ff-only origin main
npm ci
npm run build
pm2 restart cutthelock || pm2 start server.js --name cutthelock
