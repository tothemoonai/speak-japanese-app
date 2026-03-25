-- 更新书本表的RLS策略
-- 允许所有用户（包括未登录）查看已发布的书本

-- 删除旧策略
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;

-- 创建新策略：允许所有人查看已发布的书本
CREATE POLICY "Published books are viewable by everyone"
ON books
FOR SELECT
TO public
USING (is_published = true);

-- 验证策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'books';
