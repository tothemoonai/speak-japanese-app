-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  total_study_time INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended'))
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY,
  course_number INT UNIQUE NOT NULL,
  title_cn VARCHAR(100) NOT NULL,
  title_jp VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('N5', 'N4', 'N3')),
  theme VARCHAR(50),
  scene_image_url VARCHAR(255),
  total_sentences INT,
  vocab_count INT,
  grammar_count INT,
  sort_order INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 对话角色表
CREATE TABLE IF NOT EXISTS characters (
  id INT PRIMARY KEY,
  course_id INT NOT NULL,
  name_cn VARCHAR(50) NOT NULL,
  name_jp VARCHAR(50) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  age_range VARCHAR(20),
  description TEXT,
  avatar_url VARCHAR(255),
  difficulty_level VARCHAR(10) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 对话句子表
CREATE TABLE IF NOT EXISTS sentences (
  id BIGINT PRIMARY KEY,
  course_id INT NOT NULL,
  sentence_order INT NOT NULL,
  character_id INT NOT NULL,
  text_jp TEXT NOT NULL,
  text_cn TEXT NOT NULL,
  text_furigana TEXT,
  text_romaji TEXT,
  vocabulary JSONB,
  grammar_points JSONB,
  difficulty_level VARCHAR(10) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id)
);

CREATE INDEX idx_sentences_course_order ON sentences(course_id, sentence_order);

-- 练习记录表
CREATE TABLE IF NOT EXISTS practice_records (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id INT NOT NULL,
  character_id INT NOT NULL,
  practice_mode VARCHAR(20) NOT NULL CHECK (practice_mode IN ('standard', 'shadow', 'free')),
  overall_score INT,
  completion_rate DECIMAL(5,2),
  time_spent INT,
  sentences_completed INT,
  sentences_total INT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX idx_practice_records_user_time ON practice_records(user_id, started_at);
CREATE INDEX idx_practice_records_course ON practice_records(course_id);

-- 句子练习详情表
CREATE TABLE IF NOT EXISTS sentence_practices (
  id BIGINT PRIMARY KEY,
  record_id BIGINT NOT NULL,
  sentence_id BIGINT NOT NULL,
  user_id UUID NOT NULL,
  user_text TEXT,
  standard_text TEXT NOT NULL,
  audio_url VARCHAR(255),
  overall_score INT,
  accuracy_score INT,
  pronunciation_score INT,
  fluency_score INT,
  emotion_score INT,
  freedom_score INT,
  grade VARCHAR(1) CHECK (grade IN ('S', 'A', 'B', 'C', 'D')),
  feedback JSONB,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (record_id) REFERENCES practice_records(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sentence_id) REFERENCES sentences(id)
);

CREATE INDEX idx_sentence_practices_user_sentence ON sentence_practices(user_id, sentence_id);

-- 词汇表
CREATE TABLE IF NOT EXISTS vocabulary (
  id INT PRIMARY KEY,
  word_jp VARCHAR(100) NOT NULL,
  word_cn VARCHAR(100) NOT NULL,
  reading VARCHAR(100),
  part_of_speech VARCHAR(50),
  level VARCHAR(10) CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  example_sentence_jp TEXT,
  example_sentence_cn TEXT
);

-- 课程词汇关联表
CREATE TABLE IF NOT EXISTS course_vocabulary (
  id BIGINT PRIMARY KEY,
  course_id INT NOT NULL,
  vocab_id INT NOT NULL,
  is_key BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (vocab_id) REFERENCES vocabulary(id),
  UNIQUE (course_id, vocab_id)
);

-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  category VARCHAR(20) CHECK (category IN ('progress', 'streak', 'score', 'special')),
  requirement JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id INT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id),
  UNIQUE (user_id, achievement_id)
);

-- 分享记录表
CREATE TABLE IF NOT EXISTS shares (
  id BIGINT PRIMARY KEY,
  share_code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('practice', 'course', 'achievement')),
  target_id BIGINT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255),
  click_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_shares_code ON shares(share_code);
CREATE INDEX idx_shares_user ON shares(user_id);

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentence_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- RLS策略将在后续文件中添加
