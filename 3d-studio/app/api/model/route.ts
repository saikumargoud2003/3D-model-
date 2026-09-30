import { NextRequest, NextResponse } from "next/server";
import { hunyuanBackendUrl } from "@/lib/types";

export const maxDuration = 60;

function isAllowedModelUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) return false;

  const allowedHosts = new Set<string>();
  try {
    allowedHosts.add(new URL(hunyuanBackendUrl()).hostname);
  } catch {
    allowedHosts.add("127.0.0.1");
    allowedHosts.add("localhost");
  }

  allowedHosts.add("api.tripo3d.ai");
  allowedHosts.add("tripo3d.ai");
  allowedHosts.add("cdn.tripo3d.ai");
  allowedHosts.add("storage.googleapis.com");

  const host = parsed.hostname;
  if (allowedHosts.has(host)) return true;
  if (host.endsWith(".tripo3d.ai")) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  if (!isAllowedModelUrl(raw)) {
    return NextResponse.json({ error: "URL host is not allowed" }, { status: 400 });
  }

  const upstream = await fetch(raw, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: `Upstream model fetch failed (${upstream.status})` }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "model/gltf-binary",
      "Cache-Control": "private, max-age=60",
    },
  });
}
