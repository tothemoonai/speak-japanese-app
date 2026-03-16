# SpeakJapaneseApp 综合测试计划

## 项目概述

本测试计划旨在为 SpeakJapaneseApp 提供全面的测试覆盖，确保所有核心功能（除语音识别 API 外）均经过充分测试。

**测试目标覆盖率：**
- 单元测试覆盖率：≥ 80%
- 组件测试覆盖率：≥ 75%
- E2E 测试：覆盖所有关键用户流程

---

## 1. 测试策略

### 1.1 测试层级

```
┌─────────────────────────────────────┐
│   E2E 测试 (Playwright)             │
│   - 用户流程测试                     │
│   - 集成测试                         │
├─────────────────────────────────────┤
│   组件测试 (React Testing Library)  │
│   - UI 组件行为测试                  │
│   - 用户交互测试                     │
├─────────────────────────────────────┤
│   单元测试 (Jest + React Testing)   │
│   - Service 层测试                   │
│   - Hooks 测试                       │
│   - 工具函数测试                     │
└─────────────────────────────────────┘
```

### 1.2 测试工具

| 层级 | 工具 | 用途 |
|------|------|------|
| E2E | Playwright | 端到端用户流程测试 |
| 组件 | React Testing Library | React 组件测试 |
| 单元 | Jest | Service、Hook、工具函数测试 |
| 覆盖率 | Istanbul/c8 | 代码覆盖率统计 |

### 1.3 测试环境

- **开发环境**: http://localhost:3000
- **测试数据库**: Supabase 测试项目
- **测试用户**: 自动创建测试账号
- **浏览器**: Chrome, Firefox, Safari (E2E)

---

## 2. 单元测试计划

### 2.1 Service 层测试

#### 2.1.1 Auth Service 测试
**文件**: `src/services/supabase/auth.service.ts`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| register-success | 成功注册新用户 | 高 |
| register-email-exists | 邮箱已存在时返回错误 | 高 |
| register-invalid-email | 无效邮箱格式 | 中 |
| register-weak-password | 弱密码拒绝 | 中 |
| login-success | 正确凭据登录 | 高 |
| login-wrong-password | 错误密码返回错误 | 高 |
| login-user-not-found | 不存在的用户 | 中 |
| logout-success | 成功登出 | 高 |
| getCurrentUser-authenticated | 获取已登录用户 | 高 |
| getCurrentUser-unauthenticated | 未登录返回 null | 高 |
| updateProfile-success | 成功更新用户资料 | 中 |
| updateProfile-invalid-data | 无效数据更新 | 低 |

#### 2.1.2 Course Service 测试
**文件**: `src/services/supabase/course.service.ts`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| getAllCourses-success | 成功获取所有课程 | 高 |
| getAllCourses-withUserId | 获取带用户进度的课程 | 高 |
| getCourseById-success | 通过 ID 获取课程 | 高 |
| getCourseById-notFound | 不存在的课程返回错误 | 高 |
| getCoursesByFilter-theme | 按主题筛选课程 | 高 |
| getCoursesByFilter-level | 按难度筛选课程 | 中 |
| getCoursesByFilter-combined | 组合筛选条件 | 中 |
| getCourseCharacters-success | 获取课程角色列表 | 中 |
| getCourseSentences-success | 获取课程句子 | 高 |
| getCourseSentences-empty | 课程无句子 | 中 |

#### 2.1.3 Report Service 测试
**文件**: `src/services/supabase/report.service.ts`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| getDailyReport-success | 获取每日报告 | 高 |
| getDailyReport-noData | 无练习记录返回空报告 | 中 |
| getWeeklyReport-success | 获取每周报告 | 高 |
| getMonthlyReport-success | 获取每月报告 | 中 |
| getOverallStats-success | 获取总体统计 | 高 |
| getOverallStats-newUser | 新用户返回零值 | 中 |
| savePracticeRecord-success | 保存练习记录 | 高 |
| savePracticeRecord-duplicate | 重复记录处理 | 中 |

#### 2.1.4 Share Service 测试
**文件**: `src/services/supabase/share.service.ts`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| createShare-success | 成功创建分享记录 | 高 |
| createShare-duplicate | 重复分享返回已存在 | 中 |
| getShareByCode-success | 通过分享码获取 | 高 |
| getShareByCode-invalid | 无效分享码 | 高 |
| getShareByCode-expired | 过期分享处理 | 中 |
| incrementShareViews-success | 增加浏览次数 | 低 |
| getUserShares-success | 获取用户分享列表 | 中 |

### 2.2 Hooks 测试

#### 2.2.1 useAudioRecorder Hook 测试
**文件**: `src/hooks/useAudioRecorder.ts`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| initial-state | 初始状态正确 | 高 |
| startRecording-success | 成功开始录音 | 高 |
| startRecording-permissionDenied | 麦克风权限拒绝 | 高 |
| startRecording-noDevice | 无麦克风设备 | 高 |
| stopRecording-success | 成功停止录音 | 高 |
| pauseRecording-success | 成功暂停录音 | 中 |
| resumeRecording-success | 成功恢复录音 | 中 |
| resetRecording-clears | 重置清除录音 | 中 |
| duration-increments | 录音时长正确递增 | 中 |
| error-clearsOnRetry | 错误在重试时清除 | 低 |

#### 2.2.2 useCourse Hooks 测试
**文件**: `src/hooks/useCourse.ts`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| useCourses-fetches | 成功获取课程列表 | 高 |
| useCourses-loading | 加载状态正确 | 高 |
| useCourses-error | 错误处理正确 | 高 |
| useCourse-fetches | 成功获取单个课程 | 高 |
| useCoursesFilter-fetches | 筛选功能正常 | 高 |
| useCoursesFilter-noInfiniteLoop | 无无限循环问题 | 高 |
| useCourseCharacters-fetches | 获取角色列表 | 中 |
| useCourseSentences-fetches | 获取句子列表 | 高 |

#### 2.2.3 useTTS Hook 测试
**文件**: `src/hooks/useTTS.ts` (如存在)

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| play-success | 成功播放 TTS | 高 |
| play-error | 错误处理 | 中 |
| stop-success | 停止播放 | 中 |
| state-changes | 状态正确更新 | 高 |

#### 2.2.4 useReport Hook 测试
**文件**: `src/hooks/useReport.ts` (如存在)

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| fetchDailyReport-success | 获取每日报告 | 高 |
| fetchWeeklyReport-success | 获取每周报告 | 中 |
| fetchOverallStats-success | 获取统计 | 高 |

### 2.3 工具函数测试

#### 2.3.1 Evaluation Service 测试
**文件**: `src/services/processing/eval.service.ts`
**状态**: ✅ 已完成 (9/9 测试通过)

无需额外测试，已覆盖完整。

---

## 3. React 组件测试计划

### 3.1 核心组件

#### 3.1.1 AudioRecorder 组件
**文件**: `src/components/practice/AudioRecorder.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| renders-startButton | 渲染开始录音按钮 | 高 |
| startRecording-works | 点击开始录音 | 高 |
| stopRecording-works | 点击停止录音 | 高 |
| pauseRecording-works | 点击暂停录音 | 中 |
| duration-displays | 录音时长显示 | 中 |
| reset-works | 重置录音 | 中 |
| disabled-whenDisabled | 禁用状态生效 | 中 |
| displays-error | 显示错误信息 | 高 |
| callback-triggered | 录音完成回调触发 | 高 |

#### 3.1.2 PracticeArea 组件
**文件**: `src/components/practice/PracticeArea.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| renders-sentence | 显示当前句子 | 高 |
| shows-progress | 显示进度 | 高 |
| shows-character | 显示角色信息 | 中 |
| evaluate-button-disabled | 评估按钮初始禁用 | 高 |
| evaluate-enablesAfterRecording | 录音后启用评估 | 高 |
| evaluation-works | 评估流程完整 | 高 |
| nextButton-works | 下一句按钮 | 高 |
| error-display | 显示错误信息 | 高 |
| fallback-transcription | 转录失败时使用后备方案 | 高 |
| reset-works | 重置功能 | 中 |

#### 3.1.3 FeedbackDisplay 组件
**文件**: `src/components/practice/FeedbackDisplay.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| displays-score | 显示评分 | 高 |
| displays-feedback | 显示反馈 | 高 |
| no-result-state | 无结果状态 | 中 |
| good-score-green | 高分绿色显示 | 低 |
| poor-score-red | 低分红色显示 | 低 |

#### 3.1.4 TTSPlayer 组件
**文件**: `src/components/practice/AudioPlayer.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| renders-playButton | 渲染播放按钮 | 高 |
| play-works | 播放功能 | 高 |
| stop-works | 停止功能 | 中 |
| disabled-state | 禁用状态 | 中 |

### 3.2 UI 组件

#### 3.2.1 CourseCard 组件
**文件**: `src/components/course/CourseCard.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| displays-info | 显示课程信息 | 高 |
| click-navigates | 点击跳转 | 高 |
| displays-progress | 显示进度 | 中 |
| displays-difficulty | 显示难度 | 低 |

#### 3.2.2 CourseList 组件
**文件**: `src/components/course/CourseList.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| displays-courses | 显示课程列表 | 高 |
| empty-state | 空状态显示 | 中 |
| loading-state | 加载状态 | 中 |
| error-state | 错误状态 | 中 |
| filter-works | 筛选功能 | 高 |

#### 3.2.3 FilterBar 组件
**文件**: `src/components/course/FilterBar.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| displays-filters | 显示筛选选项 | 高 |
| select-theme | 选择主题 | 高 |
| select-level | 选择难度 | 高 |
| reset-works | 重置筛选 | 中 |
| callback-triggered | 回调触发 | 高 |

### 3.3 页面组件

#### 3.3.1 Dashboard 组件
**文件**: `src/app/dashboard/page.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| displays-welcome | 显示欢迎信息 | 高 |
| displays-courses | 显示课程 | 高 |
| displays-progress | 显示学习进度 | 高 |
| navigates-to-course | 点击跳转课程 | 高 |
| no-infinite-loop | 无无限渲染 | 高 |

#### 3.3.2 CourseDetail 组件
**文件**: `src/app/courses/[id]/page.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| displays-course-info | 显示课程详情 | 高 |
| displays-characters | 显示角色 | 高 |
| displays-sentences | 显示句子 | 高 |
| start-practice-button | 开始练习按钮 | 高 |

#### 3.3.3 Practice 组件
**文件**: `src/app/practice/[id]/page.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| loads-course-data | 加载课程数据 | 高 |
| displays-practice-area | 显示练习区域 | 高 |
| character-selector | 角色选择器 | 中 |
| navigates-back | 返回导航 | 中 |

#### 3.3.4 Report 组件
**文件**: `src/app/report/page.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| displays-daily-report | 显示每日报告 | 高 |
| displays-weekly-report | 显示每周报告 | 中 |
| displays-overall-stats | 显示总体统计 | 高 |
| tab-switching | 标签切换 | 中 |

#### 3.3.5 Login/Register 组件
**文件**: `src/app/login/page.tsx`, `src/app/register/page.tsx`

| 测试用例 | 描述 | 优先级 |
|---------|------|--------|
| login-form-validation | 表单验证 | 高 |
| login-success | 成功登录 | 高 |
| login-failure | 登录失败 | 高 |
| register-form-validation | 注册表单验证 | 高 |
| register-success | 成功注册 | 高 |
| register-email-exists | 邮箱已存在 | 高 |
| password-toggle | 密码显示切换 | 中 |

---

## 4. E2E 测试计划

### 4.1 用户认证流程

#### 4.1.1 注册流程
**文件**: `tests/e2e/auth.spec.ts`

```typescript
test.describe('用户注册', () => {
  test('成功注册新用户', async ({ page }) => {
    // 1. 访问注册页面
    // 2. 填写注册表单
    // 3. 提交注册
    // 4. 验证自动登录
    // 5. 验证跳转到 Dashboard
  });

  test('邮箱已存在时显示错误', async ({ page }) => {
    // 使用已存在邮箱注册
    // 验证错误提示
  });

  test('表单验证：无效邮箱', async ({ page }) => {
    // 输入无效邮箱格式
    // 验证前端验证
  });

  test('表单验证：弱密码', async ({ page }) => {
    // 输入弱密码
    // 验证前端验证
  });
});
```

#### 4.1.2 登录流程
**文件**: `tests/e2e/auth.spec.ts`

```typescript
test.describe('用户登录', () => {
  test('成功登录', async ({ page }) => {
    // 1. 访问登录页面
    // 2. 输入凭据
    // 3. 提交登录
    // 4. 验证跳转到 Dashboard
  });

  test('错误密码显示错误', async ({ page }) => {
    // 输入错误密码
    // 验证错误提示
  });

  test('未注册用户显示错误', async ({ page }) => {
    // 使用未注册邮箱
    // 验证错误提示
  });

  test('成功登出', async ({ page }) => {
    // 登录后点击登出
    // 验证跳转到首页
  });
});
```

### 4.2 课程浏览流程

#### 4.2.1 浏览课程列表
**文件**: `tests/e2e/courses.spec.ts`

```typescript
test.describe('浏览课程', () => {
  test('查看所有课程', async ({ page }) => {
    // 登录
    // 验证课程列表显示
    // 验证课程卡片信息
  });

  test('按主题筛选课程', async ({ page }) => {
    // 选择主题筛选
    // 验证筛选结果
  });

  test('按难度筛选课程', async ({ page }) => {
    // 选择难度筛选
    // 验证筛选结果
  });

  test('组合筛选', async ({ page }) => {
    // 同时选择主题和难度
    // 验证筛选结果
  });

  test('重置筛选', async ({ page }) => {
    // 应用筛选后重置
    // 验证显示所有课程
  });
});
```

#### 4.2.2 查看课程详情
**文件**: `tests/e2e/courses.spec.ts`

```typescript
test.describe('课程详情', () => {
  test('查看课程信息', async ({ page }) => {
    // 点击课程卡片
    // 验证课程详情显示
  });

  test('查看角色列表', async ({ page }) => {
    // 验证角色显示
  });

  test('查看对话句子', async ({ page }) => {
    // 验证句子列表显示
  });

  test('开始练习按钮', async ({ page }) => {
    // 点击开始练习
    // 验证跳转到练习页面
  });
});
```

### 4.3 练习流程

#### 4.3.1 完整练习流程
**文件**: `tests/e2e/practice.spec.ts`

```typescript
test.describe('练习流程', () => {
  test('完整练习流程', async ({ page }) => {
    // 1. 登录
    // 2. 选择课程
    // 3. 进入练习页面
    // 4. 验证句子显示
    // 5. 点击开始录音
    // 6. 模拟录音（允许麦克风权限）
    // 7. 停止录音
    // 8. 点击评估
    // 9. 验证结果显示
    // 10. 点击下一句
    // 11. 重复 3-5 次
    // 12. 完成练习
  });

  test('重新录音功能', async ({ page }) => {
    // 录音后点击重新录音
    // 验证录音被清除
  });

  test('听示范发音', async ({ page }) => {
    // 点击播放 TTS
    // 验证音频播放
  });

  test('跳过句子', async ({ page }) => {
    // 不录音直接点击下一句
    // 验证可以跳过
  });
});
```

#### 4.3.2 角色选择
**文件**: `tests/e2e/practice.spec.ts`

```typescript
test('选择不同角色练习', async ({ page }) => {
  // 进入有多角色的课程
  // 选择不同角色
  // 验证角色切换
});
```

### 4.4 报告流程

#### 4.4.1 查看学习报告
**文件**: `tests/e2e/report.spec.ts`

```typescript
test.describe('学习报告', () => {
  test('查看每日报告', async ({ page }) => {
    // 登录
    // 导航到报告页面
    // 验证每日报告显示
  });

  test('查看每周报告', async ({ page }) => {
    // 切换到每周标签
    // 验证每周报告显示
  });

  test('查看每月报告', async ({ page }) => {
    // 切换到每月标签
    // 验证每月报告显示
  });

  test('查看总体统计', async ({ page }) => {
    // 验证总体数据显示
  });
});
```

### 4.5 分享功能

#### 4.5.1 分享练习记录
**文件**: `tests/e2e/share.spec.ts`

```typescript
test.describe('分享功能', () => {
  test('创建分享链接', async ({ page }) => {
    // 完成练习后点击分享
    // 验证分享链接生成
  });

  test('访问分享链接', async ({ page }) => {
    // 使用分享码访问
    // 验证分享内容显示
  });

  test('无效分享码', async ({ page }) => {
    // 访问无效分享码
    // 验证错误提示
  });
});
```

### 4.6 完整用户旅程

#### 4.6.1 新用户首次使用
**文件**: `tests/e2e/user-journey.spec.ts`

```typescript
test('新用户完整旅程', async ({ page }) => {
    // 1. 访问首页
    // 2. 注册账号
    // 3. 被引导到 Dashboard
    // 4. 浏览可用课程
    // 5. 选择一个课程
    // 6. 查看课程详情
    // 7. 开始练习
    // 8. 完成至少 3 个句子
    // 9. 查看评估结果
    // 10. 查看学习报告
    // 11. （可选）分享成绩
    // 12. 登出
});
```

---

## 5. 实施计划

### 5.1 优先级矩阵

| 模块 | 测试类型 | 优先级 | 预计工作量 |
|------|---------|--------|-----------|
| Auth Service | 单元测试 | 高 | 2小时 |
| Course Service | 单元测试 | 高 | 3小时 |
| Report Service | 单元测试 | 高 | 2小时 |
| Share Service | 单元测试 | 中 | 2小时 |
| useAudioRecorder | 单元测试 | 高 | 3小时 |
| useCourse | 单元测试 | 高 | 2小时 |
| AudioRecorder 组件 | 组件测试 | 高 | 2小时 |
| PracticeArea 组件 | 组件测试 | 高 | 3小时 |
| FeedbackDisplay 组件 | 组件测试 | 高 | 1小时 |
| 其他 UI 组件 | 组件测试 | 中 | 4小时 |
| E2E - 认证流程 | E2E 测试 | 高 | 3小时 |
| E2E - 课程浏览 | E2E 测试 | 高 | 3小时 |
| E2E - 练习流程 | E2E 测试 | 高 | 4小时 |
| E2E - 报告查看 | E2E 测试 | 中 | 2小时 |
| E2E - 完整旅程 | E2E 测试 | 高 | 3小时 |

**总计预计时间**: 约 43 小时

### 5.2 实施顺序

#### 第一阶段：核心功能测试（优先级：高）
1. ✅ Evaluation Service 单元测试（已完成）
2. Auth Service 单元测试
3. Course Service 单元测试
4. useAudioRecorder Hook 单元测试
5. AudioRecorder 组件测试
6. PracticeArea 组件测试
7. E2E - 认证流程
8. E2E - 课程浏览

#### 第二阶段：完整流程测试（优先级：高）
1. Report Service 单元测试
2. Share Service 单元测试
3. useCourse Hooks 单元测试
4. FeedbackDisplay 组件测试
5. E2E - 练习流程
6. E2E - 完整用户旅程

#### 第三阶段：补充测试（优先级：中/低）
1. 其他 UI 组件测试
2. 其他 Hooks 测试
3. E2E - 报告查看
4. E2E - 分享功能

---

## 6. 成功标准

### 6.1 覆盖率目标

| 类型 | 目标覆盖率 | 当前覆盖率 |
|------|-----------|-----------|
| Service 层单元测试 | ≥ 85% | ~15% (仅 eval.service) |
| Hooks 单元测试 | ≥ 80% | 0% |
| 组件测试 | ≥ 75% | 0% |
| E2E 测试场景 | 100% 关键流程 | ~20% |

### 6.2 质量标准

- 所有新功能必须先有测试
- 修复 bug 时必须添加回归测试
- 代码审查时检查测试覆盖
- CI/CD 管道中自动运行测试

### 6.3 验收标准

1. **所有单元测试通过**
   - Service 层测试通过率 100%
   - Hooks 测试通过率 100%

2. **所有组件测试通过**
   - 核心组件测试通过率 100%
   - UI 组件测试通过率 ≥ 95%

3. **所有 E2E 测试通过**
   - 关键流程测试通过率 100%
   - 完整旅程测试稳定通过

4. **覆盖率达标**
   - 整体代码覆盖率 ≥ 80%
   - 关键模块覆盖率 ≥ 85%

---

## 7. 测试数据准备

### 7.1 测试用户

```typescript
const testUsers = {
  valid: {
    email: 'test@example.com',
    password: 'Test123456',
    nickname: '测试用户'
  },
  weakPassword: {
    email: 'weak@example.com',
    password: '123',
    nickname: '弱密码用户'
  },
  duplicate: {
    email: 'test@example.com', // 与 valid 相同
    password: 'Another123456',
    nickname: '重复用户'
  }
};
```

### 7.2 测试课程

需要在数据库中预置测试课程数据：
- 至少 3 个不同主题的课程
- 至少 2 个难度级别
- 每个课程至少 5 个句子
- 至少 1 个课程有多个角色

### 7.3 测试音频

准备测试音频文件用于模拟录音：
- 短音频（< 1秒）
- 正常音频（1-5秒）
- 长音频（> 5秒）

---

## 8. 已知问题与限制

### 8.1 排除的功能

**语音识别 API (GLM-ASR)**
- 原因：API 返回 400 错误，可能是 API 端问题
- 影响：评估功能使用后备方案（直接使用目标文本）
- 测试策略：测试后备方案是否正常工作

### 8.2 测试难点

1. **浏览器权限**
   - 麦克风权限需要在真实浏览器中测试
   - Playwright 可以模拟权限授予

2. **音频播放**
   - TTS 音频播放难以在测试中验证
   - 测试重点：验证播放函数被调用

3. **真实音频**
   - E2E 测试中使用真实录音
   - 可能需要设置较长的超时时间

---

## 9. 维护策略

### 9.1 测试更新

- 新功能开发时同步编写测试
- Bug 修复时添加回归测试
- 每月审查测试覆盖率

### 9.2 测试清理

- 删除过时的测试
- 合并重复的测试
- 优化慢速测试

### 9.3 文档更新

- 重大更新后更新测试计划
- 维护测试用例文档
- 记录已知问题和限制

---

## 10. 附录

### 10.1 测试命令

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行组件测试
npm run test:component

# 运行 E2E 测试
npm run test:e2e

# 生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- auth.service.test.ts

# 监听模式
npm test -- --watch
```

### 10.2 相关文档

- [Jest 文档](https://jestjs.io/)
- [React Testing Library 文档](https://testing-library.com/react)
- [Playwright 文档](https://playwright.dev/)
- [Supabase 测试指南](https://supabase.com/docs/guides/testing)

### 10.3 变更历史

| 日期 | 版本 | 变更说明 | 作者 |
|------|------|---------|------|
| 2025-01-09 | 1.0 | 初始版本，完整测试计划 | Claude |

---

**文档结束**

本测试计划将作为 SpeakJapaneseApp 测试工作的指导文档，确保所有核心功能得到充分测试，提高代码质量和用户体验。
