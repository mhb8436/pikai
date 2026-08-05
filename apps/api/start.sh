#!/bin/sh
set -e
cd /home/site/wwwroot

# Oryx가 node_modules -> /node_modules (빈 링크)로 바꾼 경우 제거
if [ -L node_modules ]; then
  echo "ERROR: node_modules is a symlink (Oryx). Set WEBSITE_RUN_FROM_PACKAGE=1 and redeploy."
  ls -la node_modules
  exit 1
fi

if [ ! -f node_modules/@nestjs/core/package.json ]; then
  echo "ERROR: @nestjs/core missing. node_modules was not deployed correctly."
  ls -la
  ls -la node_modules 2>/dev/null | head -50 || true
  exit 1
fi

export PATH="/home/site/wwwroot/node_modules/.bin:$PATH"
export NODE_PATH="/home/site/wwwroot/node_modules"

echo "Running prisma migrate deploy ..."
./node_modules/.bin/prisma migrate deploy

echo "Starting NestJS on PORT=${PORT:-8080} ..."
export PORT="${PORT:-8080}"
exec node dist/src/main.js
