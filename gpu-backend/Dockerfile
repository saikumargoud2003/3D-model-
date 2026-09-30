FROM nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HOST=0.0.0.0 \
    PORT=8000 \
    HUNYUAN_MODEL_PATH=/app/Hunyuan3D-2 \
    HUNYUAN_OUTPUT_DIR=/app/generated \
    HUNYUAN_PUBLIC_BASE_URL=http://localhost:8000

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-dev git ninja-build build-essential \
    libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app

COPY Hunyuan3D-2 /app/Hunyuan3D-2
COPY hunyuan_backend.py /app/hunyuan_backend.py
COPY gpu-backend/requirements.txt /app/requirements.txt

RUN pip3 install --upgrade pip && \
    pip3 install --index-url https://download.pytorch.org/whl/cu121 torch torchvision torchaudio && \
    pip3 install -r /app/requirements.txt && \
    pip3 install -e /app/Hunyuan3D-2 || true

WORKDIR /app/Hunyuan3D-2/hy3dgen/texgen/custom_rasterizer
RUN python3 setup.py install || echo "custom_rasterizer compile skipped"

WORKDIR /app/Hunyuan3D-2/hy3dgen/texgen/differentiable_renderer
RUN bash compile_mesh_painter.sh || echo "mesh painter compile skipped"

WORKDIR /app
EXPOSE 8000

CMD ["python3", "hunyuan_backend.py", "--host", "0.0.0.0", "--port", "8000"]
