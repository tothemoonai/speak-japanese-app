# Android ASR 问题分析报告

**日期**: 2026-03-14
**版本**: v1.17
**状态**: 🔴 发现关键问题

---

## 🔴 **核心问题：音频格式不匹配**

### **当前实现（错误）**

```typescript
// TestAndroidASRContent.tsx (JavaScript)
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/mp4'  // ❌ 编码过的音频格式
});

// 录制编码过的音频（AAC/Opus）
const audioBlob = new Blob(chunks, { type: 'audio/mp4' });

// 转换为 Base64
const base64 = btoa(binary);

// 发送到 Android
await asr.recognize(base64, 16000);
```

```java
// LocalASRPlugin.java (Android)
// 接收 Base64
byte[] audioBytes = Base64.decode(audioDataBase64, Base64.DEFAULT);

// ❌ 错误假设：认为这是 PCM 16-bit 数据
float[] samples = bytesToFloats(audioBytes);  // ❌ 错误！

// 传递给 ASR
stream.acceptWaveform(samples, sampleRate);
```

### **官方实现（正确）**

```kotlin
// MainActivity.kt (官方示例)
val audioFormat = AudioFormat.ENCODING_PCM_16BIT
val buffer = ShortArray(bufferSize)

// ✅ 直接录制 PCM 16-bit 原始数据
audioRecord.read(buffer, 0, buffer.size)

// ✅ 转换为 FloatArray
val samples = FloatArray(ret) { buffer[it] / 32768.0f }

// ✅ 传递给 ASR
stream.acceptWaveform(samples, sampleRate = sampleRateInHz)
```

---

## ❌ **问题根源**

1. **MediaRecorder 录制的是编码音频**：
   - `audio/mp4` → AAC 编码
   - `audio/webm` → Opus/Vorbis 编码
   - 这些是**压缩格式**，不是原始 PCM 数据

2. **Java 端错误解码**：
   ```java
   // 这个函数假设接收到的是 PCM 16-bit 数据
   private float[] bytesToFloats(byte[] bytes) {
       short sample = (short) ((bytes[i * 2 + 1] << 8) | (bytes[i * 2] & 0xFF));
       samples[i] = sample / 32768.0f;  // ❌ 错误！
   }
   ```
   - 实际接收到的是 AAC/Opus 编码数据
   - 将编码数据当作 PCM 解析，得到的是随机噪声

3. **ASR 接收到错误数据**：
   - Sherpa-ONNX 期望接收 FloatArray PCM 数据（范围 -1.0 到 1.0）
   - 实际接收到的是解码后的错误数据
   - 识别结果为空或错误

---

## ✅ **解决方案**

### **方案 1：Android 端录制（推荐）**

**优点**：
- ✅ 与官方示例一致
- ✅ 直接获取 PCM 数据
- ✅ 性能更好

**实现步骤**：

1. 在 `LocalASRPlugin.java` 中添加录音方法：
   ```java
   @PluginMethod
   public void startRecording(PluginCall call) {
       // 使用 AudioRecord 录制 PCM 16-bit
       audioRecord = new AudioRecord(
           MediaRecorder.AudioSource.MIC,
           16000,
           AudioFormat.CHANNEL_IN_MONO,
           AudioFormat.ENCODING_PCM_16BIT,
           bufferSize
       );
       audioRecord.startRecording();
   }
   ```

2. 在 JavaScript 中调用：
   ```typescript
   await LocalASR.startRecording();

   // 等待 5 秒
   await delay(5000);

   // 停止并识别
   const result = await LocalASR.stopAndRecognize();
   ```

### **方案 2：JavaScript 端获取 PCM**

**优点**：
- ✅ 不需要修改 Android 代码
- ✅ 使用 Web Audio API

**实现步骤**：

1. 使用 AudioContext 获取 PCM：
   ```typescript
   const audioContext = new AudioContext({ sampleRate: 16000 });
   const source = audioContext.createMediaStreamSource(stream);
   const processor = audioContext.createScriptProcessor(4096, 1, 1);

   processor.onaudioprocess = (e) => {
       const inputData = e.inputBuffer.getChannelData(0);  // ✅ Float32Array PCM
       // 直接编码为 Base64
       const float32Array = new Float32Array(inputData);
       const base64 = arrayBufferToBase64(float32Array.buffer);
   };
   ```

2. 修改 Java 端接收 Float32：
   ```java
   // 接收 Float32 数据，而不是 PCM 16-bit
   private float[] bytesToFloats(byte[] bytes) {
       ByteBuffer buffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
       float[] samples = new float[bytes.length / 4];
       for (int i = 0; i < samples.length; i++) {
           samples[i] = buffer.getFloat();
       }
       return samples;  // ✅ 直接使用
   }
   ```

### **方案 3：使用现成的 Sherpa-ONNX APK（测试用）**

从官方下载预编译的 APK 进行测试：
- https://huggingface.co/k2-fsa/sherpa-onnx-android-offline-asr
- 验证 SenseVoice 模型是否能正确识别日语

---

## 📊 **测试验证**

### **测试步骤**：

1. **先测试官方 APK**：
   ```bash
   # 下载官方 APK
   wget https://huggingface.co/k2-fsa/sherpa-onnx-android-offline-asr/resolve/main/sherpa-onnx-android-offline-asr.apk

   # 安装到设备
   adb install sherpa-onnx-android-offline-asr.apk

   # 测试日语识别
   ```

2. **验证我们的修复**：
   - 实施方案 1 或方案 2
   - 使用相同测试音频
   - 对比识别结果

---

## 🎯 **下一步行动**

1. **立即行动**：
   - ✅ 下载官方 APK 测试
   - ✅ 实施 Android 端录音（方案 1）

2. **代码修改**：
   - 修改 `LocalASRPlugin.java`
   - 修改 `TestAndroidASRContent.tsx`
   - 测试验证

3. **文档更新**：
   - 更新 `开发进度.md`
   - 记录修复过程

---

**关键参考**：
- [Sherpa-ONNX Android 示例](https://github.com/k2-fsa/sherpa-onnx/tree/master/android/SherpaOnnx)
- [AudioRecord 文档](https://developer.android.com/reference/android/media/AudioRecord)
- [预编译 APK](https://huggingface.co/k2-fsa/sherpa-onnx-android-offline-asr)
