# 用户等级系统说明

## 📊 **数据库字段说明**

**users表中的level字段**：
- **类型**：`VARCHAR(20)`
- **默认值**：`'beginner'`
- **可选值**：`'beginner'`（初级）、`'intermediate'`（中级）、`'advanced'`（高级）
- **约束**：CHECK约束确保只能是这三个值之一

## ✅ **已实现的功能**

### 1. **自动设置初始等级**
- 新用户注册时，自动设置level为`'beginner'`
- 数据库触发器`on_auth_user_created`确保注册时正确设置
- 迁移脚本`003_ensure_user_level.sql`确保现有用户的level字段不为NULL

### 2. **从用户profile获取真实等级**
**修改文件**：`src/components/practice/PracticeArea.tsx`

```typescript
// 获取用户真实等级
const userLevel = user?.user_metadata?.level || user?.level || 'beginner';

// 传递给AI评估服务
const evaluation = await evaluationService.evaluate({
  target_text: currentSentence.text_jp,
  user_transcript: transcription,
  user_level: userLevel,
});
```

### 3. **自动升级机制**
**新增服务**：`src/services/supabase/userProgress.service.ts`

#### 升级标准

| 当前等级 | 目标等级 | 练习次数 | 平均分数 | 完成课程 |
|---------|---------|---------|---------|---------|
| beginner | intermediate | ≥ 5次 | ≥ 80分 | ≥ 2个 |
| intermediate | advanced | ≥ 20次 | ≥ 85分 | ≥ 5个 |
| advanced | - | 最高等级 | - | - |

#### 自动升级流程

1. **练习完成时**：用户完成所有句子练习后，自动触发升级检查
2. **统计数据**：从`practice_records`表计算：
   - 总练习次数
   - 平均分数
   - 完成的不同课程数
3. **检查条件**：对比当前等级的升级要求
4. **执行升级**：如果满足所有条件，自动更新level字段
5. **刷新数据**：升级成功后刷新用户数据，新等级立即生效

## 🔧 **如何执行数据库迁移**

### 方法1：Supabase Dashboard（推荐）

1. 访问 https://supabase.com/dashboard
2. 选择您的项目
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New Query**
5. 复制并粘贴 `supabase/migrations/003_ensure_user_level.sql` 的内容
6. 点击 **Run** 执行

### 迁移内容

- ✅ 更新所有NULL的level为'beginner'
- ✅ 更新注册函数，确保新用户有level字段
- ✅ 重新创建触发器

## 📈 **使用示例**

### 查看用户等级进度

```typescript
import { userProgressService } from '@/services/supabase/userProgress.service';

// 获取升级进度信息
const progress = await userProgressService.getLevelProgressForDisplay(userId);

console.log(progress.current_level);      // 'beginner'
console.log(progress.next_level);         // 'intermediate'
console.log(progress.progress);           // { total_practices: 3, average_score: 82, courses_completed: 1 }
console.log(progress.requirements);       // { total_practices: 5, average_score: 80, courses_completed: 2 }
console.log(progress.can_upgrade);        // false (还未满足条件)
```

### 手动检查升级（管理员功能）

```typescript
// 检查并执行升级
const upgraded = await userProgressService.checkAndUpgrade(userId);

if (upgraded) {
  console.log('用户升级成功！');
}
```

## ⚠️ **注意事项**

1. **数据统计来源**
   - 练习记录来自`practice_records`表
   - 平均分数计算所有练习记录的`overall_score`
   - 完成课程数统计练习记录中的不同`course_id`

2. **升级时机**
   - 仅在完成所有句子练习时检查
   - 不会在单句练习后检查（避免频繁查询）
   - 升级成功后立即生效，下次练习使用新等级标准

3. **AI评估影响**
   - beginner：评估标准较宽松
   - intermediate：评估标准中等
   - advanced：评估标准严格

4. **数据库权限**
   - 用户需要通过RLS策略才能更新自己的level
   - 当前实现使用service_role权限（在服务端执行）
   - 如需客户端调用，需要配置适当的RLS策略

## 🚀 **未来改进建议**

1. **UI显示升级进度**
   - 在Dashboard显示距离下一级还差多少
   - 显示各维度的完成度（练习次数、平均分、课程数）

2. **升级通知**
   - 升级成功时显示恭喜弹窗
   - 发送升级通知邮件

3. **手动调整功能**
   - 在Settings页面添加等级选择
   - 允许管理员调整用户等级

4. **更细粒度的统计**
   - 按难度级别分别统计
   - 考虑连续学习天数等因素

5. **降级机制**
   - 如果长时间未练习，是否需要降级
   - 可配置的功能

## 📝 **相关文件**

- `supabase/migrations/001_initial_schema.sql` - users表定义
- `supabase/migrations/003_ensure_user_level.sql` - level字段迁移
- `supabase/schema.sql` - 注册触发器函数
- `src/services/supabase/userProgress.service.ts` - 升级服务
- `src/components/practice/PracticeArea.tsx` - 练习组件（使用真实等级）
- `src/services/processing/eval.service.ts` - AI评估服务（根据user_level调整标准）
