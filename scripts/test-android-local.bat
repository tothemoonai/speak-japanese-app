@echo off
echo ========================================
echo Starting Local Test Server for Android
echo ========================================
echo.
echo 1. Starting Next.js production server...
start "Next.js Server" cmd /k "npm run start"
echo.
echo 2. Waiting for server to start...
timeout /t 5 /nobreak
echo.
echo 3. Syncing Capacitor config...
call npx cap sync android
call node scripts/fix-android-plugins.js
echo.
echo 4. Building APK...
cd android
call gradlew assembleDebug
cd ..
echo.
echo ========================================
echo APK built successfully!
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo IMPORTANT: The app will load from http://10.0.2.2:3000
echo Make sure the Next.js server is running when you test!
echo ========================================
echo.
pause
