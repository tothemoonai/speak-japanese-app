@echo off
echo ========================================
echo Starting Local Test Server for Android
echo ========================================
echo.

cd /d C:\ClaudeCodeProject\SpeakJapaneseApp

echo 1. Checking if build exists...
if not exist ".next\static\chunks" (
    echo [!] Build not found. Building now...
    call npm run build
)

echo.
echo 2. Starting Next.js production server...
echo    Server will run at http://localhost:3000
echo.
echo IMPORTANT: Keep this window open!
echo Press Ctrl+C to stop the server when done testing.
echo.

start "Next.js Server" cmd /k "npm run start"

echo.
echo ✅ Server started!
echo.
echo To use this server with Android:
echo 1. Update capacitor.config.ts: url: 'http://10.0.2.2:3000'
echo 2. Run: npx cap sync android ^&^& node scripts/fix-android-plugins.js
echo 3. Build APK: cd android ^&^& gradlew assembleDebug
echo 4. Install APK in Android Studio
echo.
echo Server log window should be open now.
echo.
pause
