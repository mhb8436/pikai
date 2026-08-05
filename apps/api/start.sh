#!/bin/sh
set -e
cd /home/site/wwwroot

# zip에는 node_modules 대신 node_modules_app 만 포함 (Azure OneDeploy가 node_modules를 tar로 망가뜨리지 않게)
DEPS="node_modules_app"

if [ ! -f "$DEPS/@nestjs/core/package.json" ]; then
  echo "ERROR: $DEPS/@nestjs/core missing. Deploy artifact incomplete."
  ls -la
  ls -la "$DEPS" 2>/dev/null | head -50 || true
  exit 1
fi

# Node 기본 해석을 위해 런타임에만 node_modules 링크 생성
rm -rf node_modules
ln -sfn "$DEPS" node_modules

export PATH="/home/site/wwwroot/$DEPS/.bin:$PATH"
export NODE_PATH="/home/site/wwwroot/$DEPS"

echo "Running prisma migrate deploy ..."
./$DEPS/.bin/prisma migrate deploy

echo "Starting NestJS on PORT=${PORT:-8080} ..."
export PORT="${PORT:-8080}"
exec node dist/src/main.js
