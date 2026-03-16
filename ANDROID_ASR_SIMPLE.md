# Android ASR 集成 - 简化配置指南

## 当前状态

✅ **代码框架已完成**
- Capacitor 插件接口已创建
- Android 原生代码已实现
- 跨平台接口已就绪

⚠️ **需要手动完成**
由于下载大文件（~70MB）在自动脚本中有问题，需要手动下载两个文件。

---

## 🔧 手动配置步骤（约 5 分钟）

### 步骤 1: 下载 Sherpa-ONNX JNI 库

**方式 A - 使用浏览器（推荐）:**

1. 访问: https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.26/sherpa-onnx-v1.12.26-android.tar.bz2

2. 下载完成后，解压文件

3. 将 `jniLibs` 文件夹复制到项目:
   ```
   源: jniLibs/*
   目标: android/app/src/main/jniLibs/
   ```

**方式 B - 使用 PowerShell（管理员权限）:**
```powershell
cd C:\ClaudeCodeProject\SpeakJapaneseApp
Invoke-WebRequest -Uri "https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.26/sherpa-onnx-v1.12.26-android.tar.bz2" -OutFile "sherpa-android.tar.bz2"

# 如果有 7-Zip
& "C:\Program Files\7-Zip\7z.exe" x sherpa-android.tar.bz2 -so | & "C:\Program Files\7-Zip\7z.exe" x -si -ttar -oandroid\app\src\main\jniLibs
```

### 步骤 2: 下载 SenseVoice 模型

**使用浏览器:**

1. 访问: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09.tar.bz2

2. 解压后，将整个文件夹复制到:
   ```
   源: sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09/*
   目标: android/app/src/main/assets/models/
   ```

### 步骤 3: 同步并构建

```bash
# 同步 Capacitor
npx cap sync android

# 构建 APK
cd android
gradlew.bat assembleDebug
```

**APK 位置:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ✨ 快速提示

### 如果只是想测试现有功能

不需要 Sherpa-ONNX 的情况下，可以直接构建现有 APK：

```bash
npm run android:build
```

这将生成一个约 4MB 的 APK（不包含本地 ASR 功能）。

### 文件大小对比

| APK 类型 | 大小 | 功能 |
|---------|------|------|
| 基础版 | ~4 MB | 云端 ASR (在线) |
| 完整版 | ~70 MB | 本地 ASR (离线) + 云端 ASR |

---

## 📝 文件位置总结

配置完成后，文件结构应该是：

```
android/app/src/main/
├── jniLibs/
│   ├── arm64-v8a/
│   │   └── libsherpa-onnx.so
│   └── armeabi-v7a/
│       └── libsherpa-onnx.so
└── assets/
    └── models/
        └── sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09/
            ├── model.onnx
            └── tokens.txt
```

---

## ❓ 需要帮助？

如果遇到问题，请查看详细文档：
- `ANDROID_ASR_INTEGRATION.md` - 完整集成指南
- `ANDROID_ASR_QUICKSTART.md` - 快速开始指南
- `SHERPA_ONNX_SUMMARY.md` - 项目总结
