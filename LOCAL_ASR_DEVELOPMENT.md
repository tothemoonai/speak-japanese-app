# 本地语音识别模块开发进度

## 项目概述

开发基于 Sherpa-ONNX 的本地语音识别模块，使用 SenseVoiceSmall INT8 模型，支持离线日语、中文、英文等多语言语音识别。

## 技术栈

- **ASR 框架**: Sherpa-ONNX (Next-gen Kaldi)
- **识别模型**: SenseVoiceSmall INT8
  - 模型名称: `sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09`
- **支持语言**: 中文、英文、日语、韩语、粤语
- **运行环境**: WebAssembly (浏览器)
- **项目框架**: Next.js 14+ with App Router

## 开发计划

### ✅ 1. 研究阶段 (已完成)

**研究内容**:
- [x] Sherpa-ONNX 架构和能力
- [x] SenseVoiceSmall INT8 模型特性
- [x] 集成方案选型 (WASM vs Custom Build)
- [x] 现有 ASR 系统架构分析

**关键发现**:
- Sherpa-ONNX 支持 WebAssembly，可直接在浏览器中运行
- SenseVoice INT8 模型体积小、性能优，适合移动设备
- 现有系统使用云 ASR (Aliyun/Volcengine)，需要添加本地 ASR 选项
- `useASR` hook 已支持 provider 切换，可扩展支持 `local` provider

**参考文档**:
- Sherpa-ONNX GitHub: https://github.com/k2-fsa/sherpa-onnx
- SenseVoice 模型: https://github.com/k2-fsa/sherpa-onnx/releases/tag/sense-models
- WASM 示例: https://github.com/k2-fsa/sherpa-onnx/tree/master/webassembly

---

### ✅ 2. 模型准备 (已完成)

**任务列表**:
- [x] 创建模型下载脚本
- [x] 配置模型存储路径 (`public/models/sense-voice/`)
- [ ] 下载 SenseVoiceSmall INT8 模型文件（用户需手动运行下载脚本）

**所需文件**:
```
public/models/sense-voice/
└── sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09/
    ├── model.onnx          # ONNX 模型文件
    ├── tokens.txt          # 分词器
    └── (config files)
```

**下载脚本**: `scripts/download-sense-voice-model.js`

---

### ✅ 3. 核心服务实现 (已完成)

**任务列表**:
- [x] 创建 Sherpa-ONNX WASM 加载器
- [x] 实现本地 ASR 服务类
- [x] 创建 React Hook (useLocalASR)
- [x] 更新测试页面

**文件结构**:
```
src/
├── services/
│   └── asr/
│       └── sherpa.service.ts       # ✅ Sherpa-ONNX 服务封装
├── hooks/
│   └── useLocalASR.ts              # ✅ 本地 ASR Hook
└── app/
    └── test-local-asr/
        └── page.tsx                # ✅ 测试页面
```

**已实现功能**:
- `SherpaASRService`: 核心服务类，支持模型初始化和音频识别
- `useLocalASR`: React Hook，提供状态管理和识别方法
- `useJapaneseLocalASR`: 日语识别便捷 Hook
- `useChineseLocalASR`: 中文识别便捷 Hook
- `useEnglishLocalASR`: 英文识别便捷 Hook

---

### ⏳ 4. 集成到现有系统 (进行中)

**任务列表**:
- [ ] 扩展 `useASR` hook 支持 `provider: 'local'`
- [ ] 更新配置页面，允许用户选择 ASR 提供商
- [ ] 实现离线/在线模式切换
- [ ] 优化移动端性能

---

### ⏳ 5. 测试与优化 (待开始)

**任务列表**:
- [ ] 单元测试 (音频处理、模型加载)
- [ ] 集成测试 (完整识别流程)
- [ ] 性能测试 (准确率、速度、内存占用)
- [ ] 浏览器兼容性测试
- [ ] 移动端测试

---

## 技术实现方案

### 方案选择: WebAssembly (浏览器端)

**优点**:
- ✅ 完全离线运行
- ✅ 数据隐私保护
- ✅ 无服务器成本
- ✅ 低延迟

**缺点**:
- ⚠️ 首次加载模型需要时间
- ⚠️ 模型文件较大 (约 50-100MB)
- ⚠️ 移动设备性能受限

### 架构设计

```
┌─────────────────┐
│   用户录制音频   │ (Microphone)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useLocalASR Hook│ 录音、状态管理
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AudioContext    │ 音频处理 (Float32Array)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SherpaASRService│ 本地识别引擎 (WASM)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ASRResult     │ 识别结果
└─────────────────┘
```

---

## 当前状态

**阶段**: 核心功能完成，待集成到现有系统

**已完成**:
- ✅ 技术方案确定
- ✅ 模型选型完成
- ✅ 现有代码分析完成
- ✅ 创建开发进度文档
- ✅ 创建模型下载脚本
- ✅ 实现 SherpaASRService 服务类
- ✅ 实现 useLocalASR Hook
- ✅ 更新测试页面

**进行中**:
- 🔄 集成到现有 ASR 系统

**下一步**:
- ⏭️ 下载模型文件 (运行下载脚本)
- ⏭️ 扩展 useASR hook 支持 local provider
- ⏭️ 测试本地识别功能

---

## 使用说明

### 1. 下载模型文件

首先需要下载 SenseVoice 模型文件：

```bash
node scripts/download-sense-voice-model.js
```

模型文件将下载到 `public/models/sense-voice/` 目录。

### 2. 使用本地 ASR Hook

```tsx
import { useJapaneseLocalASR } from '@/hooks/useLocalASR';

function MyComponent() {
  const { state, initialize, recognize, reset } = useJapaneseLocalASR({
    autoInitialize: true,
  });

  return (
    <div>
      <button onClick={initialize}>加载模型</button>
      <button onClick={() => recognize(audioData)}>识别</button>
      <p>结果: {state.result?.text}</p>
    </div>
  );
}
```

### 3. 测试页面

访问 `/test-local-asr` 页面测试本地语音识别功能。

---

## 开发日志

### 2025-03-11
- ✅ 完成 Sherpa-ONNX 技术调研
- ✅ 确认 SenseVoice 模型支持中日英韩粤多语言
- ✅ 分析现有 ASR 系统架构
- ✅ 创建开发进度文档
- ✅ 安装 sherpa-onnx npm 包
- ✅ 创建模型下载脚本 (`scripts/download-sense-voice-model.js`)
- ✅ 实现 SherpaASRService 服务类 (`src/services/asr/sherpa.service.ts`)
- ✅ 实现 useLocalASR Hook (`src/hooks/useLocalASR.ts`)
- ✅ 更新测试页面 (`src/app/test-local-asr/page.tsx`)

---

## 参考资料

- [Sherpa-ONNX GitHub](https://github.com/k2-fsa/sherpa-onnx)
- [Sherpa-ONNX WebAssembly 文档](https://k2-fsa.github.io/sherpa/onnx/wasm/index.html)
- [Sherpa-ONNX WASM 示例](https://github.com/k2-fsa/sherpa-onnx/tree/master/webassembly/asr)
- [SenseVoice 模型下载](https://github.com/k2-fsa/sherpa-onnx/releases/tag/sense-models)
- [Sherpa-ONNX NPM 包](https://www.npmjs.com/package/sherpa-onnx)
- [HuggingFace - Sherpa-ONNX WASM Demo](https://huggingface.co/spaces/k2-fsa/web-assembly-asr-sherpa-onnx-zh-en)

---

## 已知问题

1. **模型文件较大**: 首次加载需要下载约 50-100MB 的模型文件
2. **WASM 兼容性**: 需要浏览器支持 WebAssembly 和 SharedArrayBuffer
3. **移动端性能**: 在低端移动设备上可能性能较慢

## 未来改进

- [ ] 添加模型预加载功能
- [ ] 实现流式识别 (OnlineRecognizer)
- [ ] 优化模型加载速度
- [ ] 添加本地缓存支持
- [ ] 支持更多语言和模型
