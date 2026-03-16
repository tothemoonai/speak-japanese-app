#!/bin/bash

echo "========================================"
echo "Starting Local Test Server for Android"
echo "========================================"
echo ""

# 1. Build the app
echo "📦 Building Next.js app..."
cd /c/ClaudeCodeProject/SpeakJapaneseApp
npm run build > /dev/null 2>&1

# 2. Start production server
echo "🚀 Starting Next.js production server on port 3000..."
npm run start > /tmp/nextjs-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server started successfully!"
    echo ""
    echo "Server is running at:"
    echo "  - http://localhost:3000"
    echo "  - http://10.0.2.2:3000 (Android emulator)"
    echo ""
    echo "📝 IMPORTANT:"
    echo "  1. Update capacitor.config.ts to use:"
    echo "     url: 'http://10.0.2.2:3000'"
    echo "  2. Run: npx cap sync android"
    echo "  3. Rebuild and install APK"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""

    # Keep script running
    wait $SERVER_PID
else
    echo "❌ Server failed to start!"
    echo "Check log at: /tmp/nextjs-server.log"
    cat /tmp/nextjs-server.log
    kill $SERVER_PID 2>/dev/null
fi
