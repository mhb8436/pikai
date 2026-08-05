#!/bin/sh
set -e
cd /home/site/wwwroot

# /home/site 는 재시작해도 유지됨 → 여기에 한 번만 압축 해제
CACHE_DIR="/home/site/node_modules_cache"

resolve_modules() {
  if [ -f "$CACHE_DIR/prisma/package.json" ]; then
    echo "Using cached node_modules at $CACHE_DIR"
    return 0
  fi

  # Oryx가 /node_modules 에 이미 잘 풀어둔 경우 복사해 캐시 (재추출 방지)
  if [ -f /node_modules/prisma/package.json ]; then
    echo "Caching Oryx /node_modules -> $CACHE_DIR"
    rm -rf "$CACHE_DIR"
    mkdir -p "$CACHE_DIR"
    cp -a /node_modules/. "$CACHE_DIR/"
    return 0
  fi

  if [ -f node_modules.tar.gz ]; then
    echo "Extracting node_modules.tar.gz into $CACHE_DIR (first boot, may take several minutes)..."
    rm -rf "$CACHE_DIR"
    mkdir -p "$CACHE_DIR"
    tar -xzf node_modules.tar.gz -C "$CACHE_DIR"
    return 0
  fi

  echo "ERROR: cannot find node_modules or node_modules.tar.gz"
  ls -la
  exit 1
}

resolve_modules

# wwwroot 의 깨진 심볼릭 링크/빈 node_modules 를 캐시로 교체
rm -rf node_modules
ln -sfn "$CACHE_DIR" node_modules

export PATH="$CACHE_DIR/.bin:$PATH"
export NODE_PATH="$CACHE_DIR"

if [ ! -f "$CACHE_DIR/prisma/package.json" ]; then
  echo "ERROR: prisma missing after resolve"
  ls -la "$CACHE_DIR" | head
  exit 1
fi

echo "Running prisma migrate deploy ..."
prisma migrate deploy

echo "Starting NestJS on PORT=${PORT:-8080} ..."
export PORT="${PORT:-8080}"
exec node dist/src/main.js
