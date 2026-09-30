"use client";

import dynamic from "next/dynamic";
import { FormEvent, useMemo, useState } from "react";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), { ssr: false });

type JobState = {
  taskId?: string;
  status: string;
  message: string;
  modelUrl?: string | null;
  error?: string | null;
};

function toViewerSrc(modelUrl?: string | null): string | null {
  if (!modelUrl) return null;
  return `/api/model?url=${encodeURIComponent(modelUrl)}`;
}

export default function Page() {
  const [prompt, setPrompt] = useState("a small ceramic tea cup, studio lighting");
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState<JobState>({
    status: "idle",
    message: "Describe an object, then generate a GLB you can orbit in the viewer.",
  });

  const modelSrc = useMemo(() => toViewerSrc(job.modelUrl), [job.modelUrl]);

  async function poll(taskId: string) {
    for (let i = 0; i < 180; i += 1) {
      const response = await fetch(`/api/status?taskId=${encodeURIComponent(taskId)}`, { cache: "no-store" });
      const data = (await response.json()) as JobState & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Status request failed");
      }
      setJob(data);
      if (data.status === "completed" || data.status === "failed") {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    throw new Error("Timed out waiting for generation");
  }

  async function onGenerate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setJob({ status: "queued", message: "Submitting generation job..." });
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageBase64, textured: true }),
      });
      const data = (await response.json()) as JobState & { error?: string; taskId?: string };
      if (!response.ok || !data.taskId) {
        throw new Error(data.error || "Could not start generation");
      }
      setJob(data);
      await poll(data.taskId);
    } catch (error) {
      setJob({
        status: "failed",
        message: "Generation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  }

  function onFile(file: File | undefined) {
    if (!file) {
      setImageBase64(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">3D Studio</p>
        <h1>Prompt to model</h1>
        <p className="lede">
          The browser talks only to this Next.js app. Generation runs on a GPU backend, a local shim, or Tripo,
          selected by server env vars.
        </p>
        <form onSubmit={onGenerate}>
          <label htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="a weathered brass lantern"
          />
          <label className="file-row">
            Optional reference image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onFile(event.target.files?.[0])}
            />
          </label>
          <div className="actions">
            <button className="primary" type="submit" disabled={busy}>
              {busy ? "Generating..." : "Generate 3D model"}
            </button>
            <button
              className="ghost"
              type="button"
              disabled={busy}
              onClick={() => {
                setImageBase64(undefined);
                setJob({ status: "idle", message: "Cleared. Ready for a new prompt." });
              }}
            >
              Reset
            </button>
          </div>
        </form>
        <div className="status">
          <strong>{job.status}</strong>
          <div>{job.message}</div>
          {job.taskId ? <div>task {job.taskId}</div> : null}
          {job.error ? <div>{job.error}</div> : null}
        </div>
      </section>
      <section className="viewer">
        <div className="badge">{modelSrc ? "orbit / zoom the generated mesh" : "waiting for a model"}</div>
        <ModelViewer modelSrc={modelSrc} />
      </section>
    </main>
  );
}
