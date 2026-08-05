#!/bin/sh
set -e
cd /home/site/wwwroot

# Oryx 빈 심볼릭 링크 제거
if [ -L node_modules ]; then
  rm -f node_modules
fi

# Oryx가 만드는 node_modules.tar.gz 는 쓰지 않음 (불완전함)
# CI에서 만든 app-node_modules.tar.gz 만 사용
TAR_FILE="app-node_modules.tar.gz"

if [ ! -f "$TAR_FILE" ]; then
  echo "ERROR: $TAR_FILE not found"
  ls -la
  exit 1
fi

echo "Extracting $TAR_FILE -> ./node_modules ..."
rm -rf node_modules
mkdir -p node_modules
tar -xzf "$TAR_FILE" -C node_modules

export PATH="/home/site/wwwroot/node_modules/.bin:$PATH"
export NODE_PATH="/home/site/wwwroot/node_modules"

if [ ! -f node_modules/@nestjs/core/package.json ]; then
  echo "ERROR: @nestjs/core missing after extract"
  ls -la node_modules | head -50
  exit 1
fi

if [ ! -f node_modules/prisma/package.json ]; then
  echo "ERROR: prisma missing after extract"
  ls -la node_modules | head -50
  exit 1
fi

echo "Running prisma migrate deploy ..."
./node_modules/.bin/prisma migrate deploy

echo "Starting NestJS on PORT=${PORT:-8080} ..."
export PORT="${PORT:-8080}"
exec node dist/src/main.js
