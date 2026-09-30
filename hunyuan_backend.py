from __future__ import annotations

import base64
import io
import os
import sys
import threading
import time
import uuid
from pathlib import Path
from typing import Any, Dict, Optional

import torch
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image
from pydantic import BaseModel, ConfigDict, Field, field_validator

APP_ROOT = Path(__file__).resolve().parent
MODEL_ROOT = Path(os.getenv("HUNYUAN_MODEL_PATH", str(APP_ROOT / "Hunyuan3D-2"))).resolve()
OUTPUT_ROOT = Path(os.getenv("HUNYUAN_OUTPUT_DIR", str(APP_ROOT / "generated"))).resolve()
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

if str(MODEL_ROOT) not in sys.path:
    sys.path.insert(0, str(MODEL_ROOT))

app = FastAPI(title="Hunyuan3D GPU Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS: Dict[str, Dict[str, Any]] = {}


class GenerateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    prompt: Optional[str] = Field(default=None, description="Text prompt used when no image is supplied.")
    image_path: Optional[str] = Field(default=None, description="Absolute or relative path to an input image.")
    image_base64: Optional[str] = Field(
        default=None,
        alias="imageBase64",
        description="Base64-encoded image payload.",
    )
    textured: bool = Field(default=True, description="Whether to run texture synthesis for the generated mesh.")
    output_format: str = Field(default="glb", alias="outputFormat", description="Model export format. Use glb or obj.")

    @field_validator("output_format")
    @classmethod
    def validate_output_format(cls, v: str) -> str:
        if v.lower() not in {"glb", "obj"}:
            raise ValueError("output_format must be 'glb' or 'obj'")
        return v.lower()

    @property
    def has_input(self) -> bool:
        return bool(self.prompt or self.image_path or self.image_base64)


class JobStatusResponse(BaseModel):
    taskId: str
    status: str
    createdAt: float
    updatedAt: float
    message: str
    modelUrl: Optional[str] = None
    error: Optional[str] = None


def _job_template(task_id: str) -> Dict[str, Any]:
    return {
        "taskId": task_id,
        "status": "queued",
        "createdAt": time.time(),
        "updatedAt": time.time(),
        "message": "Queued for generation",
        "modelUrl": None,
        "error": None,
    }


def _safe_model_url(task_id: str, filename: str) -> str:
    base = os.getenv("HUNYUAN_PUBLIC_BASE_URL", "http://localhost:8000")
    return f"{base.rstrip('/')}/output/{task_id}/{filename}"


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "modelRoot": str(MODEL_ROOT),
        "gpuAvailable": bool(torch.cuda.is_available()),
    }


@app.get("/status")
def get_status(taskId: str = Query(..., alias="taskId")) -> Dict[str, Any]:
    job = JOBS.get(taskId)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Unknown taskId: {taskId}")

    payload = {
        "taskId": job["taskId"],
        "status": job["status"],
        "createdAt": job["createdAt"],
        "updatedAt": job["updatedAt"],
        "message": job["message"],
        "modelUrl": job.get("modelUrl"),
        "error": job.get("error"),
    }
    return payload


@app.get("/output/{task_id}/{filename}")
def serve_output(task_id: str, filename: str) -> FileResponse:
    file_path = (OUTPUT_ROOT / task_id / filename).resolve()
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Output not found")
    return FileResponse(file_path)


@app.post("/generate")
def create_job(request: GenerateRequest) -> JSONResponse:
    if not request.has_input:
        raise HTTPException(status_code=400, detail="Provide prompt, image_path, or image_base64.")

    task_id = uuid.uuid4().hex
    JOBS[task_id] = _job_template(task_id)
    thread = threading.Thread(target=_generate_task, args=(task_id, request), daemon=True)
    thread.start()

    return JSONResponse(
        status_code=202,
        content={
            "taskId": task_id,
            "status": "queued",
            "message": "Generation started",
        },
    )


def _load_input_image(request: GenerateRequest) -> Optional[Image.Image]:
    if request.image_base64:
        payload = request.image_base64
        if "," in payload:
            payload = payload.split(",", 1)[1]
        image_bytes = base64.b64decode(payload)
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")

    if request.image_path:
        path = Path(request.image_path)
        if not path.is_absolute():
            path = (APP_ROOT / path).resolve()
        if not path.exists():
            raise FileNotFoundError(f"Image path not found: {request.image_path}")
        return Image.open(path).convert("RGB")

    return None


def _prompt_to_image(prompt: str) -> Image.Image:
    from hy3dgen.text2image import HunyuanDiTPipeline

    t2i = HunyuanDiTPipeline("Tencent-Hunyuan/HunyuanDiT-v1.1-Diffusers-Distilled")
    image = t2i(prompt)
    if image is None:
        raise RuntimeError("Text-to-image generation returned no image")

    try:
        from hy3dgen.rembg import BackgroundRemover

        image = BackgroundRemover()(image)
    except Exception:
        pass

    return image.convert("RGB")


def _clean_mesh(mesh):
    from hy3dgen.shapegen import DegenerateFaceRemover, FaceReducer, FloaterRemover

    mesh = FloaterRemover()(mesh)
    mesh = DegenerateFaceRemover()(mesh)
    return FaceReducer()(mesh)


def _generate_task(task_id: str, request: GenerateRequest) -> None:
    job = JOBS[task_id]
    job["status"] = "running"
    job["updatedAt"] = time.time()
    job["message"] = "Validating GPU runtime and preparing generation"

    try:
        model_path = str(MODEL_ROOT)
        if not Path(model_path).exists():
            raise FileNotFoundError(f"Model path not found: {model_path}")

        from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline

        input_image = _load_input_image(request)
        if input_image is None:
            if not request.prompt:
                raise RuntimeError("No valid generation input was supplied")
            job["message"] = "Generating reference image from prompt"
            job["updatedAt"] = time.time()
            input_image = _prompt_to_image(request.prompt)

        try:
            from hy3dgen.rembg import BackgroundRemover

            if input_image.mode == "RGB":
                input_image = BackgroundRemover()(input_image)
        except Exception:
            pass

        job["message"] = "Running Hunyuan3D shape generation"
        job["updatedAt"] = time.time()
        pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(model_path)
        mesh = pipeline(
            image=input_image,
            num_inference_steps=30,
            mc_algo="mc",
            generator=torch.manual_seed(2025),
        )[0]
        mesh = _clean_mesh(mesh)

        output_directory = OUTPUT_ROOT / task_id
        output_directory.mkdir(parents=True, exist_ok=True)
        output_filename = f"model.{request.output_format}"
        mesh.export(str(output_directory / output_filename), include_normals=True)
        job["modelUrl"] = _safe_model_url(task_id, output_filename)
        job["message"] = "Shape generation complete"

        if request.textured:
            try:
                from hy3dgen.texgen import Hunyuan3DPaintPipeline

                job["message"] = "Running texture synthesis"
                job["updatedAt"] = time.time()
                paint_pipeline = Hunyuan3DPaintPipeline.from_pretrained(model_path)
                textured_mesh = paint_pipeline(mesh, image=input_image)
                textured_filename = f"textured.{request.output_format}"
                textured_mesh.export(str(output_directory / textured_filename), include_normals=True)
                job["modelUrl"] = _safe_model_url(task_id, textured_filename)
            except Exception as paint_error:
                job["message"] = f"Shape generation complete; texture synthesis skipped: {paint_error}"

        job["status"] = "completed"
        job["updatedAt"] = time.time()
        if job["message"] == "Shape generation complete":
            job["message"] = "3D generation complete"
    except Exception as exc:  # pragma: no cover - keeps the API available even when models are absent
        job["status"] = "failed"
        job["updatedAt"] = time.time()
        job["message"] = "Generation failed"
        job["error"] = str(exc)


if __name__ == "__main__":
    import argparse
    import uvicorn

    parser = argparse.ArgumentParser(description="Run the Hunyuan3D GPU backend")
    parser.add_argument("--host", default=os.getenv("HOST", "0.0.0.0"))
    parser.add_argument("--port", type=int, default=int(os.getenv("PORT", "8000")))
    args = parser.parse_args()
    uvicorn.run("hunyuan_backend:app", host=args.host, port=args.port, reload=False)
