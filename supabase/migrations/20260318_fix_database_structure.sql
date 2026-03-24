-- 修复数据库结构以支持 Dashboard 统计功能
-- 执行方式: 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- ============================================
-- 1. 修复 practice_records 表结构
-- ============================================

-- 检查 practice_records 表是否存在，如果不存在则创建
CREATE TABLE IF NOT EXISTS practice_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT,

  -- 评分相关字段
  overall_score INTEGER, -- 总体评分 (0-100)
  pronunciation_score INTEGER, -- 发音评分
  fluency_score INTEGER, -- 流利度评分
  vocabulary_score INTEGER, -- 词汇评分

  -- 练习详情
  transcript TEXT, -- 识别的文本
  audio_url TEXT, -- 录音文件 URL
  feedback JSONB, -- AI 反馈内容

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_practice_records_user_id ON practice_records(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_records_course_id ON practice_records(course_id);
CREATE INDEX IF NOT EXISTS idx_practice_records_created_at ON practice_records(created_at DESC);

-- 添加注释
COMMENT ON TABLE practice_records IS '用户练习记录表';
COMMENT ON COLUMN practice_records.overall_score IS '总体评分 (0-100)';
COMMENT ON COLUMN practice_records.pronunciation_score IS '发音评分 (0-100)';
COMMENT ON COLUMN practice_records.fluency_score IS '流利度评分 (0-100)';
COMMENT ON COLUMN practice_records.vocabulary_score IS '词汇评分 (0-100)';

-- ============================================
-- 2. 创建 user_achievements 表
-- ============================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL, -- 成就ID，如 'first_practice', 'perfect_score'

  -- 成就详情
  achievement_name TEXT NOT NULL, -- 成就名称
  achievement_description TEXT, -- 成就描述
  achievement_icon TEXT, -- 成就图标
  achievement_level TEXT, -- 成就级别: 'bronze', 'silver', 'gold', 'platinum'

  -- 获得时间
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 元数据
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_achievements_unique ON user_achievements(user_id, achievement_id);

-- 添加注释
COMMENT ON TABLE user_achievements IS '用户成就表';
COMMENT ON COLUMN user_achievements.achievement_id IS '成就唯一标识';
COMMENT ON COLUMN user_achievements.achievement_level IS '成就级别: bronze(青铜), silver(白银), gold(黄金), platinum(铂金)';

-- ============================================
-- 3. 启用 RLS (Row Level Security)
-- ============================================

-- practice_records 表的 RLS
ALTER TABLE practice_records ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的练习记录
CREATE POLICY IF NOT EXISTS "Users can view own practice records"
  ON practice_records FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能插入自己的练习记录
CREATE POLICY IF NOT EXISTS "Users can insert own practice records"
  ON practice_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的练习记录
CREATE POLICY IF NOT EXISTS "Users can update own practice records"
  ON practice_records FOR UPDATE
  USING (auth.uid() = user_id);

-- user_achievements 表的 RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的成就
CREATE POLICY IF NOT EXISTS "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- 系统可以插入成就（通过 trigger 或服务端）
CREATE POLICY IF NOT EXISTS "Service can insert achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 4. 创建示例成就数据（可选）
-- ============================================

-- 插入一些预定义的成就（仅供测试，可以根据需要删除）
-- 注意：这些不会自动授予用户，只是成就定义

-- ============================================
-- 5. 验证表结构
-- ============================================

-- 验证 practice_records 表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'practice_records'
ORDER BY ordinal_position;

-- 验证 user_achievements 表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_achievements'
ORDER BY ordinal_position;

-- ============================================
-- 执行完成提示
-- ============================================

-- 执行完成后，Dashboard 应该能够正常显示统计数据
-- 如果有任何错误，请检查：
-- 1. practice_records 表是否已存在数据（如果有，overall_score 将为 NULL）
-- 2. 是否需要为现有数据填充 overall_score 值
