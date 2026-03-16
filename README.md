# 日语口语练习Web应用

基于新概念日本语的智能对话练习平台，利用AI技术帮助用户提升日语口语能力。

## ✨ 功能特性

- 🎯 **AI智能评估**：多维度口语评估（准确性、发音、流利度、情感）
- 💬 **情景对话练习**：基于新概念日本语的真实场景对话
- 🎤 **实时语音识别**：浏览器原生Web Speech API
- 🔊 **标准发音播放**：TTS文本转语音技术
- 📊 **学习进度追踪**：详细的练习记录和学习报告
- 🏆 **成就系统**：游戏化学习激励机制
- 📤 **社交分享**：分享学习成果到社交媒体

## 🛠️ 技术栈

### 前端
- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript 5.3+
- **样式**：Tailwind CSS 3.4+
- **UI组件**：shadcn/ui (Radix UI)
- **状态管理**：Zustand 4.5+
- **表单处理**：React Hook Form + Zod

### 后端
- **API**：Next.js API Routes
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Auth
- **存储**：Supabase Storage

### AI服务
- **语音识别**：Web Speech API / Sherpa-ONNX (Android 本地)
- **语音合成**：Web Speech API / Google Cloud TTS
- **智能评估**：OpenAI GPT-4 / Anthropic Claude / 智谱GLM-4

### 移动端 (Android)
- **框架**：Capacitor 6
- **本地语音识别**：Sherpa-ONNX (离线多语言支持)
- **测试页面**：`/test-android-asr`

## 📦 项目结构

```
src/
├── app/                # Next.js页面
├── components/         # React组件
│   ├── ui/            # shadcn/ui基础组件
│   ├── course/        # 课程相关组件
│   └── practice/      # 练习相关组件
├── lib/               # 工具库
│   ├── supabase/      # Supabase配置
│   └── utils/         # 工具函数
├── services/          # 业务服务
│   ├── supabase/      # 数据库服务
│   └── processing/    # 音频和AI服务
├── store/             # 状态管理
├── hooks/             # 自定义Hooks
└── types/             # TypeScript类型
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.17.0
- npm / yarn / pnpm

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd SpeakJapaneseApp
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

在 [Supabase](https://supabase.com) 创建项目后，填写环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **配置数据库**

在Supabase的SQL Editor中运行 `supabase/migrations/001_initial_schema.sql`

5. **运行开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

## 📚 完整文档

所有详细文档已移至 `documents/` 文件夹，方便查阅和管理：

### 📖 项目设计与配置
- **[软件功能设计书](documents/软件功能设计书.md)** - 详细的功能需求和规格说明
- **[技术设计文档](documents/技术设计文档.md)** - 系统架构和技术实现细节
- **[项目配置指南](documents/项目配置指南.md)** - 开发环境配置步骤

### 🔧 API 配置
- **[智谱GLM配置指南](documents/智谱GLM配置指南.md)** - 智谱GLM-4模型配置说明
- （可选）OpenAI/Anthropic API 配置

### 📊 开发与测试
- **[开发进度](documents/开发进度.md)** - 项目开发进度和待办事项
- **[测试计划](documents/TEST_PLAN.md)** - 完整的测试策略和计划
- **[测试文档](documents/测试文档.md)** - 测试用例和测试方法
- **[测试指南](documents/测试指南.md)** - 如何运行测试

### 📈 测试报告
- **[测试执行摘要](documents/测试执行摘要.md)** - 测试执行概要和结果
- **[最终测试报告](documents/最终测试报告.md)** - 完整测试报告
- **[测试报告](documents/测试报告.md)** - 详细测试数据
- **[数据库设置完成后的完整测试报告](documents/数据库设置完成后的完整测试报告.md)** - 集成测试报告

## 🗄️ 数据库Schema

项目使用以下主要数据表：

- `users` - 用户表
- `courses` - 课程表
- `characters` - 对话角色表
- `sentences` - 对话句子表
- `practice_records` - 练习记录表
- `sentence_practices` - 句子练习详情表
- `vocabulary` - 词汇表
- `achievements` - 成就表
- `shares` - 分享记录表

## 🎨 UI组件

项目使用 [shadcn/ui](https://ui.shadcn.com) 组件库，基于Radix UI和Tailwind CSS。

### 添加新组件

```bash
npx shadcn-ui@latest add [component-name]
```

## 🧪 测试

```bash
# 运行测试
npm test

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 格式化代码
npm run format

# 运行测试并生成覆盖率报告
npm test -- --coverage
```

## 📝 开发规范

### Git提交规范

使用语义化提交信息：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```bash
git commit -m "feat: 添加课程列表页面"
git commit -m "fix: 修复登录时的错误提示"
```

### 代码规范

- 使用TypeScript严格模式
- 组件使用函数式和Hooks
- 导出顺序：类型 → 常量 → 工具函数 → 组件
- 文件命名：PascalCase用于组件，camelCase用于工具函数

## 🔐 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_APP_URL` | 应用URL | 否 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase项目URL | 是 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名密钥 | 是 |
| `OPENAI_API_KEY` | OpenAI API密钥 | 否* |
| `ANTHROPIC_API_KEY` | Anthropic API密钥 | 否* |
| `ZHIPU_API_KEY` | 智谱GLM API密钥 | 否* |

*至少需要配置一个LLM API密钥才能使用AI评估功能（推荐国内用户使用智谱GLM）

## 🚢 部署

### Vercel（推荐）

1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署

### 其他平台

项目支持部署到任何支持Next.js的平台：
- Netlify
- Cloudflare Pages
- AWS Amplify
- 自托管

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题，请提交Issue或联系维护者。

---

**注意**：本项目目前处于开发阶段，功能可能不完整或存在bug。
