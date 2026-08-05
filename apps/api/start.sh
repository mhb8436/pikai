#!/bin/sh
set -e
cd /home/site/wwwroot

# Oryx 빈 심볼릭 링크 제거
if [ -L node_modules ]; then
  rm -f node_modules
fi

if [ ! -f node_modules.tar.gz ]; then
  echo "ERROR: node_modules.tar.gz not found"
  ls -la
  exit 1
fi

echo "Extracting node_modules.tar.gz -> ./node_modules ..."
rm -rf node_modules
mkdir -p node_modules
tar -xzf node_modules.tar.gz -C node_modules

export PATH="/home/site/wwwroot/node_modules/.bin:$PATH"
export NODE_PATH="/home/site/wwwroot/node_modules"

if [ ! -f node_modules/@nestjs/core/package.json ]; then
  echo "ERROR: @nestjs/core missing after extract (incomplete tar)"
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
