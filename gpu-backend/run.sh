#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="${HUNYUAN_VENV:-$ROOT/.venv-hunyuan}"

if [[ ! -d "$VENV" ]]; then
  echo "Virtualenv missing. Run bash gpu-backend/setup-linux.sh first."
  exit 1
fi

# shellcheck disable=SC1091
source "$VENV/bin/activate"

export HUNYUAN_MODEL_PATH="${HUNYUAN_MODEL_PATH:-$ROOT/Hunyuan3D-2}"
export HUNYUAN_OUTPUT_DIR="${HUNYUAN_OUTPUT_DIR:-$ROOT/generated}"
export HUNYUAN_PUBLIC_BASE_URL="${HUNYUAN_PUBLIC_BASE_URL:-http://localhost:8000}"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8000}"

cd "$ROOT"
python hunyuan_backend.py --host "$HOST" --port "$PORT"
