export type JobStatus = "queued" | "running" | "completed" | "failed";

export type GeneratePayload = {
  prompt: string;
  imageBase64?: string;
  textured?: boolean;
  outputFormat?: "glb" | "obj";
};

export type GenerateResponse = {
  taskId: string;
  status: JobStatus;
  message: string;
};

export type StatusResponse = {
  taskId: string;
  status: JobStatus;
  message: string;
  modelUrl?: string | null;
  error?: string | null;
  createdAt?: number;
  updatedAt?: number;
};

export type GenerationProvider = "local" | "hunyuan" | "tripo";

export function getProvider(): GenerationProvider {
  const value = (process.env.GENERATION_PROVIDER || "").trim().toLowerCase();
  if (value === "tripo" || value === "hunyuan" || value === "local") {
    return value;
  }
  if (process.env.TRIPO_API_KEY) return "tripo";
  if (process.env.HUNYUAN_BACKEND_URL) return "hunyuan";
  if (process.env.USE_LOCAL_SHIM === "1" || process.env.USE_LOCAL_SHIM === "true") {
    return "local";
  }
  throw new Error(
    "No generation backend is configured. Set GENERATION_PROVIDER=local only for testing, or set GENERATION_PROVIDER=hunyuan with HUNYUAN_BACKEND_URL or GENERATION_PROVIDER=tripo with TRIPO_API_KEY.",
  );
}

export function hunyuanBackendUrl(): string {
  return (process.env.HUNYUAN_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}
