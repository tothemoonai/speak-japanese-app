-- 为新版标准日本语中级创建课程角色关联表
-- 每门课程可以定义使用哪些角色，用户可以选择角色练习

-- 1. 创建课程角色表
CREATE TABLE IF NOT EXISTS course_characters (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  course_id INT NOT NULL,
  character_id INT NOT NULL,
  character_order INT NOT NULL,  -- 在该课程中的显示顺序
  is_primary BOOLEAN DEFAULT FALSE,  -- 是否为主要角色（默认选择）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  UNIQUE (course_id, character_id)
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_course_characters_course ON course_characters(course_id);
CREATE INDEX IF NOT EXISTS idx_course_characters_character ON course_characters(character_id);

-- 3. 为新版标准日本语中级的每门课程添加角色
-- 根据实际对话分析，一门课通常有2-4个角色

-- 注意：这里只提供示例，实际需要根据每门课的对话内容来填充
-- 下面的脚本会自动从sentences表中提取角色并填充此表
