# ==============================================================================
# Build Windows EXE (.exe) for Hamster Diogen
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProjectDir = "D:\soft\HamsterDiogen"
$ExeDest = Join-Path $ProjectDir "HamsterDiogen.exe"
$DistDir = Join-Path $ProjectDir "dist"

Write-Host "=== BUILDING WINDOWS APP (Hamster Diogen) ===" -ForegroundColor Cyan

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
Write-Host "`n[2/3] Packaging Windows application with electron-builder..." -ForegroundColor Yellow
& cmd.exe /c "npx.cmd electron-builder --win"
if ($LASTEXITCODE -ne 0) {
    Write-Error "electron-builder packaging failed."
}

# 4. Finalize release files
Write-Host "`n[3/3] Finalizing Windows release..." -ForegroundColor Yellow

# A. Unpacked instant-launch folder (starts in 0.2 seconds, no extraction delay!)
$unpackedSrc = Join-Path $DistDir "win-unpacked"
$unpackedDest = Join-Path $ProjectDir "HamsterDiogen-Windows"
if (Test-Path $unpackedSrc) {
    if (Test-Path $unpackedDest) {
        Remove-Item $unpackedDest -Recurse -Force -ErrorAction SilentlyContinue
    }
    Copy-Item -Path $unpackedSrc -Destination $unpackedDest -Recurse -Force
    Write-Host " [Instant Launch Folder] $unpackedDest\HamsterDiogen.exe" -ForegroundColor Green
}

# B. Instant Launcher Batch Script in Root
$batPath = Join-Path $ProjectDir "Run-Hamster.bat"
"@echo off`r`nstart `"`" `"%~dp0HamsterDiogen-Windows\HamsterDiogen.exe`"" | Out-File -FilePath $batPath -Encoding ascii
Write-Host " [One-Click Launcher] $batPath" -ForegroundColor Green

# C. Standalone Portable EXE
$builtExe = Get-ChildItem -Path $DistDir -Filter "*.exe" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($builtExe) {
    Copy-Item -Path $builtExe.FullName -Destination $ExeDest -Force
    $sizeMb = [math]::Round($builtExe.Length / 1MB, 2)
    Write-Host " [Portable File] $ExeDest ($sizeMb MB)" -ForegroundColor Cyan
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " SUCCESS! Windows version built and ready!" -ForegroundColor Green
Write-Host " Recommended: Run-Hamster.bat (starts instantly in 0.2s)" -ForegroundColor Yellow
Write-Host " Portable: HamsterDiogen.exe" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
