const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取 .env.local 文件
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// 解析环境变量
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('🔑 使用 ANON key 连接 Supabase...');
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUserLevel() {
  try {
    console.log('🔍 查询用户 tothemoonai 的等级信息...\n');

    // 尝试查询用户
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%tothemoonai%,nickname.ilike.%tothemoonai%`);

    if (userError) {
      console.error('❌ 查询用户失败:', userError.message);
      console.error('   错误详情:', JSON.stringify(userError, null, 2));
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ 未找到用户 tothemoonai');
      return;
    }

    const user = users[0];
    console.log('👤 用户信息:');
    console.log('   Email:', user.email);
    console.log('   昵称:', user.nickname || '未设置');
    console.log('   当前等级:', user.level);

    // 查询练习记录
    const { data: practices, error: practiceError } = await supabase
      .from('practice_records')
      .select('overall_score, course_id')
      .eq('user_id', user.id)
      .not('overall_score', 'is', null);

    if (practiceError) {
      console.error('❌ 查询练习记录失败:', practiceError.message);
      return;
    }

    const totalPractices = practices?.length || 0;
    const averageScore = totalPractices > 0
      ? Math.round(practices.reduce((sum, p) => sum + (p.overall_score || 0), 0) / totalPractices)
      : 0;
    const coursesCount = new Set(practices?.map(p => p.course_id) || []).size;

    console.log('\n📊 学习统计:');
    console.log('   总练习次数:', totalPractices);
    console.log('   平均分数:', averageScore);
    console.log('   练习课程数:', coursesCount);

    // 计算应有等级
    let shouldLevel = 'beginner';
    if (totalPractices >= 20 && averageScore >= 85 && coursesCount >= 5) {
      shouldLevel = 'advanced';
    } else if (totalPractices >= 5 && averageScore >= 80 && coursesCount >= 2) {
      shouldLevel = 'intermediate';
    }

    console.log('\n✅ 等级判定:');
    console.log('   当前等级:', user.level);
    console.log('   应有等级:', shouldLevel);
    console.log('   等级正确:', user.level === shouldLevel ? '✅ 是' : '⚠️ 否');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

checkUserLevel();
