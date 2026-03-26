-- 数据迁移：创建测试课本并将现有课程关联到测试课本

-- 步骤1: 创建"测试课本"书本记录
INSERT INTO books (id, book_number, title_cn, title_jp, description, difficulty, total_courses, sort_order, is_published)
VALUES (
  1,
  1,
  '测试课本',
  'テスト教科書',
  '用于测试的课本，包含现有的所有课程',
  'N5',
  (SELECT COUNT(*) FROM courses),
  1,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 步骤2: 确保所有现有课程都关联到测试课本
UPDATE courses
SET book_id = 1
WHERE book_id IS NULL OR book_id NOT IN (SELECT id FROM books);

-- 步骤3: 更新书本的课程总数
UPDATE books
SET total_courses = (
  SELECT COUNT(*)
  FROM courses
  WHERE courses.book_id = books.id
);

-- 步骤4: 为测试课本创建RLS策略（允许所有认证用户读取）
ALTER TABLE books DROP POLICY IF EXISTS "Books are viewable by everyone";
CREATE POLICY "Books are viewable by everyone"
ON books
FOR SELECT
TO authenticated
USING (true);

-- 步骤5: 验证迁移结果
-- 检查books表是否有测试课本
DO $$
DECLARE
  book_count INT;
  course_count INT;
BEGIN
  SELECT COUNT(*) INTO book_count FROM books WHERE id = 1;
  SELECT COUNT(*) INTO course_count FROM courses WHERE book_id = 1;

  RAISE NOTICE '迁移完成：测试课本创建成功，% 个课程已关联', course_count;
END $$;
