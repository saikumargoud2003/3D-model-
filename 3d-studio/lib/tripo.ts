import type { GeneratePayload, GenerateResponse, JobStatus, StatusResponse } from "./types";

const TRIPO_BASE = "https://api.tripo3d.ai/v2/openapi";

function tripoHeaders(): HeadersInit {
  const key = process.env.TRIPO_API_KEY;
  if (!key) {
    throw new Error("TRIPO_API_KEY is not set");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

function mapStatus(status: string | undefined): JobStatus {
  if (status === "success") return "completed";
  if (status === "failed" || status === "banned" || status === "cancelled" || status === "expired") {
    return "failed";
  }
  if (status === "running") return "running";
  return "queued";
}

function modelUrlFromOutput(output: Record<string, unknown> | undefined): string | null {
  if (!output) return null;
  const keys = ["pbr_model", "model", "model_url", "base_model"];
  for (const key of keys) {
    const value = output[key];
    if (typeof value === "string" && value) return value;
  }
  return null;
}

export async function startTripoJob(payload: GeneratePayload): Promise<GenerateResponse> {
  const body: Record<string, unknown> = {
    type: payload.imageBase64 ? "image_to_model" : "text_to_model",
    prompt: payload.prompt,
    texture: payload.textured ?? true,
  };

  const version = process.env.TRIPO_MODEL_VERSION;
  if (version) body.model_version = version;
  if (payload.imageBase64) {
    body.file = {
      type: "base64",
      data: payload.imageBase64.includes(",") ? payload.imageBase64.split(",", 2)[1] : payload.imageBase64,
    };
  }

  const response = await fetch(`${TRIPO_BASE}/task`, {
    method: "POST",
    headers: tripoHeaders(),
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as { code?: number; data?: { task_id?: string }; message?: string };
  const taskId = json.data?.task_id;
  if (!response.ok || !taskId) {
    throw new Error(json.message || `Tripo generate failed (${response.status})`);
  }

  return {
    taskId,
    status: "queued",
    message: "Tripo generation started",
  };
}

export async function getTripoStatus(taskId: string): Promise<StatusResponse> {
  const response = await fetch(`${TRIPO_BASE}/task/${encodeURIComponent(taskId)}`, {
    headers: tripoHeaders(),
    cache: "no-store",
  });
  const json = (await response.json()) as {
    data?: {
      task_id?: string;
      status?: string;
      progress?: number;
      output?: Record<string, unknown>;
    };
    message?: string;
  };
  if (!response.ok || !json.data) {
    throw new Error(json.message || `Tripo status failed (${response.status})`);
  }

  const status = mapStatus(json.data.status);
  const progress = json.data.progress;
  return {
    taskId: json.data.task_id || taskId,
    status,
    message:
      status === "completed"
        ? "3D generation complete"
        : status === "failed"
          ? "Generation failed"
          : `Tripo job ${json.data.status || "queued"}${typeof progress === "number" ? ` (${progress}%)` : ""}`,
    modelUrl: modelUrlFromOutput(json.data.output),
    error: status === "failed" ? json.data.status || "failed" : null,
  };
}
