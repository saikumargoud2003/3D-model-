const res = await fetch("http://127.0.0.1:3000/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "a cube" }),
});
const started = await res.json();
console.log("generate", res.status, started);
await new Promise((r) => setTimeout(r, 2500));
const statusRes = await fetch(`http://127.0.0.1:3000/api/status?taskId=${started.taskId}`);
const status = await statusRes.json();
console.log("status", statusRes.status, status);
if (status.modelUrl) {
  const modelRes = await fetch(`http://127.0.0.1:3000/api/model?url=${encodeURIComponent(status.modelUrl)}`);
  console.log("model", modelRes.status, modelRes.headers.get("content-type"), (await modelRes.arrayBuffer()).byteLength);
}
