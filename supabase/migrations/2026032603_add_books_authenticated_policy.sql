-- 为books表添加authenticated用户的访问策略
-- 允许已登录用户查看已发布的课本

CREATE POLICY "Published books are viewable by authenticated users"
ON books
FOR SELECT
TO authenticated
USING (is_published = true);
