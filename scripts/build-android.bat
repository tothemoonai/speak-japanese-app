@echo off
REM Android APK 快速构建脚本

echo ========================================
echo 日语口语练习 App - Android 构建脚本
echo ========================================
echo.

echo [1/4] 清理旧的构建...
cd android
call gradlew.bat clean
if errorlevel 1 (
    echo 清理失败！
    pause
    exit /b 1
)
echo.

echo [2/4] 构建 Debug APK...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo 构建失败！
    pause
    exit /b 1
)
echo.

echo [3/4] 检查 APK 文件...
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo ✓ APK 构建成功！
    echo.
    echo APK 位置:
    echo app\build\outputs\apk\debug\app-debug.apk
    echo.
    for %%A in ("app\build\outputs\apk\debug\app-debug.apk") do (
        set size=%%~zA
        set /a sizeMB=!size! / 1048576
        echo 文件大小: !sizeMB! MB
    )
) else (
    echo ✗ APK 文件未找到！
    pause
    exit /b 1
)
echo.

echo [4/4] 安装到设备...
echo.
echo 请通过以下方式安装:
echo.
echo 方式1: 使用 ADB
echo   adb install app\build\outputs\apk\debug\app-debug.apk
echo.
echo 方式2: 复制到手机安装
echo   将 APK 文件复制到手机，直接打开安装
echo.
echo ========================================
echo 构建完成！
echo ========================================
pause
