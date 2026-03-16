-- =====================================================
-- SpeakJapaneseApp - Supabase 数据库架构
-- 创建日期: 2025年3月7日
-- =====================================================

-- =====================================================
-- 1. 扩展用户表 (users)
-- =====================================================

-- 创建用户配置表（扩展 auth.users）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  total_study_time INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_level ON public.users(level);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. 课程表 (courses)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id SERIAL PRIMARY KEY,
  course_number INTEGER NOT NULL UNIQUE,
  title_cn TEXT NOT NULL,
  title_jp TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('N5', 'N4', 'N3')) NOT NULL,
  theme TEXT,
  scene_image_url TEXT,
  total_sentences INTEGER DEFAULT 0,
  vocab_count INTEGER DEFAULT 0,
  grammar_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON public.courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_courses_theme ON public.courses(theme);
CREATE INDEX IF NOT EXISTS idx_courses_sort_order ON public.courses(sort_order);

-- =====================================================
-- 3. 角色表 (characters)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.characters (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name_cn TEXT NOT NULL,
  name_jp TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  age_range TEXT,
  description TEXT,
  avatar_url TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_characters_course_id ON public.characters(course_id);
CREATE INDEX IF NOT EXISTS idx_characters_difficulty ON public.characters(difficulty_level);

-- =====================================================
-- 4. 句子表 (sentences)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sentences (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sentence_order INTEGER NOT NULL,
  character_id INTEGER NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  text_jp TEXT NOT NULL,
  text_cn TEXT NOT NULL,
  text_furigana TEXT,
  text_romaji TEXT,
  vocabulary JSONB DEFAULT '{}'::jsonb,
  grammar_points JSONB DEFAULT '{}'::jsonb,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  UNIQUE(course_id, sentence_order)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sentences_course_id ON public.sentences(course_id);
CREATE INDEX IF NOT EXISTS idx_sentences_character_id ON public.sentences(character_id);
CREATE INDEX IF NOT EXISTS idx_sentences_difficulty ON public.sentences(difficulty_level);

-- =====================================================
-- 5. 练习记录表 (practice_records)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.practice_records (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  character_id INTEGER NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  mode TEXT CHECK (mode IN ('standard', 'shadow', 'free')) DEFAULT 'standard',
  sentences JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_index INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_score INTEGER,
  time_spent INTEGER DEFAULT 0, -- 秒
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_practice_records_user_id ON public.practice_records(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_records_course_id ON public.practice_records(course_id);
CREATE INDEX IF NOT EXISTS idx_practice_records_completed_at ON public.practice_records(completed_at);

-- =====================================================
-- 6. 练习结果表 (practice_results)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.practice_results (
  id SERIAL PRIMARY KEY,
  practice_id INTEGER NOT NULL REFERENCES public.practice_records(id) ON DELETE CASCADE,
  sentence_id INTEGER NOT NULL REFERENCES public.sentences(id) ON DELETE CASCADE,
  user_text TEXT,
  standard_text TEXT NOT NULL,
  audio_url TEXT,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100) NOT NULL,

  -- 维度分数
  dimension_scores JSONB NOT NULL DEFAULT '{
    "accuracy": 0,
    "pronunciation": 0,
    "fluency": 0,
    "emotion": 0,
    "freedom": 0
  }'::jsonb,

  grade TEXT CHECK (grade IN ('S', 'A', 'B', 'C', 'D')) NOT NULL,

  -- 反馈
  feedback JSONB NOT NULL DEFAULT '{
    "highlights": [],
    "issues": [],
    "suggestions": []
  }'::jsonb,

  detailed_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_practice_results_practice_id ON public.practice_results(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_sentence_id ON public.practice_results(sentence_id);
CREATE INDEX IF NOT EXISTS idx_practice_results_overall_score ON public.practice_results(overall_score);

-- =====================================================
-- 7. 每日报告表 (daily_reports)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.daily_reports (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  study_time INTEGER DEFAULT 0, -- 秒
  practice_count INTEGER DEFAULT 0,
  average_score NUMERIC(5,2),
  progress_chart JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON public.daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON public.daily_reports(date);

-- 创建更新时间触发器
CREATE TRIGGER update_daily_reports_updated_at
    BEFORE UPDATE ON public.daily_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. 分享表 (shares)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.shares (
  id SERIAL PRIMARY KEY,
  share_code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  share_type TEXT CHECK (share_type IN ('practice', 'course', 'achievement')) NOT NULL,
  target_id INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_shares_share_code ON public.shares(share_code);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_share_type ON public.shares(share_type);

-- =====================================================
-- Row Level Security (RLS) 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 练习记录策略
CREATE POLICY "Users can view own practice records"
    ON public.practice_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own practice records"
    ON public.practice_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice records"
    ON public.practice_records FOR UPDATE
    USING (auth.uid() = user_id);

-- 练习结果策略
CREATE POLICY "Users can view own practice results"
    ON public.practice_results FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.practice_records WHERE id = practice_id
        )
    );

-- 每日报告策略
CREATE POLICY "Users can view own daily reports"
    ON public.daily_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily reports"
    ON public.daily_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily reports"
    ON public.daily_reports FOR UPDATE
    USING (auth.uid() = user_id);

-- 分享策略
CREATE POLICY "Anyone can view shares"
    ON public.shares FOR SELECT
    USING (true);

CREATE POLICY "Users can create own shares"
    ON public.shares FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shares"
    ON public.shares FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares"
    ON public.shares FOR DELETE
    USING (auth.uid() = user_id);

-- 公开表（courses, characters, sentences）不需要 RLS，所有人可读
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view courses"
    ON public.courses FOR SELECT
    USING (true);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view characters"
    ON public.characters FOR SELECT
    USING (true);

ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sentences"
    ON public.sentences FOR SELECT
    USING (true);

-- =====================================================
-- 创建辅助函数
-- =====================================================

-- 自动创建用户记录的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：当新用户注册时自动创建用户记录
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 完成
-- =====================================================

COMMENT ON TABLE public.users IS '用户配置表';
COMMENT ON TABLE public.courses IS '课程表';
COMMENT ON TABLE public.characters IS '角色表';
COMMENT ON TABLE public.sentences IS '句子表';
COMMENT ON TABLE public.practice_records IS '练习记录表';
COMMENT ON TABLE public.practice_results IS '练习结果详情表';
COMMENT ON TABLE public.daily_reports IS '每日学习报告表';
COMMENT ON TABLE public.shares IS '分享表';
