-- 确保用户level字段正确设置
-- 1. 确保所有NULL的level都有默认值
-- 2. 更新注册函数，确保新用户有level字段

-- 更新现有的NULL记录
UPDATE users
SET level = 'beginner'
WHERE level IS NULL;

-- 删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 更新handle_new_user函数，确保设置level字段
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, level)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', SPLIT_PART(NEW.email, '@', 1)),
    'beginner'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 添加注释
COMMENT ON COLUMN users.level IS '用户等级：beginner(初级), intermediate(中级), advanced(高级)';
