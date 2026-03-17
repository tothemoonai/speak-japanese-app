# Supabase 密钥迁移指南

**日期**: 2026-03-17
**目的**: 从旧的密钥系统迁移到新的 Publishable key 和 secret key

---

## 🔄 **密钥系统变化**

### **旧的密钥系统**
- **ANON Key**: 旧的匿名访问密钥（JWT 格式）
- **Service Role Key**: 旧的服务器密钥（JWT 格式，以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` 开头）

### **新的密钥系统**
- **Publishable Key**: `sb_publishable_...` 格式，低权限，前端使用
- **Secret Key**: `sb_secret_...` 格式，高权限，后端使用

---

## ✅ **代码兼容性**

**好消息**: 代码无需修改！

现有的环境变量名称仍然有效：
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → 现在放置 Publishable key
- `SUPABASE_SERVICE_ROLE_KEY` → 现在放置 Secret key

---

## 🔧 **迁移步骤**

### **步骤1：获取新的密钥**

1. 访问 Supabase Dashboard: https://supabase.com/dashboard/project/utvbpbxhdckgzhxcgqui/settings/api
2. 找到 **"Project API keys"** 部分
3. 复制新的密钥：
   - **Publishable key**: `sb_publishable_...` (以前叫 anon key)
   - **Secret key**: `sb_secret_...` (以前叫 service_role key)

### **步骤2：更新本地环境变量**

编辑 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://utvbpbxhdckgzhxcgqui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_YOUR_NEW_PUBLISHABLE_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=sb_secret_YOUR_NEW_SECRET_KEY_HERE
```

**重要**:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 现在放置 **Publishable key** (`sb_publishable_...`)
- `SUPABASE_SERVICE_ROLE_KEY` 现在放置 **Secret key** (`sb_secret_...`)

### **步骤3：验证配置**

```bash
# 启动开发服务器
npm run dev

# 测试应用功能
# - 用户注册/登录
# - 数据库查询
# - API 路由功能
```

### **步骤4：更新 Vercel 环境变量**

1. 访问 Vercel Dashboard: https://vercel.com/tothemoonai/speak-japanese-app
2. 进入 **Settings** → **Environment Variables**
3. 更新以下变量：
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 新的 Publishable key
   - `SUPABASE_SERVICE_ROLE_KEY` = 新的 Secret key
4. 重新部署应用

---

## 🔐 **密钥使用场景**

### **前端使用（Publishable Key）**
- ✅ 用户认证（登录/注册）
- ✅ 客户端数据库查询
- ✅ 实时订阅
- ⚠️ 受 RLS（Row Level Security）保护

**使用的环境变量**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **后端使用（Secret Key）**
- ✅ API 路由中的管理员操作
- ✅ 绕过 RLS 的数据库操作
- ✅ 用户等级管理
- ✅ 批量数据操作

**使用的环境变量**: `SUPABASE_SERVICE_ROLE_KEY`

---

## 📋 **环境变量对照表**

| 用途 | 旧密钥格式 | 新密钥格式 | 环境变量名称 |
|------|-----------|-----------|-------------|
| **前端** | ANON Key (JWT) | Publishable Key (`sb_publishable_...`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **后端** | Service Role Key (JWT) | Secret Key (`sb_secret_...`) | `SUPABASE_SERVICE_ROLE_KEY` |

---

## 🛡️ **安全注意事项**

### **Publishable Key 安全**
- ✅ 可以安全地暴露在前端代码中
- ✅ 可以提交到 GitHub（因为已经暴露在 Supabase Dashboard）
- ⚠️ 但仍然应该通过环境变量管理

### **Secret Key 安全**
- ❌ 绝对不能暴露在前端代码中
- ❌ 不能提交到 GitHub
- ✅ 只能在后端 API 路由中使用
- ✅ Vercel 环境变量中设置

---

## 🚀 **部署检查清单**

### **本地开发**
- [ ] 更新 `.env.local` 文件
- [ ] 重启开发服务器 (`npm run dev`)
- [ ] 测试用户注册/登录功能
- [ ] 测试数据库查询功能
- [ ] 测试 API 路由功能

### **Vercel 部署**
- [ ] 登录 Vercel Dashboard
- [ ] 更新 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 更新 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 触发新的部署
- [ ] 验证生产环境功能

### **验证步骤**
1. 访问 https://speak-japanese-app.vercel.app
2. 测试用户登录功能
3. 测试课程练习功能
4. 测试语音识别功能
5. 检查浏览器控制台无错误

---

## 🔄 **回滚计划**

如果新密钥有问题，可以：
1. 在 Supabase Dashboard 重新生成密钥
2. 更新环境变量
3. 重新部署应用

---

## 📞 **支持资源**

- **Supabase 密钥文档**: https://supabase.com/docs/guides/platform/api-keys
- **项目 Dashboard**: https://supabase.com/dashboard/project/utvbpbxhdckgzhxcgqui/settings/api
- **Vercel Dashboard**: https://vercel.com/tothemoonai/speak-japanese-app/settings/environment-variables

---

**迁移完成时间**: 约 10 分钟
**风险等级**: 低（代码无需修改）
**回滚难度**: 容易