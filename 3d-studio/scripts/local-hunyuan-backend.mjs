import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 8000);
const jobs = new Map();

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function cubeGlb() {
  const json = {
    asset: { version: "2.0", generator: "local-hunyuan-backend" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 1 }, indices: 0 }] }],
    accessors: [
      { bufferView: 0, componentType: 5123, count: 36, type: "SCALAR" },
      {
        bufferView: 1,
        componentType: 5126,
        count: 8,
        type: "VEC3",
        min: [-0.5, -0.5, -0.5],
        max: [0.5, 0.5, 0.5],
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 72, target: 34963 },
      { buffer: 0, byteOffset: 72, byteLength: 96, target: 34962 },
    ],
    buffers: [{ byteLength: 168 }],
  };

  const index = Uint16Array.from([
    0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 0, 4, 7, 7, 1, 0, 3, 2, 6, 6, 5, 3, 1, 7, 6, 6, 2, 1, 4, 0, 3, 3, 5, 4,
  ]);
  const positions = Float32Array.from([
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
  ]);

  const jsonBuffer = Buffer.from(JSON.stringify(json));
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
  const binBuffer = Buffer.concat([Buffer.from(index.buffer), Buffer.from(positions.buffer)]);
  const binPadding = (4 - (binBuffer.length % 4)) % 4;
  const total = 12 + 8 + jsonBuffer.length + jsonPadding + 8 + binBuffer.length + binPadding;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(total, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length + jsonPadding, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBuffer.length + binPadding, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([
    header,
    jsonChunkHeader,
    jsonBuffer,
    Buffer.alloc(jsonPadding, 0x20),
    binChunkHeader,
    binBuffer,
    Buffer.alloc(binPadding, 0),
  ]);
}

const CUBE = cubeGlb();

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    json(res, 200, { status: "ok", gpuAvailable: false, shim: true });
    return;
  }

  if (req.method === "POST" && url.pathname === "/generate") {
    const body = await readBody(req);
    if (!body.prompt && !body.imageBase64 && !body.image_base64) {
      json(res, 400, { detail: "Provide prompt or imageBase64" });
      return;
    }
    const taskId = randomUUID().replaceAll("-", "");
    const now = Date.now() / 1000;
    jobs.set(taskId, {
      taskId,
      status: "queued",
      message: "Queued by local shim",
      createdAt: now,
      updatedAt: now,
      modelUrl: null,
      error: null,
    });
    setTimeout(() => {
      const job = jobs.get(taskId);
      if (!job) return;
      job.status = "running";
      job.message = "Synthesizing placeholder mesh";
      job.updatedAt = Date.now() / 1000;
    }, 400);
    setTimeout(() => {
      const job = jobs.get(taskId);
      if (!job) return;
      job.status = "completed";
      job.message = "3D generation complete (shim cube)";
      job.updatedAt = Date.now() / 1000;
      job.modelUrl = `http://127.0.0.1:${PORT}/output/${taskId}/model.glb`;
    }, 1800);
    json(res, 202, { taskId, status: "queued", message: "Generation started" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/status") {
    const taskId = url.searchParams.get("taskId");
    const job = jobs.get(taskId);
    if (!job) {
      json(res, 404, { detail: `Unknown taskId: ${taskId}` });
      return;
    }
    json(res, 200, job);
    return;
  }

  const output = url.pathname.match(/^\/output\/([^/]+)\/model\.glb$/);
  if (req.method === "GET" && output) {
    res.writeHead(200, { "Content-Type": "model/gltf-binary", "Content-Length": String(CUBE.length) });
    res.end(CUBE);
    return;
  }

  json(res, 404, { detail: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Local Hunyuan shim listening on http://127.0.0.1:${PORT}`);
});
