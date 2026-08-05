#!/bin/sh
set -e
cd /home/site/wwwroot

# /home/site 는 재시작해도 유지 → 여기에 한 번만 압축 해제
CACHE_DIR="/home/site/node_modules_cache"

if [ ! -f "$CACHE_DIR/prisma/package.json" ]; then
  if [ ! -f node_modules.tar.gz ]; then
    echo "ERROR: node_modules.tar.gz not found"
    ls -la
    exit 1
  fi

  echo "Extracting node_modules.tar.gz -> $CACHE_DIR (first boot, may take several minutes)..."
  rm -rf "$CACHE_DIR"
  mkdir -p "$CACHE_DIR"
  # Oryx /node_modules 는 비어 있으므로 쓰지 않음. tar 만 사용.
  tar -xzf node_modules.tar.gz -C "$CACHE_DIR"
fi

echo "Using node_modules at $CACHE_DIR"

# Oryx 가 만든 빈 심볼릭 링크(node_modules -> /node_modules) 제거 후 캐시로 연결
rm -rf node_modules
ln -sfn "$CACHE_DIR" node_modules

export PATH="$CACHE_DIR/.bin:$PATH"
export NODE_PATH="$CACHE_DIR"

if [ ! -f "$CACHE_DIR/prisma/package.json" ]; then
  echo "ERROR: prisma missing after extract"
  ls -la "$CACHE_DIR" | head
  exit 1
fi

echo "Running prisma migrate deploy ..."
prisma migrate deployf

echo "Starting NestJS on PORT=${PORT:-8080} ..."
export PORT="${PORT:-8080}"
exec node dist/src/main.js
