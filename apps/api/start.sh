#!/bin/sh
set -e
cd /home/site/wwwroot

# zip에는 node_modules 대신 node_modules_app 만 포함
DEPS="node_modules_app"

if [ ! -f "$DEPS/@nestjs/core/package.json" ]; then
  echo "ERROR: $DEPS/@nestjs/core missing. Deploy artifact incomplete."
  ls -la
  ls -la "$DEPS" 2>/dev/null | head -50 || true
  exit 1
fi

# Node 모듈 해석용 링크
rm -rf node_modules
ln -sfn "$DEPS" node_modules

# .bin/prisma 가 wasm 을 .bin/ 에서 찾음 → build 쪽 wasm 을 .bin 에 복사
if [ -f "$DEPS/prisma/build/prisma_schema_build_bg.wasm" ]; then
  cp -f "$DEPS/prisma/build/"*.wasm "$DEPS/.bin/" 2>/dev/null || true
fi

export NODE_PATH="/home/site/wwwroot/$DEPS"
# .bin 을 PATH 앞에 두지 않음 (깨진 prisma 래퍼 호출 방지)

PRISMA_CLI="/home/site/wwwroot/$DEPS/prisma/build/index.js"
if [ ! -f "$PRISMA_CLI" ]; then
  echo "ERROR: prisma CLI missing at $PRISMA_CLI"
  exit 1
fi

# echo "Running prisma migrate deploy via node $PRISMA_CLI ..."
# node "$PRISMA_CLI" migrate deploy

echo "Starting NestJS on PORT=${PORT:-8080} ..."
export PORT="${PORT:-8080}"
exec node dist/src/main.js
