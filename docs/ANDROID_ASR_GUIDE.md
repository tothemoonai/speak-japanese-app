# Android 本地语音识别 - 测试与开发指南

## 📱 **系统架构**

### Android 端实现

```
┌─────────────────────────────────────────┐
│   Web Layer (React Native / WebView)   │
│   - LocalASR Plugin Interface          │
│   - useLocalASRAndroid Hook            │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Capacitor Plugin Bridge              │
│   - LocalASRPlugin.java                │
│   - PluginCall / JSObject              │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Native Layer                          │
│   - SherpaASRWrapper.java              │
│   - JNI Interface                      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Sherpa-ONNX Native Library           │
│   - libsherpa-onnx.so                  │
│   - libonnxruntime.so                  │
└─────────────────────────────────────────┘
```

---

## 📂 **文件结构**

### Android 原生代码

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/speakjapanese/app/
│   │       │   ├── MainActivity.java              # 主活动
│   │       │   └── plugins/
│   │       │       ├── LocalASRPlugin.java        # Capacitor插件
│   │       │       └── SherpaASRWrapper.java      # JNI包装类
│   │       ├── assets/
│   │       │   └── models/
│   │       │       └── sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09/
│   │       │           ├── model.int8.onnx        # INT8量化模型 (227MB)
│   │       │           └── tokens.txt             # 分词器 (309KB)
│   │       └── jniLibs/
│   │           ├── arm64-v8a/
│   │           │   ├── libsherpa-onnx.so
│   │           │   ├── libonnxruntime.so
│   │           │   └── libsherpa-onnx-jni.so
│   │           ├── armeabi-v7a/
│   │           └── x86_64/
```

### Web 端代码

```
src/
├── plugins/
│   └── local-asr/
│       ├── index.ts                        # 插件注册
│       ├── definitions.ts                  # TypeScript 定义
│       └── web.ts                          # Web 实现占位
├── hooks/
│   └── useLocalASRAndroid.ts               # Android Hook
└── app/
    └── test-android-asr/
        └── page.tsx                        # 测试页面
```

---

## 🚀 **快速开始**

### 1. 构建 Android APK

```bash
# 进入 Android 目录
cd android

# Windows
gradlew.bat assembleDebug

# Linux/Mac
./gradlew assembleDebug

# APK 输出位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 2. 安装到设备

```bash
# 通过 USB 安装
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 或通过 Capacitor
npx cap sync android
npx cap open android
```

### 3. 运行应用

```bash
# 在 Android Studio 中运行
# 或通过命令行
npx cap run android
```

---

## 🧪 **测试功能**

### 访问测试页面

应用启动后，在浏览器中访问：
```
http://localhost:3000/test-android-asr
```

或者在 Android 应用中导航到测试页面。

### 测试步骤

1. **初始化 ASR**
   - 点击"初始化 ASR"按钮
   - 等待模型加载（首次使用需要时间）
   - 状态显示"就绪"

2. **开始录音**
   - 点击"开始录音"按钮
   - 授予麦克风权限
   - 说日语句子

3. **停止录音**
   - 点击"停止录音"按钮
   - 等待识别完成
   - 查看识别结果

---

## 🔧 **开发调试**

### 查看 Android 日志

```bash
# 实时查看日志
adb logcat | grep -E "SherpaASR|LocalASR"

# 过滤特定标签
adb logcat -s SherpaASRWrapper:D LocalASRPlugin:D
```

### 常见日志标签

- `SherpaASRWrapper`: JNI 包装类日志
- `LocalASRPlugin`: 插件日志
- `MainActivity`: 主活动日志

### 调试模式

初始化时启用调试日志：

```typescript
await asr.initialize({
  language: 'ja',
  debug: true,  // 启用详细日志
});
```

---

## 📊 **性能指标**

### 模型信息

| 指标 | 值 |
|------|-----|
| 模型大小 | 227 MB (INT8) |
| 分词器 | 309 KB |
| 支持语言 | 中文、英语、日语、韩语、粤语 |
| 采样率 | 16 kHz |
| 音频格式 | PCM 16-bit |

### 性能预期

| 操作 | 预期时间 |
|------|---------|
| 模型初始化 | 3-5 秒（首次） |
| 识别延迟 | < 500 ms |
| 内存占用 | ~300 MB |

---

## ⚠️ **注意事项**

### 1. 首次运行

- 模型文件会从 assets 复制到缓存目录
- 首次初始化需要 3-5 秒
- 后续启动会使用缓存，速度更快

### 2. 内存管理

- 模型加载后会占用约 300MB 内存
- 不使用时调用 `release()` 释放资源
- 组件卸载时自动释放

### 3. 权限要求

应用需要以下权限（已在 `capacitor.config.ts` 中配置）：

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### 4. 平台限制

- 仅支持 Android 平台
- 需要 Android 5.0 (API 21) 或更高
- 推荐 Android 7.0 (API 24) 或更高

---

## 🐛 **故障排除**

### 问题 1: 初始化失败

**症状**: ASR 状态显示"未初始化"

**解决方案**:
1. 检查模型文件是否存在
2. 查看日志：`adb logcat | grep LocalASR`
3. 确认 assets 目录包含完整模型文件

### 问题 2: 识别返回空结果

**症状**: 识别成功但返回空文本

**解决方案**:
1. 确认音频采样率为 16 kHz
2. 检查音频格式（PCM 16-bit）
3. 确认语言参数正确（`ja`）

### 问题 3: 应用崩溃

**症状**: 应用在初始化或识别时崩溃

**解决方案**:
1. 检查 JNI 库是否匹配架构
2. 确认设备架构（arm64-v8a, armeabi-v7a）
3. 查看崩溃日志：`adb logcat | grep AndroidRuntime`

---

## 📈 **后续优化**

### 计划功能

1. **流式识别**
   - 支持实时识别（边说边识别）
   - 降低识别延迟

2. **多模型支持**
   - 支持用户选择不同模型
   - 支持在线模型切换

3. **性能优化**
   - 模型量化（INT4）
   - 硬件加速（GPU/NPU）

4. **UI 增强**
   - 实时波形显示
   - 识别进度条
   - 历史记录

---

## 📚 **相关文档**

- [Sherpa-ONNX GitHub](https://github.com/k2-fsa/sherpa-onnx)
- [Capacitor Android 插件开发](https://capacitorjs.com/docs/android/plugin)
- [SenseVoice 模型](https://github.com/FunAudioLLM/SenseVoice)
- [开发进度文件](../开发进度.MD)

---

**最后更新**: 2026-03-12
**版本**: v1.0.0-alpha
