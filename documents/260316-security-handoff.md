# 项目交接文档 - SpeakJapaneseApp（安全紧急修复版）

**日期**: 2026-03-16
**项目**: 日语学习Web应用 (SpeakJapaneseApp)
**GitHub仓库**: https://github.com/tothemoonai/speak-japanese-app
**生产环境**: https://speak-japanese-app.vercel.app
**优先级**: 🔴 **安全紧急修复**

---

## 1. 当前任务目标

### 🚨 **紧急任务：API 密钥泄露修复（最高优先级）**

GitGuardian 检测到多个 API 密钥被泄露到 GitHub 公开仓库，需要立即修复：

1. **撤销所有泄露的 API 密钥** - 在各个服务提供商的控制台撤销旧密钥
2. **清理代码仓库** - 从源代码和 Git 历史中删除所有泄露的凭据
3. **更新环境变量** - 生成新密钥并更新本地配置
4. **验证应用功能** - 确保修复后应用仍能正常运行

### 次要任务
- 用户等级自动计算系统功能验证
- 应用功能完整性测试
- 生产环境部署验证

### 预期产出
- ✅ 所有泄露的 API 密钥已从代码中清除
- ✅ Git 历史已清理并强制推送到 GitHub
- ⚠️ 用户撤销旧密钥并生成新密钥
- ⚠️ 应用功能恢复正常

### 完成标准
- GitGuardian 不再报告新的泄露
- 应用所有功能正常工作
- 生产环境稳定运行

---

## 2. 当前进展

### ✅ **已完成的紧急修复**

#### 2.1 密钥泄露扫描（2026-03-16）
**发现的泄露密钥**：
1. **Supabase Service Role JWT** - `scripts/setup-via-api.js`
   - 完整数据库管理员权限
   - 状态：✅ 已从 Git 历史和本地磁盘删除

2. **阿里云 DashScope API Key** - `src/services/asr/aliyun.service.ts`
   - 硬编码 fallback 值：`sk-ad3cb691dfb04b8b8551b895c31ed67d`
   - 状态：✅ 已移除，替换为环境变量

3. **Zhipu GLM API Key** - `.env.test`
   - 密钥：`641fa29c9b834af594641e33eb657275.bX10Fjr1kBwlK3im`
   - 状态：✅ `.env.test` 已从 Git 中移除

4. **Supabase ANON Key** - `.env.test`
   - 状态：✅ 已移除

#### 2.2 代码修复（2026-03-16）
- ✅ 删除 `scripts/setup-via-api.js`（包含 Service Role Key）
- ✅ 移除 `aliyun.service.ts` 中的硬编码 DashScope API key
- ✅ 将 `.env.test` 添加到 `.gitignore`
- ✅ 增强 `.gitignore` 规则：
  ```
  scripts/setup-via-api.js
  **/SERVICE_ROLE_KEY*
  **/service-role-key*
  .env.test
  ```

#### 2.3 Git 历史清理（2026-03-16）
- ✅ 从所有提交中移除 `scripts/setup-via-api.js`
- ✅ 从 Git 索引中移除 `.env.test`
- ✅ 多次强制推送到 GitHub，覆盖远程历史
- ✅ 当前安全版本: `b8e7e00`

#### 2.4 之前完成的功能开发（2026-03-15）
- ✅ 用户等级自动计算系统实现
- ✅ 练习页面 Application Error 修复
- ✅ TypeScript 类型系统修复
- ✅ 角色-句子映射系统
- ✅ GitHub 仓库创建和代码上传

---

## 3. 关键上下文

### 3.1 技术架构
- **前端**: Next.js 16.1.6 (App Router) + React 18 + TypeScript 5.3+
- **移动端**: Capacitor 6 + Android原生
- **后端**: Next.js API Routes + Supabase (PostgreSQL + Auth)
- **AI服务**: OpenAI GPT-4 / Anthropic Claude / Zhipu GLM-4
- **语音识别**: Aliyun DashScope ASR API (云端方案)
- **状态管理**: Zustand
- **部署**: Vercel (Web), Android APK (移动端)

### 3.2 泄露的凭据详情

#### Supabase 凭据
- **Project Ref**: `utvbpbxhdckgzhxcgqui`
- **Service Role Key** (需撤销):
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmJwYnhoZGNrZ3poeGNncXVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkzNDE3MywiZXhwIjoyMDg4NTEwMTczfQ.s6SIn6-AhvMwHOuQ6GohmLA8aJ79kSfWBzAZ6bcLfig
  ```
- **ANON Key** (建议更新):
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmJwYnhoZGNrZ3poeGNncXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzQxNzMsImV4cCI6MjA4ODUxMDE3M30.vRfzKbdVzfSoezFmE4ocHjjhHBumweX2kPr_3TMTFD8
  ```

#### 阿里云凭据
- **DashScope API Key** (需撤销): `sk-ad3cb691dfb04b8b8551b895c31ed67d`
- **用途**: Qwen 语音识别服务

#### 智谱 GLM 凭据
- **API Key** (需检查): `641fa29c9b834af594641e33eb657275.bX10Fjr1kBwlK3im`

### 3.3 用户状态
- **用户**: tothemoonai
- **邮箱**: (在 Supabase 中配置)
- **等级**: beginner (应该是 intermediate，需要手动更新)
- **练习记录**: 12次练习，85分平均，3门课程

### 3.4 重要约束
- **环境变量安全**: 所有敏感配置必须通过 `.env.local` 管理，不能提交到 Git
- **API 密钥轮换**: 每次泄露后必须立即撤销并生成新密钥
- **生产环境**: Vercel 部署需要环境变量配置
- **移动端**: Android APK 需要 Supabase URL 和 ANON Key

### 3.5 已做出的关键决定
1. **使用环境变量** - 不再硬编码任何 API 密钥
2. **增强 .gitignore** - 防止未来意外提交敏感文件
3. **定期扫描** - 建立 API 密钥泄露检测机制
4. **优先安全性** - 暂停功能开发，专注于安全问题

### 3.6 重要假设
- **密钥已泄露**: 虽然代码已清理，但旧密钥可能已被他人获取
- **Git 历史**: GitHub 仓库的历史可能已被其他人克隆
- **服务访问**: 需要检查云服务控制台的访问日志

---

## 4. 关键发现

### 4.1 安全问题根因分析
**根本原因**:
1. 开发过程中为了测试方便，硬编码了 API 密钥
2. `.env.test` 文件被错误地提交到 Git
3. `.gitignore` 不完整，没有排除 `.env.test`
4. 缺乏提交前的安全检查机制

**影响范围**:
- 4个不同的 API 密钥被泄露
- Git 历史包含敏感信息
- GitHub 公开仓库暴露了密钥

### 4.2 修复过程的技术要点
1. **Git 历史清理** - 使用 `git filter-branch` 或直接 amend 提交
2. **强制推送** - 使用 `git push --force` 覆盖远程历史
3. **文件删除** - 从 Git 索引中删除但保留本地副本
4. **环境变量管理** - 统一使用 `.env.local` 管理所有凭据

### 4.3 代码质量问题
**发现的问题**:
- 硬编码密钥作为 fallback 值
- 测试文件包含真实凭据
- 缺乏密钥管理策略

**已实施的改进**:
- 移除所有硬编码密钥
- 增强 .gitignore 规则
- 添加安全注释提醒

### 4.4 服务依赖关系
**应用依赖的第三方服务**:
1. Supabase - 数据库和认证（核心依赖）
2. Aliyun DashScope - 语音识别（核心功能）
3. OpenAI/Anthropic/Zhipu - AI 评估（可选，多提供商）

**关键依赖风险**:
- 如果 Supabase 密钥被撤销，应用将完全无法使用
- 语音识别是核心功能，DashScope 密钥必须有效

### 4.5 Git 历史分析
**当前提交历史**:
```
b8e7e00 - security: Remove hardcoded API keys and add .env.test to gitignore
7c4b04f - security: Add setup-via-api.js to gitignore to prevent future API key exposure
5321115 - Initial commit: IT日语学习应用
```

**敏感提交**:
- `6f268e9` - 包含 `scripts/setup-via-api.js` (已被覆盖)
- 早期提交包含 `.env.test` (已被清除)

---

## 5. 未完成事项

### 🔴 **最高优先级（必须立即完成）**

#### 1. 撤销所有泄露的 API 密钥
**状态**: ⚠️ 用户需要手动操作

**操作步骤**:
1. **Supabase Service Role Key** (最紧急)
   - 访问: https://supabase.com/dashboard/project/utvbpbxhdckgzhxcgqui/settings/api
   - 撤销: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...s6SIn6-AhvMwHOuQ6GohmLA8aJ79kSfWBzAZ6bcLfig`
   - 生成新密钥

2. **阿里云 DashScope API Key**
   - 访问阿里云控制台
   - 撤销: `sk-ad3cb691dfb04b8b8551b895c31ed67d`
   - 生成新密钥

3. **智谱 GLM API Key**
   - 确认 `641fa29c9b834af594641e33eb657275.bX10Fjr1kBwlK3im` 是否为真实密钥
   - 如果是，撤销并生成新密钥

4. **Supabase ANON Key** (建议)
   - 在 Supabase Dashboard 重新生成
   - 更新环境变量

#### 2. 更新本地环境变量
**文件**: `.env.local`

**需要更新的变量**:
```bash
# 复制新的 credentials 从各个服务控制台
NEXT_PUBLIC_SUPABASE_URL=https://utvbpbxhdckgzhxcgqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<新的ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<新的SERVICE_ROLE_KEY>
DASHSCOPE_API_KEY=<新的DashScope_KEY>
ZHIPU_API_KEY=<新的智谱_KEY（如果使用）>
```

#### 3. 验证应用功能
**测试清单**:
- [ ] 启动开发服务器: `npm run dev`
- [ ] 测试用户登录功能
- [ ] 测试语音识别功能（依赖 DashScope）
- [ ] 测试 AI 评估功能
- [ ] 检查浏览器控制台无错误

### 🟡 **中优先级（本周完成）**

#### 4. 更新用户等级
**问题**: 用户 tothemoonai 的等级不正确（12次练习，85分，3课程 = 应该是 intermediate）

**SQL 修复**:
```sql
-- 更新用户等级
UPDATE users
SET level = 'intermediate'
WHERE nickname ILIKE '%tothemoonai%';

-- 同时更新 auth metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{level}',
  '"intermediate"'
)
WHERE id = (SELECT id FROM users WHERE nickname ILIKE '%tothemoonai%');
```

#### 5. 生产环境验证
**操作**:
- 访问 https://speak-japanese-app.vercel.app
- 测试所有核心功能
- 检查 Vercel 环境变量配置

#### 6. 监控异常活动
**检查项目**:
- Supabase Dashboard 的访问日志
- 阿里云控制台的 API 调用记录
- 是否有未知的 API 请求

### 🟢 **低优先级（后续优化）**

#### 7. 安全加固
- 设置 Git hooks 防止未来提交敏感文件
- 配置 CI/CD 中的密钥扫描
- 启用云服务的访问告警

#### 8. 代码清理
- 删除 `.gitignore` 中列出的临时脚本文件
- 清理测试日志和临时文件

---

## 6. 建议接手路径

### 🚨 **立即行动（接下来 30 分钟）**

#### 第1步：确认用户已撤销密钥（5分钟）
```bash
# 询问用户是否已经撤销了所有泄露的 API 密钥
# 如果没有，指导他们先完成这一步
```

**关键问题**:
1. 你是否已经在 Supabase Dashboard 撤销了 Service Role Key?
2. 你是否已经撤销了阿里云 DashScope API Key?
3. 你是否已经生成了新的密钥?

#### 第2步：更新本地环境变量（10分钟）
```bash
# 1. 备份当前环境变量
cp .env.local .env.local.backup

# 2. 编辑 .env.local，替换为新密钥
# nano .env.local 或使用其他编辑器

# 3. 验证格式正确
cat .env.local | grep "^NEXT_PUBLIC_SUPABASE_URL"
cat .env.local | grep "^DASHSCOPE_API_KEY"
```

#### 第3步：验证本地应用（15分钟）
```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问应用
# 打开浏览器到 http://localhost:3000

# 3. 测试核心功能
# - 用户登录/注册
# - 课程浏览
# - 语音练习（需要测试 DashScope ASR）
# - AI 评估

# 4. 检查浏览器控制台
# 确保没有 API 错误
```

### 🔍 **验证步骤（30-60 分钟）**

#### 第4步：Git 仓库安全检查（10分钟）
```bash
# 1. 确认敏感文件已从 Git 中移除
git ls-files | grep ".env.test"  # 应该没有输出
git ls-files | grep "setup-via-api.js"  # 应该没有输出

# 2. 确认 .gitignore 包含正确的规则
grep "\.env" .gitignore
grep "setup-via-api" .gitignore

# 3. 检查当前提交历史
git log --oneline | head -5
```

#### 第5步：代码安全扫描（10分钟）
```bash
# 1. 搜索是否有其他硬编码密钥
grep -r "sk-" src/ --include="*.ts" --include="*.tsx" | grep -v "process.env" | grep -v "test-key"

# 2. 检查环境变量引用
grep -r "process.env" src/ --include="*.ts" --include="*.tsx" | grep -i "key\|secret"

# 3. 验证没有新的敏感文件
find . -name "*.key" -o -name "*.secret" -o -name "*credentials*" | grep -v node_modules
```

#### 第6步：生产环境验证（20分钟）
```bash
# 1. 检查 Vercel 环境变量
# 登录 Vercel Dashboard
# 项目: https://vercel.com/tothemoonai/speak-japanese-app
# 设置 → Environment Variables

# 2. 访问生产环境
# https://speak-japanese-app.vercel.app

# 3. 测试所有功能
# - 用户登录
# - 课程选择
# - 语音练习
# - AI 评估
```

### 📋 **后续任务（按需处理）**

#### 第7步：用户等级修复（如果需要）
```bash
# 在 Supabase SQL Editor 中执行更新等级的 SQL
# 或者使用客户端工具连接数据库执行
```

#### 第8步：文档更新（如果需要）
```bash
# 更新项目文档，记录安全事件和修复过程
# 可以创建 documents/260316-security-incident.md
```

---

## 7. 风险与注意事项

### ⚠️ **高风险区域**

#### 1. 用户可能尚未撤销密钥
**风险**: 如果用户还没有撤销旧密钥，代码修复是无效的
**检查**: 直接询问用户是否已经完成密钥撤销操作
**建议**: 优先确保密钥已撤销，再进行其他操作

#### 2. 新密钥可能配置错误
**风险**: 环境变量格式错误或密钥复制不完整
**检查**: 仔细检查 .env.local 文件格式
**建议**: 使用测试脚本验证密钥有效性

#### 3. 生产环境可能未更新
**风险**: Vercel 部署的环境变量可能还是旧密钥
**检查**: 登录 Vercel Dashboard 确认
**建议**: 在测试环境验证后再更新生产环境

### ⚠️ **中风险区域**

#### 4. 应用功能可能受影响
**风险**: 密钥更新后某些功能可能无法正常工作
**检查**: 全面测试所有依赖 API 的功能
**建议**: 逐个功能测试，记录问题并修复

#### 5. Git 历史可能已被克隆
**风险**: 在修复之前，其他人可能已经克隆了包含密钥的仓库
**检查**: 无法直接检测，需要监控异常访问
**建议**: 撤销密钥是最重要的防护措施

#### 6. 其他环境可能使用旧密钥
**风险**: 如果有多个部署环境（开发、测试、生产），可能遗漏更新
**检查**: 确认所有环境都已更新
**建议**: 列出所有环境并逐一检查

### ✅ **已验证的方案（可继续）**

#### 1. Git 历史清理方法 ✅
- 使用 `git commit --amend` 删除敏感文件
- 使用 `git push --force` 覆盖远程历史
- 验证方法：`git log --oneline` 和 `git ls-files`

#### 2. 环境变量管理 ✅
- 使用 `.env.local` 管理本地开发配置
- 使用 `.env.example` 提供配置模板
- 验证方法：检查 .gitignore 规则

#### 3. 多提供商 AI 服务 ✅
- 支持多个 AI 提供商（OpenAI、Anthropic、Zhipu）
- 评估服务可以自动回退
- 验证方法：查看 `src/services/processing/eval.service.ts`

### 🚫 **不推荐的方向**

#### 1. 不要跳过密钥撤销
**原因**: 即使代码已清理，旧密钥仍可被他人使用
**正确做法**: 优先撤销密钥，然后再做其他操作

#### 2. 不要忽略测试
**原因**: 密钥更新后可能导致功能异常
**正确做法**: 全面测试所有 API 调用功能

#### 3. 不要提交新的敏感信息
**原因**: 容易在紧急修复中再次泄露
**正确做法**: 提交前仔细检查 `git diff`

### 📝 **常见错误和解决方案**

#### 错误1: "API 密钥无效"
**原因**: 新密钥未正确配置或复制不完整
**解决**: 重新复制密钥，确保没有多余空格或换行

#### 错误2: "Supabase 连接失败"
**原因**: SUPABASE_URL 或密钥配置错误
**解决**: 验证 URL 格式和密钥有效性

#### 错误3: "语音识别不工作"
**原因**: DashScope API Key 无效
**解决**: 检查 DASHSCOPE_API_KEY 配置，验证密钥权限

#### 错误4: "Git 推送失败"
**原因**: 强制推送可能被保护规则阻止
**解决**: 临时移除分支保护或使用不同的推送方法

---

## 8. 下一位 Agent 的第一步建议

### 🎯 **立即执行的 5 个步骤**

#### **步骤1：确认密钥撤销状态（2分钟）**
```bash
# 直接询问用户以下问题：
echo "请确认你是否已经完成以下操作：
1. 在 Supabase Dashboard 撤销了 Service Role Key?
2. 在阿里云控制台撤销了 DashScope API Key?
3. 生成了新的 API 密钥?

如果还没有，请先完成这些操作，我们再继续。"
```

#### **步骤2：检查当前状态（3分钟）**
```bash
# 检查 Git 状态
git status
git log --oneline | head -3

# 检查敏感文件是否已移除
ls -la scripts/setup-via-api.js 2>&1 | grep "No such file"
git ls-files | grep ".env.test"  # 应该没有输出

# 检查 .gitignore
grep "\.env" .gitignore
```

#### **步骤3：验证环境变量（5分钟）**
```bash
# 检查 .env.local 文件
cat .env.local

# 验证必要的变量是否存在
echo "检查环境变量:"
grep "NEXT_PUBLIC_SUPABASE_URL" .env.local
grep "DASHSCOPE_API_KEY" .env.local
grep "SUPABASE_SERVICE_ROLE_KEY" .env.local

# 如果缺少任何变量，提示用户添加
```

#### **步骤4：测试本地应用（10分钟）**
```bash
# 启动开发服务器
npm run dev

# 在浏览器中测试
# http://localhost:3000

# 测试关键功能：
# 1. 用户登录
# 2. 课程浏览
# 3. 语音练习（测试 DashScope ASR）
# 4. AI 评估

# 检查浏览器控制台是否有错误
```

#### **步骤5：验证生产环境（5分钟）**
```bash
# 访问生产环境
# https://speak-japanese-app.vercel.app

# 测试相同的功能
# 如果发现问题，检查 Vercel 环境变量配置
```

### 🔍 **需要关注的关键文件**

#### **安全相关**:
- `.gitignore` - 确认敏感文件被排除
- `.env.local` - 包含所有新的 API 密钥
- `src/services/asr/aliyun.service.ts` - 应该无硬编码密钥
- `documents/260316-security-scan-report.md` - 完整的安全扫描报告

#### **功能相关**:
- `src/services/processing/eval.service.ts` - AI 评估服务
- `src/components/practice/PracticeArea.tsx` - 练习区域组件
- `src/services/supabase/auth.service.ts` - 认证服务
- `src/services/supabase/userProgress.service.ts` - 用户进度服务

#### **配置相关**:
- `next.config.js` - Next.js 配置
- `capacitor.config.ts` - Capacitor 配置
- `vercel.json` - Vercel 部署配置

### ⚠️ **关键提醒**

1. **不要假设用户已完成密钥撤销** - 直接确认！
2. **不要跳过功能测试** - 密钥更新后必须验证！
3. **不要提交新的敏感信息** - 每次提交前检查 `git diff`！
4. **优先考虑安全性** - 功能可以等，安全不能等！
5. **记录所有操作** - 便于后续审计和问题排查

---

## 附录：快速参考

### 常用命令（安全相关）
```bash
# 检查 Git 中的敏感文件
git ls-files | grep -E "\.env|key|secret"

# 搜索代码中的硬编码密钥
grep -r "sk-" src/ --include="*.ts" --include="*.tsx" | grep -v "process.env"

# 验证 .gitignore 规则
git check-ignore -v .env.local .env.test

# 查看 Git 历史
git log --oneline --all | head -10

# 强制推送（谨慎使用）
git push origin --force --all
```

### 重要链接
- **Supabase Dashboard**: https://supabase.com/dashboard/project/utvbpbxhdckgzhxcgqui
- **Supabase API 设置**: https://supabase.com/dashboard/project/utvbpbxhdckgzhxcgqui/settings/api
- **Vercel Dashboard**: https://vercel.com/tothemoonai/speak-japanese-app
- **GitHub 仓库**: https://github.com/tothemoonai/speak-japanese-app
- **生产环境**: https://speak-japanese-app.vercel.app

### 环境变量模板
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://utvbpbxhdckgzhxcgqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<从 Supabase Dashboard 复制>
SUPABASE_SERVICE_ROLE_KEY=<从 Supabase Dashboard 复制>

# Aliyun DashScope
DASHSCOPE_API_KEY=<从阿里云控制台复制>

# AI Services (至少配置一个)
OPENAI_API_KEY=<可选>
ANTHROPIC_API_KEY=<可选>
ZHIPU_API_KEY=<可选>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 测试清单
- [ ] 用户登录/注册功能
- [ ] 课程浏览和选择
- [ ] 语音录制
- [ ] 语音识别（DashScope ASR）
- [ ] AI 评估
- [ ] 用户等级计算
- [ ] 角色选择和句子显示
- [ ] 生产环境访问
- [ ] 浏览器控制台无错误

---

**交接完成** - 下一位 Agent 现在可以接手这个紧急安全修复任务了！🚨

**重要提醒**: 这是一个安全紧急事件，请优先处理密钥撤销和应用验证，其他功能开发可以暂时搁置。