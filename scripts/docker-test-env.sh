#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
CYPRESS_COMMAND="${1:-cypress:run}"

cleanup() {
  cd "$ROOT_DIR"
  docker compose down --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR"
echo "Uruchamianie srodowiska testowego w Dockerze..."
docker compose up -d --build

npx --prefix "$FRONTEND_DIR" wait-on \
  "http-get://127.0.0.1:8080/api/products" \
  "http-get://127.0.0.1:5173" \
  -t 180000

echo "Srodowisko gotowe. Uruchamianie Cypress (${CYPRESS_COMMAND})..."
cd "$FRONTEND_DIR"
npm run "$CYPRESS_COMMAND"
