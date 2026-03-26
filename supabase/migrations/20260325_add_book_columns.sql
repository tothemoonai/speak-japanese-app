-- 为sentences和characters表添加book_id列
-- 优化数据结构，使course_id表示课程编号而不是数据库主键

-- =====================================================
-- 步骤1：添加book_id列到sentences表
-- =====================================================

ALTER TABLE sentences
ADD COLUMN book_id INT NOT NULL DEFAULT 1;

-- 添加外键约束
ALTER TABLE sentences
ADD CONSTRAINT fk_sentences_book
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

-- 添加索引
CREATE INDEX idx_sentences_book_course ON sentences(book_id, course_id);

-- =====================================================
-- 步骤2：更新sentences表，设置正确的book_id
-- =====================================================

-- 先根据courses表更新sentences的book_id
UPDATE sentences s
SET book_id = (
  SELECT c.book_id
  FROM courses c
  WHERE c.id = s.course_id
);

-- 验证更新
SELECT book_id, COUNT(*) as sentence_count
FROM sentences
GROUP BY book_id;

-- =====================================================
-- 步骤3：修改course_id的含义（从主键改为课程编号）
-- =====================================================

-- 注意：这需要重新导入数据，因为course_id现在是课程编号（1-32）
-- 而不是courses表的主键

-- =====================================================
-- 步骤4：添加book_id列到characters表
-- =====================================================

ALTER TABLE characters
ADD COLUMN book_id INT NOT NULL DEFAULT 1;

-- 添加外键约束
ALTER TABLE characters
ADD CONSTRAINT fk_characters_book
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

-- 添加索引
CREATE INDEX idx_characters_book ON characters(book_id);

-- =====================================================
-- 步骤5：为第二本书创建角色（从speaker_jp提取）
-- =====================================================

-- 先查看第二本书有哪些唯一角色
-- 这些需要从JSON文件的speaker_jp字段提取

-- 示例：为第二本书创建角色
-- 注意：实际角色名称需要从JSON文件中提取
INSERT INTO characters (book_id, name_cn, name_jp, avatar_url, description, created_at)
VALUES
  (2, '李', '李', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '王', '王', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '佐藤', '佐藤', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '大山', '大山', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '山田', '山田', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '中井', '中井', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '吉田', '吉田', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '后藤', '後藤', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '野田', '野田', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '金子', '金子', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '金本', '金本', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '青木', '青木', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '高桥', '高橋', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '黑田', '黒田', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '榎本', '榎本', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '店员', '店員', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '导游', 'ガイド', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '广播员', 'アナウンサー', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '男', '男性', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '女将', '女将', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '同事', '同僚', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '职员', '社員', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '机场职员', '空港職員', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '行李员', '手荷物係', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '负责人', '担当者', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '主持人', '司会', NULL, '新版标准日本语中级的角色', NOW()),
  (2, '町子', '町子', NULL, '新版标准日本语中级的角色', NOW())
ON CONFLICT (book_id, name_jp) DO NOTHING;

-- 注意：上面的ON CONFLICT假设我们添加了(book_id, name_jp)的唯一约束
-- 如果没有这个约束，需要先创建

-- =====================================================
-- 步骤6：创建角色名称映射表
-- =====================================================

-- 创建临时映射表，用于将speaker_jp映射到character_id
CREATE TEMP TABLE character_name_map AS
SELECT id, name_jp
FROM characters
WHERE book_id = 2;

-- 查看映射结果
SELECT * FROM character_name_map ORDER BY name_jp;

-- =====================================================
-- 步骤7：更新sentences的character_id
-- =====================================================

-- 注意：这需要重新导入数据时使用speaker_jp字段匹配character_id
-- 或者创建一个更新脚本，基于speaker_jp更新character_id

-- 示例更新语句（需要根据实际speaker_jp值调整）：
-- UPDATE sentences s
-- SET character_id = (
--   SELECT id FROM characters WHERE book_id = 2 AND name_jp = s.speaker_jp
-- )
-- WHERE book_id = 2;

-- =====================================================
-- 步骤8：添加唯一约束（可选）
-- =====================================================

-- 为characters添加(book_id, name_jp)唯一约束
ALTER TABLE characters
ADD CONSTRAINT characters_book_name_unique
UNIQUE (book_id, name_jp);

-- =====================================================
-- 验证
-- =====================================================

-- 查看每个book的句子数
SELECT book_id, COUNT(*) as count
FROM sentences
GROUP BY book_id
ORDER BY book_id;

-- 查看每个book的角色数
SELECT book_id, COUNT(*) as count
FROM characters
GROUP BY book_id
ORDER BY book_id;
