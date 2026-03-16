-- 修复空昵称问题
-- 对于昵称为空的用户，自动使用邮箱@前的字符串作为昵称

-- 更新users表中nickname为NULL的记录
UPDATE users
SET nickname = SPLIT_PART(email, '@', 1)
WHERE nickname IS NULL
  OR nickname = ''
  OR TRIM(nickname) = '';

-- 添加注释
COMMENT ON COLUMN users.nickname IS '用户昵称，如果为空则使用邮箱@前的部分';
