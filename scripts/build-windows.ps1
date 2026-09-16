# ==============================================================================
# Скрипт сборки Windows EXE (.exe) для игры "Хомячок Диоген"
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProjectDir = "D:\soft\HamsterDiogen"
$ExeDest = Join-Path $ProjectDir "HamsterDiogen.exe"
$DistDir = Join-Path $ProjectDir "dist"

Write-Host "🐹 === НАЧАЛО СБОРКИ WINDOWS ИСПОЛНЯЕМОГО ФАЙЛА (.EXE) ===" -ForegroundColor Cyan

# 1. Экспорт статических ассетов Next.js
Write-Host "`n[1/3] Сборка Next.js (Static Export)..." -ForegroundColor Yellow
Set-Location $ProjectDir
& cmd.exe /c "npm.cmd run export"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Ошибка сборки Next.js export."
}

# 2. Упаковка через electron-builder
Write-Host "`n[2/3] Упаковка портативного приложения через electron-builder..." -ForegroundColor Yellow
& cmd.exe /c "npx.cmd electron-builder --win"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Ошибка упаковки electron-builder."
}

# 3. Поиск и копирование готового EXE файла
Write-Host "`n[3/3] Подготовка файла HamsterDiogen.exe..." -ForegroundColor Yellow
$builtExe = Get-ChildItem -Path $DistDir -Filter "*.exe" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($builtExe) {
    Copy-Item -Path $builtExe.FullName -Destination $ExeDest -Force
    $sizeMb = [math]::Round($builtExe.Length / 1MB, 2)
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " УСПЕХ! Windows-версия успешно собрана!" -ForegroundColor Green
    Write-Host " Файл: $ExeDest ($sizeMb МБ)" -ForegroundColor Cyan
    Write-Host " Исходный билд: $($builtExe.FullName)" -ForegroundColor DarkGray
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Error "Не удалось найти скомпилированный .exe файл в $DistDir"
}
