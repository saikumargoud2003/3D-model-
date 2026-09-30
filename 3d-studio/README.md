# 3D Studio

Next.js frontend for prompt-to-3D generation. The browser never talks to the GPU host or Tripo; API routes in this app proxy `POST /generate`, `GET /status`, and `GET /model`.

## Local Windows (no GPU)

```powershell
cd 3d-studio
copy .env.local.example .env.local
npm install
npm run shim
```

In a second terminal:

```powershell
cd 3d-studio
npm run dev
```

Open http://localhost:3000. The shim returns a cube GLB so the viewer and polling loop can be tested without CUDA.

## Real Hunyuan GPU backend (Linux / WSL2)

On Ubuntu with NVIDIA drivers:

```bash
bash gpu-backend/setup-linux.sh
bash gpu-backend/run.sh
```

From Windows with WSL2 CUDA:

```powershell
.\gpu-backend\setup-wsl.ps1
```

Point the Next.js app at that host:

```
GENERATION_PROVIDER=hunyuan
HUNYUAN_BACKEND_URL=http://<gpu-host>:8000
```

On the GPU machine set `HUNYUAN_PUBLIC_BASE_URL` to a URL the Next.js server can fetch (the `/api/model` proxy downloads the GLB).

Docker (Linux GPU host):

```bash
docker compose -f gpu-backend/docker-compose.yml up --build
```

## Tripo (managed API, no self-hosted GPU)

```
GENERATION_PROVIDER=tripo
TRIPO_API_KEY=tsk_...
```

## Vercel

Deploy the `3d-studio` directory as a Next.js project. Set server-only env vars in the Vercel project:

- `GENERATION_PROVIDER=hunyuan` and `HUNYUAN_BACKEND_URL=https://your-gpu-backend`
- or `GENERATION_PROVIDER=tripo` and `TRIPO_API_KEY=...`

Do not expose backend keys to the browser. Vercel cannot run Hunyuan; keep the GPU process on a Linux host.
