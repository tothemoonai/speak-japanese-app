# Android 本地语音识别集成指南

## 概述

本文档说明如何将 Sherpa-ONNX 和 SenseVoice 模型集成到 Android APK 中，实现离线语音识别。

## 已完成的工作

### 1. Capacitor 插件接口

已创建完整的 Capacitor 插件：

**文件结构：**
```
src/plugins/local-asr/
├── definitions.ts    # 插件接口定义
├── index.ts          # 导出文件
└── web.ts            # Web 平台实现（调用 Sherpa-ONNX WASM）
```

**插件接口：**
```typescript
import LocalASR from '@/plugins/local-asr';

// 初始化
await LocalASR.initialize({
  language: 'ja',  // 日语
  modelPath: 'models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09',
  useInverseTextNormalization: true,
  debug: false
});

// 识别
const result = await LocalASR.recognize({
  audioData: base64AudioData,
  sampleRate: 16000
});
console.log(result.text);

// 检查状态
const ready = await LocalASR.isReady();

// 释放资源
await LocalASR.release();
```

### 2. Android 原生实现

已创建 Android 插件实现：

**文件：**
- `android/app/src/main/java/com/speakjapanese/app/plugins/LocalASRPlugin.java`
- `android/app/src/main/java/com/speakjapanese/app/plugins/SherpaASRWrapper.java`

**功能：**
- Capacitor 插件接口
- 自动从 assets 复制模型到缓存
- JNI 调用 Sherpa-ONNX 原生库
- 音频数据转换（Base64 → Float32Array）

### 3. 准备脚本

已创建 Android 准备脚本：
- `scripts/prepare-android-asr.sh`

---

## 待完成的步骤

### 步骤 1: 准备 JNI 库

有两种方式获取 Sherpa-ONNX JNI 库：

#### 方式 A: 下载预编译的 AAR（推荐）

```bash
# 1. 下载预编译的 Android 库
cd /tmp
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.26/sherpa-onnx-v1.12.26-android.tar.bz2
tar xjf sherpa-onnx-v1.12.26-android.tar.bz2

# 2. 复制 JNI 库到项目
cp -r jniLibs/* /path/to/SpeakJapaneseApp/android/app/src/main/jniLibs/

# 3. 复制 JAR 文件（如果有的话）
mkdir -p android/app/libs
cp -v sherpa-onnx-android/*.jar android/app/libs/
```

#### 方式 B: 自己编译 AAR

```bash
# 克隆 Sherpa-ONNX 仓库
git clone https://github.com/k2-fsa/sherpa-onnx.git
cd sherpa-onnx

# 下载预编译的库
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.26/sherpa-onnx-v1.12.26-android.tar.bz2
tar xjf sherpa-onnx-v1.12.26-android.tar.bz2

# 复制到 AAR 项目
cp -rv jniLibs/* android/SherpaOnnxAar/sherpa_onnx/src/main/jniLibs/

# 构建 AAR
cd android/SherpaOnnxAar
./gradlew :sherpa_onnx:assembleRelease

# 提取 JNI 库
unzip -o sherpa_onnx/build/outputs/aar/sherpa_onnx-release.aar -d aar_extract/
cp -rv aar_extract/jni/* /path/to/SpeakJapaneseApp/android/app/src/main/jniLibs/
```

### 步骤 2: 下载并配置模型文件

运行准备脚本：

```bash
# Linux/Mac
bash scripts/prepare-android-asr.sh

# 或手动下载：
cd android/app/src/main/assets/models
wget https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09.tar.bz2
tar xjf sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09.tar.bz2
```

### 步骤 3: 配置 Android build.gradle

编辑 `android/app/build.gradle`：

```gradle
android {
    // ... 现有配置 ...

    // 添加 sourceSets 以包含 JNI 库
    sourceSets {
        main {
            jniLibs.srcDirs = ['src/main/jniLibs']
        }
    }

    // 确保打包 assets
    aaptOptions {
        ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:<dir>_*:!CVS:!thumbs.db:!picasa.ini:!*~'
    }
}

dependencies {
    // ... 现有依赖 ...

    // 如果有 sherpa-onnx 的 JAR，添加它
    implementation fileTree(dir: 'libs', include: ['*.jar'])
}
```

### 步骤 4: 实现 JNI C++ 代码（可选）

如果需要自定义 JNI 实现，创建：

`android/app/src/main/cpp/sherpa-asr-jni.cpp`:

```cpp
#include <jni.h>
#include <string>
#include "sherpa-onnx/csrc/offline-recognizer.h"

// 全局识别器指针
static sherpa_onnx::OfflineRecognizer *recognizer = nullptr;

extern "C" JNIEXPORT jboolean JNICALL
Java_com_speakjapanese_app_plugins_SherpaASRWrapper_createRecognizer(
    JNIEnv *env,
    jobject thiz,
    jstring modelPath,
    jstring tokensPath,
    jstring language,
    jboolean useItn,
    jboolean debug) {

    // 实现创建识别器的代码
    // ...

    return true;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_speakjapanese_app_plugins_SherpaASRWrapper_recognize(
    JNIEnv *env,
    jobject thiz,
    jfloatArray samples,
    jint sampleCount,
    jint sampleRate) {

    // 实现识别代码
    // ...

    return resultString;
}

extern "C" JNIEXPORT void JNICALL
Java_com_speakjapanese_app_plugins_SherpaASRWrapper_releaseRecognizer(
    JNIEnv *env,
    jobject thiz) {

    // 实现释放代码
    // ...
}
```

然后在 `android/app/build.gradle` 中添加：

```gradle
android {
    // ...
    externalNativeBuild {
        cmake {
            cppFlags "-std=c++17"
            arguments "-DANDROID_STL=c++_shared"
        }
    }
}

externalNativeBuild {
    cmake {
        path "src/main/cpp/CMakeLists.txt"
        version "3.22.1"
    }
}
```

### 步骤 5: 同步并构建

```bash
# 同步 Capacitor
npx cap sync android

# 构建 APK
cd android
./gradlew assembleDebug

# APK 位置：
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 使用示例

在 React 组件中使用：

```typescript
import { useEffect, useState } from 'react';
import LocalASR from '@/plugins/local-asr';

export default function MyComponent() {
  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    // 初始化
    const init = async () => {
      try {
        await LocalASR.initialize({
          language: 'ja',
          debug: true
        });

        const ready = await LocalASR.isReady();
        setIsReady(ready.ready);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    init();
  }, []);

  const handleRecognize = async (audioBase64: string) => {
    const recognitionResult = await LocalASR.recognize({
      audioData: audioBase64,
      sampleRate: 16000
    });

    if (recognitionResult.success) {
      setResult(recognitionResult.text);
    }
  };

  return (
    <div>
      <p>状态: {isReady ? '就绪' : '未就绪'}</p>
      <p>结果: {result}</p>
    </div>
  );
}
```

---

## 文件大小影响

集成后 APK 大小变化：

- **基础 APK**: ~4 MB
- **JNI 库**: ~10-15 MB
- **SenseVoice 模型**: ~50-100 MB
- **总计**: ~65-120 MB

---

## 故障排查

### 1. JNI 库未找到

**错误**: `java.lang.UnsatisfiedLinkError: couldn't find "libsherpa-onnx.so"`

**解决**:
- 检查 `android/app/src/main/jniLibs/` 目录
- 确保所有架构的 .so 文件都存在
- 运行 `npx cap sync android`

### 2. 模型文件未找到

**错误**: `Failed to open model file`

**解决**:
- 检查 `android/app/src/main/assets/models/` 目录
- 确保模型文件完整
- 运行 `npx cap sync android` 重新打包

### 3. 识别结果为空

**检查**:
- 音频格式是否正确（PCM 16-bit, 16kHz）
- 语言设置是否正确
- 查看日志（使用 `debug: true`）

---

## 参考资源

- [Sherpa-ONNX GitHub](https://github.com/k2-fsa/sherpa-onnx)
- [Sherpa-ONNX Android 示例](https://github.com/k2-fsa/sherpa-onnx/tree/master/android)
- [SenseVoice 模型](https://github.com/k2-fsa/sherpa-onnx/releases/tag/sense-models)
- [Capacitor 插件开发](https://capacitorjs.com/docs/plugins/creating-plugins)

---

**最后更新:** 2025-03-11
