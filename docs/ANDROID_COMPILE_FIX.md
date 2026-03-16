# Android 编译错误修复

## 🐛 **问题 1: 方法重复定义**

**错误信息**:
```
已在类 SherpaASRWrapper中定义了方法 recognize(float[],int,int)
```

**原因**:
- 第52行定义了 native 方法 `recognize(float[], int, int)`
- 第86行又定义了同名方法 `recognize(float[], int, int)`
- 导致方法签名冲突

**修复方案**:
将第86行的 Java 包装方法改名为 `recognizeAudio`

```java
// 修复前（错误）
public String recognize(float[] samples, int sampleCount, int sampleRate) {
    return recognize(samples, sampleCount, sampleRate); // 调用自己，无限递归
}

// 修复后（正确）
public String recognizeAudio(float[] samples, int sampleCount, int sampleRate) {
    return recognize(samples, sampleCount, sampleRate); // 调用 native 方法
}
```

**同步修改**:
更新 `LocalASRPlugin.java` 第96行：
```java
// 修复前
String result = recognizer.recognize(samples, samples.length, sampleRate);

// 修复后
String result = recognizer.recognizeAudio(samples, samples.length, sampleRate);
```

---

## 🐛 **问题 2: 类型不兼容**

**错误信息**:
```
不兼容的类型: boolean无法转换为long
recognizerHandle = createRecognizer(modelPath, tokensPath, language, useItn, debug);
```

**原因**:
- `createRecognizer` 返回 `boolean`
- 但赋值给 `long` 类型的 `recognizerHandle`

**修复方案**:
将 `createRecognizer` 的返回类型从 `boolean` 改为 `long`

```java
// 修复前（错误）
public native boolean createRecognizer(
    String modelPath,
    String tokensPath,
    String language,
    boolean useItn,
    boolean debug
);

// 修复后（正确）
public native long createRecognizer(
    String modelPath,
    String tokensPath,
    String language,
    boolean useItn,
    boolean debug
);
```

**说明**:
- 返回 `long` 类型（识别器句柄）
- 返回 `0` 表示失败
- 返回非 `0` 表示成功，返回值为句柄值

---

## ✅ **修复验证**

**修复文件**:
1. `android/app/src/main/java/com/speakjapanese/app/plugins/SherpaASRWrapper.java`
   - 第36行：`createRecognizer` 返回类型改为 `long`
   - 第86行：`recognize` 方法改名为 `recognizeAudio`

2. `android/app/src/main/java/com/speakjapanese/app/plugins/LocalASRPlugin.java`
   - 第96行：调用改为 `recognizeAudio`

**编译测试**:
```bash
cd android
gradlew.bat assembleDebug
```

**预期结果**:
- ✅ 编译成功，无错误
- ✅ APK 生成于：`app/build/outputs/apk/debug/app-debug.apk`

---

## 📝 **技术说明**

### JNI 方法命名规范

JNI native 方法的 Java 声明和实现必须匹配：

```java
// Java 声明
public native long createRecognizer(...);

// JNI 实现（C++）
JNIEXPORT jlong JNICALL Java_com_speakjapanese_app_plugins_SherpaASRWrapper_createRecognizer
  (JNIEnv *, jobject, jstring, jstring, jstring, jboolean, jboolean);
```

### 方法重载规则

Java 中可以重载方法，但不能有完全相同的签名：

```java
// 错误：两个方法签名完全相同
public native String recognize(float[], int, int);
public String recognize(float[], int, int) { }

// 正确：方法名不同
public native String recognize(float[], int, int);
public String recognizeAudio(float[], int, int) { }
```

---

**修复时间**: 2026-03-12 17:45
**状态**: ✅ 已修复，等待编译验证
