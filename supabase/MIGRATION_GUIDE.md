# 数据库迁移指南 - 修复空昵称问题

## 问题描述
部分已注册用户的nickname字段为空，需要使用邮箱@前的字符串自动补足。

## 解决方案

### 1. 数据库迁移脚本
已创建迁移脚本：`supabase/migrations/002_fix_empty_nicknames.sql`

该脚本会：
- 更新所有nickname为NULL、空字符串或纯空格的记录
- 使用`SPLIT_PART(email, '@', 1)`函数提取邮箱@前的部分作为昵称

### 2. 应用层自动补足
已更新`src/services/supabase/auth.service.ts`：

- ✅ **注册时**：如果用户未填写nickname，自动使用email@前的部分
- ✅ **登录时**：确保返回的用户对象始终有有效的nickname
- ✅ **获取当前用户时**：自动补足nickname

## 如何运行迁移

### 方法1：通过Supabase Dashboard（推荐）

1. 访问您的Supabase项目Dashboard
2. 点击左侧菜单的 **SQL Editor**
3. 点击 **New Query**
4. 复制`supabase/migrations/002_fix_empty_nicknames.sql`的内容
5. 粘贴到编辑器中
6. 点击 **Run** 执行迁移

### 方法2：通过Supabase CLI

```bash
# 进入项目目录
cd C:\ClaudeCodeProject\SpeakJapaneseApp

# 推送迁移到远程数据库
npx supabase db push

# 或者使用以下命令应用特定的迁移
npx supabase migration up
```

### 方法3：直接在数据库中执行

如果您有数据库访问权限，可以直接连接到数据库并执行SQL：

```sql
UPDATE users
SET nickname = SPLIT_PART(email, '@', 1)
WHERE nickname IS NULL
  OR nickname = ''
  OR TRIM(nickname) = '';
```

## 验证迁移结果

执行以下SQL检查是否还有空昵称：

```sql
SELECT COUNT(*) as empty_nickname_count
FROM users
WHERE nickname IS NULL
   OR nickname = ''
   OR TRIM(nickname) = '';
```

结果应该返回 **0**。

## 注意事项

1. **备份数据**：在生产环境执行迁移前，建议先备份数据库
2. **测试环境**：先在测试环境验证迁移脚本
3. **已有用户**：此迁移会更新所有已有用户的nickname字段
4. **新用户**：应用层已确保新用户注册时不会出现空昵称

## 相关文件

- `supabase/migrations/002_fix_empty_nicknames.sql` - 迁移脚本
- `src/services/supabase/auth.service.ts` - 认证服务（已添加ensureNickname方法）
- `src/app/register/page.tsx` - 注册页面（nickname为可选字段）

## 技术细节

### 数据库函数
使用PostgreSQL内置函数：
- `SPLIT_PART(string, delimiter, part_number)` - 分割字符串并返回指定部分
- `TRIM(string)` - 去除首尾空格

### 应用层处理
```typescript
private ensureNickname(user: any): any {
  if (!user) return user;

  const email = user.email || '';
  const nickname = user.user_metadata?.nickname ||
                   user.nickname ||
                   email.split('@')[0];

  return {
    ...user,
    nickname,
    user_metadata: {
      ...user.user_metadata,
      nickname,
    },
  };
}
```

此方法确保无论从哪里获取用户数据，都能保证nickname字段有值。
