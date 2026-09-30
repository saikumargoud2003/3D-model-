import { NextRequest, NextResponse } from "next/server";
import { jsonError, readStatus } from "@/lib/generation";
import { getProvider } from "@/lib/types";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return jsonError("taskId is required");
  }

  try {
    const status = await readStatus(taskId);
    return NextResponse.json({ ...status, provider: getProvider() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status lookup failed";
    return jsonError(message, 502);
  }
}
