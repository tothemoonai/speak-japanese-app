# Android 本地语音识别 - 一键设置指南

## 🚀 快速开始（自动化）

只需一条命令即可完成所有配置！

```bash
npm run android:setup-asr
```

这个命令会自动完成：
1. ✅ 下载 Sherpa-ONNX JNI 库（所有架构）
2. ✅ 下载 SenseVoice 模型（~50MB）
3. ✅ 配置 Android build.gradle
4. ✅ 同步 Capacitor

完成后就可以构建 APK 了！

---

## 📦 构建 APK

设置完成后，运行：

```bash
npm run android:build
```

或者手动构建：

```bash
cd android
./gradlew assembleDebug
```

APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📊 APK 大小

- **基础 APK**: ~4 MB
- **JNI 库**: ~15 MB
- **SenseVoice 模型**: ~50 MB
- **总计**: ~70 MB

---

## 🎯 使用示例

在代码中：

```typescript
import LocalASR from '@/plugins/local-asr';

// 初始化（首次使用会从 assets 复制模型）
await LocalASR.initialize({
  language: 'ja',  // 日语
  debug: false
});

// 检查状态
const ready = await LocalASR.isReady();
console.log('就绪:', ready.ready);

// 识别音频
const result = await LocalASR.recognize({
  audioData: base64AudioData,  // Base64 编码的 PCM 16-bit 音频
  sampleRate: 16000
});

console.log('识别结果:', result.text);
```

---

## ⚙️ 脚本详解

### setup-android-asr.js

这个脚本会自动：

1. **下载 Sherpa-ONNX JNI 库**
   - 从 GitHub Releases 下载预编译的 Android 库
   - 支持 arm64-v8a, armeabi-v7a, x86, x86_64 架构
   - 复制到 `android/app/src/main/jniLibs/`

2. **下载 SenseVoice 模型**
   - 下载 INT8 量化版本
   - 支持中日英韩粤多语言
   - 复制到 `android/app/src/main/assets/models/`

3. **配置 build.gradle**
   - 自动添加 jniLibs 配置
   - 自动配置 aaptOptions
   - 不会重复添加配置

4. **同步 Capacitor**
   - 运行 `npx cap sync android`
   - 确保 Android 项目是最新的

---

## 🔧 手动操作（如果自动脚本失败）

### 1. 下载 JNI 库

```bash
cd /tmp
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.26/sherpa-onnx-v1.12.26-android.tar.bz2
tar xjf sherpa-onnx-v1.12.26-android.tar.bz2
cp -r jniLibs/* /path/to/SpeakJapaneseApp/android/app/src/main/jniLibs/
```

### 2. 下载模型

```bash
cd android/app/src/main/assets/models
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09.tar.bz2
tar xjf sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09.tar.bz2
```

### 3. 同步

```bash
npx cap sync android
cd android
./gradlew assembleDebug
```

---

## ❓ 常见问题

### Q: 脚本报错 "curl 或 wget 未找到"

**A**: 安装其中一个工具：
- Windows: 下载 [curl for Windows](https://curl.se/windows/)
- Linux: `sudo apt-get install curl`
- Mac: `brew install curl`

### Q: 下载速度慢

**A**: 脚本会自动重试。如果还是慢，可以手动下载后放到对应目录。

### Q: JNI 库不兼容

**A**: 确保下载的是正确版本（v1.12.26）。如果需要其他版本，修改 `scripts/setup-android-asr.js` 中的 `CONFIG.sherpaVersion`。

### Q: APK 安装后提示缺少库

**A**: 检查 `android/app/src/main/jniLibs/` 目录，确保所有架构的 .so 文件都存在。

---

## 📝 技术细节

### 文件结构

```
android/
├── app/
│   ├── src/main/
│   │   ├── jniLibs/           # JNI 库（自动配置）
│   │   │   ├── arm64-v8a/
│   │   │   │   └── libsherpa-onnx.so
│   │   │   └── armeabi-v7a/
│   │   │       └── libsherpa-onnx.so
│   │   └── assets/
│   │       └── models/        # 模型文件（自动配置）
│   │           └── sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09/
│   │               ├── model.onnx
│   │               └── tokens.txt
│   └── build.gradle           # 自动配置
└── ...
```

### 模型路径

运行时，模型会从 assets 复制到应用缓存目录：
```java
/data/data/com.speakjapanese.app/cache/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09/
```

这样做的好处：
- ✅ APK 打包时包含模型
- ✅ 首次运行自动提取
- ✅ 后续启动直接使用缓存

---

## 🎉 完成！

现在你的 APK 已经集成了本地语音识别功能：
- ✅ 完全离线运行
- ✅ 无需首次下载
- ✅ 支持中日英韩粤多语言
- ✅ 数据隐私保护

**Sources:**
- [Sherpa-ONNX GitHub](https://github.com/k2-fsa/sherpa-onnx)
- [Sherpa-ONNX Android Releases](https://github.com/k2-fsa/sherpa-onnx/releases)
