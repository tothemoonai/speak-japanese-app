@echo off
setlocal enabledelayedexpansion

REM Windows Android ASR 设置脚本
REM 使用 PowerShell 和 7-Zip

echo ============================================
echo Android 本地语音识别自动设置 (Windows)
echo ============================================
echo.

REM 配置
set SHERPA_VERSION=v1.12.26
set MODEL_NAME=sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09
set PROJECT_ROOT=%~dp0
set ANDROID_DIR=%PROJECT_ROOT%android
set TEMP_DIR=%PROJECT_ROOT%.temp_android_asr

echo 项目根目录: %PROJECT_ROOT%
echo Android 目录: %ANDROID_DIR%
echo.

REM 检查 7-Zip
where 7z >nul 2>&1
if errorlevel 1 (
    echo 错误: 需要 7-Zip 来解压文件
    echo 请安装 7-Zip: https://www.7-zip.org/
    pause
    exit /b 1
)

echo ✓ 找到 7-Zip
echo.

REM 创建临时目录
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

cd /d "%TEMP_DIR%"

REM ============================================
REM 步骤 1: 下载 Sherpa-ONNX JNI 库
REM ============================================
echo 步骤 1: 下载 Sherpa-ONNX JNI 库
echo ------------------------------------------------------------
set SHERPA_URL=https://github.com/k2-fsa/sherpa-onnx/releases/download/%SHERPA_VERSION%/sherpa-onnx-%SHERPA_VERSION%-android.tar.bz2
set ARCHIVE=sherpa-onnx-android.tar.bz2

echo 下载: !ARCHIVE!
powershell -Command "& { Invoke-WebRequest -Uri '!SHERPA_URL!' -OutFile '!ARCHIVE!' }"
if errorlevel 1 (
    echo 下载失败
    pause
    exit /b 1
)

echo ✓ 下载完成
echo.

REM 解压
echo 解压: !ARCHIVE!
7z x -y "!ARCHIVE!" -so | 7z x -y -si -ttar >nul
if errorlevel 1 (
    echo 解压失败
    pause
    exit /b 1
)

echo ✓ 解压完成
echo.

REM 复制 JNI 库
echo 复制 JNI 库...
set JNI_DEST=%ANDROID_DIR%\app\src\main\jniLibs
if not exist "%JNI_DEST%" mkdir "%JNI_DEST%"

REM 复制所有架构
for /d %%d in (jniLibs\*) do (
    echo   复制: %%~nxd
    xcopy /e /i /y "jniLibs\%%~nxd\*" "%JNI_DEST%\%%~nxd\" >nul
)

echo ✓ JNI 库复制完成
echo.

REM ============================================
REM 步骤 2: 下载 SenseVoice 模型
REM ============================================
echo 步骤 2: 下载 SenseVoice 模型
echo ------------------------------------------------------------
set MODEL_URL=https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/%MODEL_NAME%.tar.bz2
set ARCHIVE=%MODEL_NAME%.tar.bz2

echo 下载: !ARCHIVE!
powershell -Command "& { Invoke-WebRequest -Uri '!MODEL_URL!' -OutFile '!ARCHIVE!' }"
if errorlevel 1 (
    echo 下载失败
    pause
    exit /b 1
)

echo ✓ 下载完成
echo.

REM 解压
echo 解压: !ARCHIVE!
7z x -y "!ARCHIVE!" -so | 7z x -y -si -ttar >nul
if errorlevel 1 (
    echo 解压失败
    pause
    exit /b 1
)

echo ✓ 解压完成
echo.

REM 复制模型
echo 复制模型文件...
set ASSETS_DIR=%ANDROID_DIR%\app\src\main\assets\models
if not exist "%ASSETS_DIR%" mkdir "%ASSETS_DIR%"

xcopy /e /i /y "%MODEL_NAME%" "%ASSETS_DIR%\%MODEL_NAME%\" >nul

echo ✓ 模型复制完成
echo.

REM ============================================
REM 步骤 3: 清理
REM ============================================
cd /d "%PROJECT_ROOT%"
rmdir /s /q "%TEMP_DIR%"

echo ============================================
echo ✓ Android ASR 设置完成！
echo ============================================
echo.
echo 已完成:
echo 1. ✓ JNI 库已下载并配置
echo 2. ✓ SenseVoice 模型已下载并配置
echo.
echo 下一步:
echo 1. 同步 Capacitor: npx cap sync android
echo 2. 构建 APK:
echo    cd android
echo    gradlew.bat assembleDebug
echo.
pause
