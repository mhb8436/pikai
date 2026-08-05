#!/bin/sh
set -e
cd /home/site/wwwroot

# Oryx가 node_modules -> /node_modules 심볼릭 링크로 바꿔 두는 것을 되돌림
if [ -L node_modules ]; then
  rm -f node_modules
fi

# prisma가 없으면 tar에서 로컬 node_modules로 직접 압축 해제
if [ ! -f node_modules/prisma/package.json ] && [ -f node_modules.tar.gz ]; then
  echo "Extracting node_modules.tar.gz into ./node_modules ..."
  rm -rf node_modules
  mkdir -p node_modules
  tar -xzf node_modules.tar.gz -C node_modules
fi

if [ ! -f node_modules/prisma/package.json ]; then
  echo "ERROR: prisma not found in node_modules. Redeploy the app."
  ls -la
  ls -la node_modules 2>/dev/null || true
  exit 1
fi

export PATH="/home/site/wwwroot/node_modules/.bin:$PATH"

echo "Running prisma migrate deploy ..."
prisma migrate deploy

echo "Starting NestJS ..."
exec node dist/src/main.js
