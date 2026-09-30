import { NextResponse } from "next/server";
import { getHunyuanStatus, startHunyuanJob } from "@/lib/hunyuan";
import { getTripoStatus, startTripoJob } from "@/lib/tripo";
import { getProvider, type GeneratePayload, type StatusResponse } from "@/lib/types";

export async function startGeneration(payload: GeneratePayload) {
  const provider = getProvider();
  if (provider === "tripo") {
    return startTripoJob(payload);
  }
  return startHunyuanJob(payload);
}

export async function readStatus(taskId: string): Promise<StatusResponse> {
  const provider = getProvider();
  if (provider === "tripo") {
    return getTripoStatus(taskId);
  }
  return getHunyuanStatus(taskId);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
