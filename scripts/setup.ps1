# TeachAI one-click setup (Windows)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "=== TeachAI Setup ===" -ForegroundColor Cyan

# Ensure .env exists
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env — add your GOOGLE_API_KEY before using chat/upload." -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\.env.local")) {
    Copy-Item "frontend\.env.local.example" "frontend\.env.local"
}

# Python backend
Write-Host "`n[1/2] Backend (Python)..." -ForegroundColor Green
Set-Location "$Root\backend"
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
& ".\.venv\Scripts\pip.exe" install -r requirements.txt

# Frontend
Write-Host "`n[2/2] Frontend (Node)..." -ForegroundColor Green
Set-Location "$Root\frontend"
npm install

Set-Location $Root
Write-Host "`n=== Setup complete ===" -ForegroundColor Cyan
Write-Host "1. Edit .env and set GOOGLE_API_KEY"
Write-Host "2. Run: .\scripts\start.ps1"
