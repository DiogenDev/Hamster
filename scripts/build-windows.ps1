# ==============================================================================
# Build Windows EXE (.exe) for Hamster Diogen
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProjectDir = "D:\soft\HamsterDiogen"
$ExeDest = Join-Path $ProjectDir "HamsterDiogen.exe"
$DistDir = Join-Path $ProjectDir "dist"

Write-Host "=== BUILDING WINDOWS EXE (Hamster Diogen) ===" -ForegroundColor Cyan

# 0. Kill previous running instances to prevent file locks
Get-Process | Where-Object { $_.ProcessName -match "Hamster|Electron" } | Stop-Process -Force -ErrorAction SilentlyContinue

# 1. Generate icon
if (Test-Path "scripts\generate-icon.js") {
    & cmd.exe /c "node scripts\generate-icon.js"
}

# 2. Export Next.js
Write-Host "`n[1/3] Building Next.js static export..." -ForegroundColor Yellow
Set-Location $ProjectDir
& cmd.exe /c "npm.cmd run export"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Next.js export failed."
}

# 3. Package with electron-builder
Write-Host "`n[2/3] Packaging portable EXE with electron-builder..." -ForegroundColor Yellow
& cmd.exe /c "npx.cmd electron-builder --win"
if ($LASTEXITCODE -ne 0) {
    Write-Error "electron-builder packaging failed."
}

# 4. Copy final EXE
Write-Host "`n[3/3] Finalizing HamsterDiogen.exe..." -ForegroundColor Yellow
$builtExe = Get-ChildItem -Path $DistDir -Filter "*.exe" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($builtExe) {
    Copy-Item -Path $builtExe.FullName -Destination $ExeDest -Force
    $sizeMb = [math]::Round($builtExe.Length / 1MB, 2)
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Windows version built successfully!" -ForegroundColor Green
    Write-Host " File: $ExeDest ($sizeMb MB)" -ForegroundColor Cyan
    Write-Host " Source: $($builtExe.FullName)" -ForegroundColor DarkGray
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Error "Could not find built .exe in $DistDir"
}
