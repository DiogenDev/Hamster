# ==============================================================================
# Скрипт сборки Android APK для игры "Хомячок Диоген"
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProjectDir = "D:\soft\HamsterDiogen"
$SdkDir = "D:\Android\sdk"
$CmdlineToolsZip = "D:\Android\cmdline-tools.zip"
$ApkDest = Join-Path $ProjectDir "HamsterDiogen.apk"

Write-Host "🐹 === НАЧАЛО СБОРКИ ANDROID APK: ХОМЯЧОК ДИОГЕН ===" -ForegroundColor Cyan

# 1. Проверка Java
Write-Host "`n[1/5] Проверка окружения Java..." -ForegroundColor Yellow
$javaVer = java -version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Java не найдена в системе. Убедитесь, что JDK установлен."
}
Write-Host "Java обнаружена:" -ForegroundColor Green
$javaVer | Select-Object -First 1 | Write-Host -ForegroundColor Green

# 2. Проверка и подготовка Android SDK
Write-Host "`n[2/5] Проверка Android SDK в $SdkDir..." -ForegroundColor Yellow
if (!(Test-Path "$SdkDir\platforms\android-36") -or !(Test-Path "$SdkDir\build-tools\36.0.0")) {
    Write-Host "Android SDK не найден или не полон. Выполняю автоматическую установку..." -ForegroundColor Yellow
    
    if (!(Test-Path "D:\Android")) {
        New-Item -ItemType Directory -Path "D:\Android" -Force | Out-Null
    }

    if (!(Test-Path "$SdkDir\cmdline-tools\latest\bin\sdkmanager.bat")) {
        Write-Host "Скачивание Android Command Line Tools (Google)..." -ForegroundColor Cyan
        curl.exe -L -o $CmdlineToolsZip "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
        
        Write-Host "Распаковка Command Line Tools..." -ForegroundColor Cyan
        Expand-Archive -Path $CmdlineToolsZip -DestinationPath "D:\Android\temp_tools" -Force
        
        New-Item -ItemType Directory -Path "$SdkDir\cmdline-tools" -Force | Out-Null
        if (Test-Path "$SdkDir\cmdline-tools\latest") {
            Remove-Item "$SdkDir\cmdline-tools\latest" -Recurse -Force
        }
        Move-Item -Path "D:\Android\temp_tools\cmdline-tools" -Destination "$SdkDir\cmdline-tools\latest"
        Remove-Item "D:\Android\temp_tools" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $CmdlineToolsZip -Force -ErrorAction SilentlyContinue
    }

    Write-Host "Установка компонентов Android SDK (platforms;android-36, build-tools;36.0.0)..." -ForegroundColor Cyan
    $sdkManager = "$SdkDir\cmdline-tools\latest\bin\sdkmanager.bat"
    
    # Принятие лицензий
    "y`ny`ny`ny`ny`ny`ny`ny`ny`n" | cmd.exe /c "`"$sdkManager`" --sdk_root=`"$SdkDir`" --licenses"
    
    # Установка платформ
    cmd.exe /c "`"$sdkManager`" --sdk_root=`"$SdkDir`" `"platform-tools`" `"platforms;android-36`" `"build-tools;36.0.0`""
}

Write-Host "Android SDK готов!" -ForegroundColor Green

# 3. Настройка local.properties
Write-Host "`n[3/5] Обновление local.properties..." -ForegroundColor Yellow
$escapedSdk = $SdkDir.Replace("\", "\\")
Set-Content -Path (Join-Path $ProjectDir "android\local.properties") -Value "sdk.dir=$escapedSdk"

# 4. Сборка веб-ассетов Next.js и синхронизация Capacitor
Write-Host "`n[4/5] Экспорт Next.js и синхронизация Capacitor..." -ForegroundColor Yellow
Set-Location $ProjectDir
cmd.exe /c "npm.cmd run export"
if ($LASTEXITCODE -ne 0) { Write-Error "Ошибка экспорта Next.js" }

cmd.exe /c "npx.cmd cap sync android"
if ($LASTEXITCODE -ne 0) { Write-Error "Ошибка синхронизации Capacitor" }

# 5. Компиляция APK через Gradle
Write-Host "`n[5/5] Компиляция Android APK через Gradle Wrapper..." -ForegroundColor Yellow
Set-Location (Join-Path $ProjectDir "android")
$env:ANDROID_HOME = $SdkDir
$env:ANDROID_SDK_ROOT = $SdkDir

cmd.exe /c "gradlew.bat assembleDebug"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Ошибка сборки Gradle APK"
}

# 6. Копирование готового файла APK
$builtApk = Join-Path $ProjectDir "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $builtApk) {
    Copy-Item -Path $builtApk -Destination $ApkDest -Force
    $sizeMb = [math]::round((Get-Item $ApkDest).Length / 1MB, 2)
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "🎉 УСПЕХ! APK СОБРАН И ГОТОВ К УСТАНОВКЕ НА ТЕЛЕФОН!" -ForegroundColor Green
    Write-Host "Файл: $ApkDest ($sizeMb МБ)" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Error "Собранный APK не найден по пути $builtApk"
}
