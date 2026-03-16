# Android ASR 调试指南

## 🔍 问题：初始化失败

当测试页面提示"初始化失败，请检查模型文件"时，请按以下步骤进行调试。

---

## 📱 步骤1：安装更新版APK

1. 卸载旧版本APP
2. 安装新编译的APK（包含详细日志）
3. 打开APP并访问测试页面

---

## 📊 步骤2：查看实时日志

### 方法A：使用ADB查看日志（推荐）

```bash
# 1. 连接Android设备到电脑，启用USB调试

# 2. 查看实时日志（过滤ASR相关）
adb logcat | grep -E "LocalASR|SherpaASR"

# 3. 查看所有日志
adb logcat | grep -E "LocalASR|SherpaASR|System.err"

# 4. 保存日志到文件
adb logcat -v time > asr_debug.log
```

### 方法B：使用Android Studio

1. 打开Android Studio
2. View → Tool Windows → Logcat
3. 连接设备
4. 在过滤器中输入：`LocalASR|SherpaASR`

### 方法C：使用adb shell直接查看

```bash
# 进入设备shell
adb shell

# 查看日志
logcat -s LocalASRPlugin:D SherpaASRWrapper:D *:E

# 退出shell
exit
```

---

## 🔍 步骤3：尝试初始化并查看日志

1. **打开APP**，访问 `/test-android-asr`
2. **点击"初始化 ASR"按钮**
3. **查看日志输出**

---

## 📝 步骤4：根据日志判断问题

### 正常的日志输出示例：

```
D/LocalASRPlugin: Initializing ASR with language: ja
D/LocalASRPlugin: Model path: models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09
D/LocalASRPlugin: Cache directory: /data/user/0/com.speakjapanese.app/cache
D/LocalASRPlugin: Target directory: /data/user/0/com.speakjapanese.app/cache/models/...
D/LocalASRPlugin: Files in assets: 4
D/LocalASRPlugin: Copying file: README.md
D/LocalASRPlugin: Copied: README.md (131 bytes)
D/LocalASRPlugin: Copying file: model.int8.onnx
D/LocalASRPlugin: Copied: model.int8.onnx (238000000 bytes)
D/LocalASRPlugin: Copying file: test_wavs
D/LocalASRPlugin: Copying file: tokens.txt
D/LocalASRPlugin: Copied: tokens.txt (316000 bytes)
D/LocalASRPlugin: Model copying completed successfully
D/LocalASRPlugin: Model directory: /data/user/0/com.speakjapanese.app/cache/...
D/LocalASRPlugin: Model file size: 238000000 bytes
D/LocalASRPlugin: Tokens file size: 316000 bytes
D/SherpaASRWrapper: Successfully loaded sherpa-onnx library
D/LocalASRPlugin: ASR initialized successfully
```

### 常见错误日志及解决方法：

#### 错误1：Assets目录中没有文件

```
E/LocalASRPlugin: No files found in assets: models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09
```

**原因**：模型文件未正确打包到APK中

**解决方法**：
1. 检查 `android/app/src/main/assets/models/` 目录是否存在
2. 确认模型文件完整
3. 重新编译APK

#### 错误2：JNI库加载失败

```
E/SherpaASRWrapper: Failed to load sherpa-onnx library
E/SherpaASRWrapper: java.lang.UnsatisfiedLinkError: dlopen failed: library "libsherpa-onnx.so" not found
```

**原因**：JNI库文件缺失或架构不匹配

**解决方法**：
1. 检查 `android/app/src/main/jniLibs/` 目录
2. 确认设备架构（arm64-v8a, armeabi-v7a等）
3. 确认对应架构的.so文件存在
4. 重新编译APK

#### 错误3：模型文件不存在

```
E/LocalASRPlugin: Model file does not exist: /data/user/0/.../model.int8.onnx
```

**原因**：文件复制失败或路径错误

**解决方法**：
1. 清理APP缓存并重试
2. 确认设备有足够存储空间（至少300MB）
3. 检查权限

#### 错误4：JNI初始化失败

```
E/LocalASRPlugin: Failed to initialize ASR - JNI call returned false
```

**原因**：原生库初始化失败

**解决方法**：
1. 检查模型文件完整性
2. 确认设备架构支持
3. 查看更底层的错误日志

---

## 🛠️ 步骤5：重新安装测试

### 清理并重新安装

```bash
# 1. 卸载APP
adb uninstall com.speakjapanese.app

# 2. 清理缓存（可选）
adb shell pm clear com.speakjapanese.app

# 3. 安装新APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 4. 启动日志查看
adb logcat -c
adb logcat | grep -E "LocalASR|SherpaASR"
```

---

## 📋 步骤6：收集诊断信息

请记录以下信息以便诊断：

### 设备信息
```
设备型号：
Android版本：
CPU架构：
可用存储空间：
```

### 日志输出
```
请复制完整的初始化日志（从"Initializing ASR"开始）
```

### 截图/录屏
- APP界面截图
- 错误提示截图
- 日志输出截图

---

## 💡 临时解决方案

如果初始化持续失败，可以尝试：

### 方案A：清理APP数据
1. 设置 → 应用 → 日语口语练习
2. 存储 → 清除数据
3. 重新打开APP并初始化

### 方案B：重启设备
1. 完全关闭APP
2. 重启Android设备
3. 重新打开APP并初始化

### 方案C：使用Web版本
1. 在Chrome浏览器中访问
2. 使用Web版本的语音识别功能

---

## 📞 提交问题

如果以上步骤都无法解决问题，请提交：

1. **完整的日志输出**（使用 `adb logcat -v time > log.txt` 保存）
2. **设备信息**
3. **APK版本信息**
4. **复现步骤**

到项目Issues或联系开发团队。
