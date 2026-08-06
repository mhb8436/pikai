#!/bin/sh
set -e
cd /home/site/wwwroot

# zip에는 node_modules 대신 node_modules_app 만 포함 (Azure OneDeploy tar 우회)
DEPS="node_modules_app"

if [ ! -d "$DEPS/.pnpm" ]; then
  echo "ERROR: $DEPS/.pnpm missing. Deploy artifact incomplete."
  ls -la
  ls -la "$DEPS" 2>/dev/null | head -50 || true
  exit 1
fi

# Node 모듈 해석용 링크 (Azure가 node_modules -> /node_modules 로 바꿔놓는 것 복구)
rm -rf node_modules
ln -sfn "$DEPS" node_modules

export PORT="${PORT:-8080}"
export HOSTNAME="0.0.0.0"
export NODE_PATH="/home/site/wwwroot/$DEPS/.pnpm/node_modules:/home/site/wwwroot/$DEPS"

echo "Starting Next.js on ${HOSTNAME}:${PORT} ..."
exec node apps/web/server.js
