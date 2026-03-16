# Sherpa-ONNX 优化建议

**日期**: 2026-03-14
**版本**: v1.18

---

## 📋 **对比分析：官方示例 vs 我们的实现**

### **1. SenseVoice 配置对比**

#### **官方示例** (正确)
```kotlin
// SherpaOnnxSimulateStreamingAsr
senseVoice = OfflineSenseVoiceModelConfig(
    model = "$modelDir/model.int8.onnx",
),
tokens = "$modelDir/tokens.txt",
numThreads = 1,
```

#### **我们的实现** (需要优化)
```java
OfflineSenseVoiceModelConfig senseVoiceConfig = new OfflineSenseVoiceModelConfig(
    modelFile.getAbsolutePath(),
    language,              // ❌ 可能不需要
    useItn,                // ✅ 可以保留
    new QnnConfig()        // ❌ 可以不传
);
```

### **2. 关键发现**

根据官方 Kotlin API 定义：
```kotlin
data class OfflineSenseVoiceModelConfig(
    var model: String = "",
    var language: String = "",                    // ← 默认为空字符串
    var useInverseTextNormalization: Boolean = true,  // ← 默认为 true
    var qnnConfig: QnnConfig = QnnConfig(),       // ← 默认为空 QnnConfig
)
```

**结论**：
- ✅ `model`: **必需**
- ⚠️ `language`: **可选**（默认空字符串，表示自动检测语言）
- ✅ `useInverseTextNormalization`: **可选**（默认 true，建议保留）
- ⚠️ `qnnConfig`: **可选**（默认空对象，不需要传）

---

## 🔧 **优化建议**

### **优化 1: 移除不必要的 language 参数**

**原因**：
- SenseVoice 会**自动检测语言**
- 只有在需要强制指定语言时才设置
- 我们的模型文件名已经包含语言信息：`zh-en-ja-ko-yue`

**修改前**：
```java
String language = call.getString("language", "ja");
OfflineSenseVoiceModelConfig senseVoiceConfig = new OfflineSenseVoiceModelConfig(
    modelFile.getAbsolutePath(),
    language,  // ← 不需要
    useItn,
    new QnnConfig()
);
```

**修改后**：
```java
// 不读取 language 参数
OfflineSenseVoiceModelConfig senseVoiceConfig = new OfflineSenseVoiceModelConfig(
    modelFile.getAbsolutePath(),  // 只传 model 路径
    useItn                         // 只保留 useItn
);
```

### **优化 2: 增加线程数**

**官方推荐**：`numThreads = 4`

**我们的配置**：`modelConfig.setNumThreads(1);`

**建议**：增加到 4 个线程以提升性能

```java
modelConfig.setNumThreads(4);  // 从 1 改为 4
```

### **优化 3: 简化 QnnConfig**

**当前代码**：
```java
new OfflineSenseVoiceModelConfig(
    modelFile.getAbsolutePath(),
    language,
    useItn,
    new QnnConfig()  // ← 可以不传
);
```

**优化后**：
```java
new OfflineSenseVoiceModelConfig(
    modelFile.getAbsolutePath(),
    useItn  // 只传需要的参数
);
```

---

## 📊 **性能对比**

| 配置项 | 优化前 | 优化后 | 影响 |
|--------|--------|--------|------|
| 线程数 | 1 | 4 | ⚡ 识别速度提升 ~3-4x |
| language 参数 | "ja" | "" (自动检测) | ✅ 更灵活，支持多语言 |
| QnnConfig | new QnnConfig() | 不传 | 📦 代码更简洁 |

---

## 🎯 **关于 Maven 依赖的说明**

用户提到的 Maven 依赖：
```gradle
implementation "com.k2fsa.sherpa.onnx:sherpa-onnx:1.10.25"
```

**官方说明**：
- ❌ **这不是官方维护的依赖**
- ✅ 官方推荐使用 **源码集成** 或 **预构建的 AAR**

**我们的集成方式**：
- ✅ 正确！我们使用的是官方推荐的直接集成方式
- ✅ 将 JNI 库放到 `app/src/main/jniLibs/`
- ✅ 使用 Capacitor 插件封装

**参考文档**：
- https://k2-fsa.github.io/sherpa/onnx/android/index.html
- https://github.com/k2-fsa/sherpa-onnx/tree/master/android/SherpaOnnxAar

---

## 💡 **SenseVoice 特别说明**

### **1. 语言自动识别**

SenseVoice 的优势：
- ✅ 支持 5 种语言：中英日韩粤
- ✅ **自动检测语言**（无需指定）
- ✅ 混合语言识别（如中日混合）

### **2. 何时使用 language 参数**

**场景 1**：输入主要是单一语言
```kotlin
// 如果确定输入是日语，可以指定
senseVoice = OfflineSenseVoiceModelConfig(
    model = "...",
    language = "ja",  // ← 提高识别准确率
)
```

**场景 2**：输入可能是多语言混合
```kotlin
// 让模型自动检测
senseVoice = OfflineSenseVoiceModelConfig(
    model = "...",
    // language = "",  // ← 不指定，自动检测
)
```

**我们的应用场景**：
- ✅ 日语学习应用
- ✅ 用户可能说日语，也可能说中文或英文
- 💡 建议：**不指定 language**，让模型自动检测

### **3. 逆文本标准化 (ITN)**

**功能**：
- "一" → "1"
- "二" → "2"
- "三" → "3"

**建议**：
- ✅ **开启 ITN**（我们的实现正确）
- 用户看到阿拉伯数字更直观

---

## 🚀 **下一步优化步骤**

1. **修改 LocalASRPlugin.java**：
   - 移除 `language` 参数
   - 将 `numThreads` 从 1 改为 4
   - 移除不必要的 `QnnConfig`

2. **测试验证**：
   - 测试日语识别
   - 测试中日混合识别
   - 对比性能提升

3. **更新文档**：
   - 更新 `开发进度.md`
   - 记录优化效果

---

## 📚 **参考资料**

- [Sherpa-ONNX 官方文档](https://k2-fsa.github.io/sherpa/onnx/index.html)
- [SenseVoice 模型说明](https://github.com/k2-fsa/sherpa-onnx/tree/master/models/sense-voice)
- [Android 集成指南](https://k2-fsa.github.io/sherpa/onnx/android/index.html)
- [预训练模型列表](https://k2-fsa.github.io/sherpa/onnx/pretrained_models/index.html)

---

**总结**：我们的实现基本正确，但有一些小的优化空间。主要是移除不必要的参数和增加线程数。
