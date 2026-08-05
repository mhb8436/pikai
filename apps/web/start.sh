#!/bin/sh
set -e
cd /home/site/wwwroot

export PORT="${PORT:-8080}"
export HOSTNAME="0.0.0.0"

echo "Starting Next.js on ${HOSTNAME}:${PORT} ..."
exec node apps/web/server.js
