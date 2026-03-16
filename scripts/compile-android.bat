@echo off
cd /d %~dp0
cd ..\android

echo ========================================
echo 开始编译 Android APK
echo ========================================
echo.

call gradlew.bat clean assembleDebug

echo.
echo ========================================
echo 编译完成
echo ========================================
echo.

if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo [SUCCESS] APK 已生成！
    echo.
    echo 文件位置: app\build\outputs\apk\debug\app-debug.apk
    dir "app\build\outputs\apk\debug\app-debug.apk"
    echo.
    echo 安装命令:
    echo adb install app\build\outputs\apk\debug\app-debug.apk
) else (
    echo [ERROR] APK 生成失败！
    echo 请检查上方的错误信息
)

echo.
pause
