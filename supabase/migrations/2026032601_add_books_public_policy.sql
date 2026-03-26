-- 添加books表的公开访问策略
-- 允许未认证用户也可以查看已发布的课本

-- 为公开用户添加策略（只允许查看已发布的课本）
CREATE POLICY "Published books are viewable by anon"
ON books
FOR SELECT
TO anon
USING (is_published = true);
