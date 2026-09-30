import { NextRequest, NextResponse } from "next/server";
import { jsonError, startGeneration } from "@/lib/generation";
import { getProvider } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      imageBase64?: string;
      textured?: boolean;
    };

    const prompt = (body.prompt || "").trim();
    if (!prompt && !body.imageBase64) {
      return jsonError("Provide a prompt or an image.");
    }

    const result = await startGeneration({
      prompt: prompt || "image to 3d",
      imageBase64: body.imageBase64,
      textured: body.textured ?? true,
    });

    return NextResponse.json({ ...result, provider: getProvider() }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation request failed";
    return jsonError(message, 502);
  }
}
