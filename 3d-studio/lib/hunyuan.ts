import { hunyuanBackendUrl, type GeneratePayload, type GenerateResponse, type StatusResponse } from "./types";

export async function startHunyuanJob(payload: GeneratePayload): Promise<GenerateResponse> {
  const response = await fetch(`${hunyuanBackendUrl()}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: payload.prompt,
      imageBase64: payload.imageBase64,
      textured: payload.textured ?? true,
      outputFormat: payload.outputFormat ?? "glb",
    }),
  });

  const data = (await response.json()) as GenerateResponse & { detail?: string };
  if (!response.ok) {
    throw new Error(data.detail || data.message || `Hunyuan generate failed (${response.status})`);
  }
  return data;
}

export async function getHunyuanStatus(taskId: string): Promise<StatusResponse> {
  const response = await fetch(`${hunyuanBackendUrl()}/status?taskId=${encodeURIComponent(taskId)}`, {
    cache: "no-store",
  });
  const data = (await response.json()) as StatusResponse & { detail?: string };
  if (!response.ok) {
    throw new Error(data.detail || data.message || `Hunyuan status failed (${response.status})`);
  }
  return data;
}
