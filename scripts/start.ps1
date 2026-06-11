# TeachAI — start backend + frontend
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "Starting TeachAI..." -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Press Ctrl+C in each terminal to stop.`n"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\backend'; .\.venv\Scripts\python.exe run.py"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\frontend'; if (Test-Path .next) { Remove-Item .next -Recurse -Force }; npm run dev"

Write-Host "Servers launched in new windows." -ForegroundColor Green
