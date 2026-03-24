-- ============================================
-- 创建 user_achievements 表（修正版）
-- 执行时间: 2026-03-18
-- ============================================

-- 1. 创建表
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_level TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 2. 添加索引
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- 3. 启用 RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- 4. 创建策略（修正版 - 使用 DO 块）
DO $$
BEGIN
  -- 删除旧策略（如果存在）
  DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
  DROP POLICY IF EXISTS "Service can insert achievements" ON public.user_achievements;

  -- 创建新策略
  CREATE POLICY "Users can view own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Service can insert achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (true);
END $$;

-- 5. 添加注释
COMMENT ON TABLE public.user_achievements IS '用户成就表';
COMMENT ON COLUMN public.user_achievements.id IS '主键ID';
COMMENT ON COLUMN public.user_achievements.user_id IS '用户ID';
COMMENT ON COLUMN public.user_achievements.achievement_id IS '成就唯一标识';
COMMENT ON COLUMN public.user_achievements.achievement_name IS '成就名称';
COMMENT ON COLUMN public.user_achievements.achievement_description IS '成就描述';
COMMENT ON COLUMN public.user_achievements.achievement_level IS '成就级别: bronze(青铜), silver(白银), gold(黄金), platinum(铂金)';
COMMENT ON COLUMN public.user_achievements.earned_at IS '获得时间';
COMMENT ON COLUMN public.user_achievements.metadata IS '元数据（JSON格式）';

-- 6. 验证表创建成功
SELECT
    '✅ user_achievements 表创建成功！' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'user_achievements'
ORDER BY ordinal_position;
