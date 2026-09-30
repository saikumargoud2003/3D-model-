#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="${HUNYUAN_VENV:-$ROOT/.venv-hunyuan}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required. Install Python 3.10+ first."
  exit 1
fi

if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi
else
  echo "Warning: nvidia-smi not found. Hunyuan3D needs a CUDA GPU."
fi

python3 -m venv "$VENV"
# shellcheck disable=SC1091
source "$VENV/bin/activate"
python -m pip install --upgrade pip
python -m pip install --index-url https://download.pytorch.org/whl/cu121 torch torchvision torchaudio
python -m pip install -r "$ROOT/gpu-backend/requirements.txt"
python -m pip install -e "$ROOT/Hunyuan3D-2" || true

if [[ -d "$ROOT/Hunyuan3D-2/hy3dgen/texgen/custom_rasterizer" ]]; then
  pushd "$ROOT/Hunyuan3D-2/hy3dgen/texgen/custom_rasterizer" >/dev/null
  python setup.py install || echo "custom_rasterizer compile skipped"
  popd >/dev/null
fi

if [[ -f "$ROOT/Hunyuan3D-2/hy3dgen/texgen/differentiable_renderer/compile_mesh_painter.sh" ]]; then
  pushd "$ROOT/Hunyuan3D-2/hy3dgen/texgen/differentiable_renderer" >/dev/null
  bash compile_mesh_painter.sh || echo "mesh painter compile skipped"
  popd >/dev/null
fi

echo
echo "Setup complete."
echo "Activate with: source $VENV/bin/activate"
echo "Start with:    bash $ROOT/gpu-backend/run.sh"
