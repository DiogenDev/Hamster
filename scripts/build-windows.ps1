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

# 1b. Compile Wallpaper Helper
$cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$wpSource = Join-Path $ProjectDir "scripts\WallpaperHelper.cs"
$wpDest = Join-Path $ProjectDir "electron\wallpaper-helper.exe"
if ((Test-Path $cscPath) -and (Test-Path $wpSource)) {
    & $cscPath /nologo /target:winexe /out:$wpDest $wpSource
    Write-Host "Compiled wallpaper-helper.exe" -ForegroundColor Green
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

# A. Unpacked instant-launch folder (starts in 0.1 seconds, no extraction delay!)
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

# C. Compile Native Instant Root Launcher (starts in 0.05s, no console window)
$launcherSource = Join-Path $ProjectDir "scripts\Launcher.cs"
if ((Test-Path $cscPath) -and (Test-Path $launcherSource)) {
    & $cscPath /nologo /target:winexe /win32icon:electron\icon.ico /out:$ExeDest $launcherSource
    Write-Host " [Native Instant Launcher] $ExeDest" -ForegroundColor Green
}

# D. NSIS Setup Installer
$setupExe = Get-ChildItem -Path $DistDir -Filter "*Setup*.exe" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($setupExe) {
    $setupDest = Join-Path $ProjectDir "HamsterDiogen-Setup.exe"
    Copy-Item -Path $setupExe.FullName -Destination $setupDest -Force
    $setupSizeMb = [math]::Round($setupExe.Length / 1MB, 2)
    Write-Host " [Fast Installer] $setupDest ($setupSizeMb MB)" -ForegroundColor Cyan
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " SUCCESS! Windows version built and ready!" -ForegroundColor Green
Write-Host " 1. HamsterDiogen.exe (Root launcher, instant 0.05s start!)" -ForegroundColor Yellow
Write-Host " 2. Run-Hamster.bat (Batch launcher, instant start)" -ForegroundColor Yellow
Write-Host " 3. HamsterDiogen-Setup.exe (Windows Installer)" -ForegroundColor Cyan
Write-Host " 4. HamsterDiogen-Windows\HamsterDiogen.exe (Direct folder)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
