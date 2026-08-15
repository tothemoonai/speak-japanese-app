/**
 * 为 jp_users 用户设置密码（写入 bcrypt 哈希）
 *
 * 用法:
 *   node scripts/set-jp-user-password.js <email> [password]
 *
 * 如果不传 password，会生成随机密码并打印出来。
 * 需要在项目根目录的 .env.local 中配置:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const [email, passwordArg] = process.argv.slice(2);

  if (!email) {
    console.error('用法: node scripts/set-jp-user-password.js <email> [password]');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const password =
    passwordArg ||
    Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6).toUpperCase();

  const supabase = createClient(url, key);

  const { data: user, error: fetchError } = await supabase
    .from('jp_users')
    .select('id, email')
    .eq('email', email)
    .single();

  if (fetchError || !user) {
    console.error(`用户不存在: ${email}`, fetchError?.message);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { error: updateError } = await supabase
    .from('jp_users')
    .update({ password_hash: passwordHash })
    .eq('id', user.id);

  if (updateError) {
    console.error('更新失败:', updateError.message);
    process.exit(1);
  }

  console.log(`已为 ${email} 设置密码: ${password}`);
}

main();
