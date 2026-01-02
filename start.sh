#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  local exit_code=$?
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID}" ]] && kill -0 "${FRONTEND_PID}" 2>/dev/null; then
    kill "${FRONTEND_PID}" 2>/dev/null || true
  fi
  wait "${BACKEND_PID:-}" 2>/dev/null || true
  wait "${FRONTEND_PID:-}" 2>/dev/null || true
  exit "$exit_code"
}

trap cleanup INT TERM EXIT

echo "[start] Launching backend (uvicorn)..."
(
  cd "$ROOT_DIR"
  uv run uvicorn backend.main:app --reload
) &
BACKEND_PID=$!

echo "[start] Launching frontend (npm run dev)..."
(
  cd "$ROOT_DIR/frontend"
  npm run dev -- --host
) &
FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID"
