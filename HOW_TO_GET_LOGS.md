# 如何获取 Android 调试日志

## 步骤 1：确保模拟器/设备已连接
```bash
# 检查设备列表
adb devices
```
应该看到类似输出：
```
List of devices attached
emulator-5554   device
```

## 步骤 2：清除旧日志（可选但推荐）
```bash
adb logcat -c
```

## 步骤 3：在模拟器中操作
1. 启动你的应用
2. 导航到 `/test-android-asr` 页面
3. 点击"初始化 ASR"按钮
4. 等待错误出现

## 步骤 4：获取日志

### 方法 A：保存到文件（推荐）
```bash
adb logcat -d > android_log.txt
```
日志会保存在当前目录的 `android_log.txt` 文件中

### 方法 B：只获取相关日志
```bash
adb logcat -d | findstr "LocalASRPlugin SherpaASRWrapper AndroidRuntime"
```

### 方法 C：实时查看日志
```bash
adb logcat | findstr "LocalASRPlugin SherpaASRWrapper"
```

## 步骤 5：发送日志
将生成的 `android_log.txt` 内容发送给 Claude 进行分析。

## 常见问题

### Q: 提示 "adb 不是内部或外部命令"
A: 需要使用完整路径，例如：
```bash
"C:\Users\你的用户名\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat -d
```

### Q: 没有看到任何日志
A: 确保应用已经启动，并且已经执行了初始化操作

### Q: 日志太多
A: 使用过滤命令只查看相关的日志：
```bash
adb logcat -d | findstr "LocalASR"
```
