# Run this from Windows PowerShell if you have WSL2 + NVIDIA CUDA on WSL.
# It only bootstraps the Linux scripts; the model still runs inside WSL.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command wsl -ErrorAction SilentlyContinue)) {
  Write-Error "WSL is not installed. Enable WSL2 and install Ubuntu first."
}

wsl -e bash -lc "cd '$($root -replace '\\','/')' && chmod +x gpu-backend/setup-linux.sh gpu-backend/run.sh && bash gpu-backend/setup-linux.sh"
Write-Host "WSL setup finished. Start the backend with:"
Write-Host "  wsl -e bash -lc `"cd '$($root -replace '\\','/')' && bash gpu-backend/run.sh`""
