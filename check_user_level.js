const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUserLevel() {
  try {
    // 1. 查找用户
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%tothemoonai%,nickname.ilike.%tothemoonai%`);
    
    if (userError) throw userError;
    
    if (!users || users.length === 0) {
      console.log('❌ 未找到用户 tothemoonai');
      return;
    }
    
    const user = users[0];
    console.log('\n👤 用户信息:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   昵称:', user.nickname);
    console.log('   当前等级:', user.level);
    
    // 2. 查询练习记录
    const { data: practices, error: practiceError } = await supabase
      .from('practice_records')
      .select('overall_score, course_id, created_at')
      .eq('user_id', user.id)
      .not('overall_score', 'is', null);
    
    if (practiceError) throw practiceError;
    
    const totalPractices = practices?.length || 0;
    const averageScore = totalPractices > 0 
      ? Math.round(practices.reduce((sum, p) => sum + (p.overall_score || 0), 0) / totalPractices)
      : 0;
    
    // 获取不同课程数
    const uniqueCourses = new Set(practices?.map(p => p.course_id) || []);
    const coursesCount = uniqueCourses.size;
    
    console.log('\n📊 学习统计:');
    console.log('   总练习次数:', totalPractices);
    console.log('   平均分:', averageScore);
    console.log('   练习课程数:', coursesCount);
    
    // 3. 根据标准计算应该的等级
    console.log('\n🎯 升级标准:');
    console.log('   初级→中级: 5次练习 + 平均分80 + 2门课程');
    console.log('   中级→高级: 20次练习 + 平均分85 + 5门课程');
    
    let shouldLevel = 'beginner';
    if (totalPractices >= 20 && averageScore >= 85 && coursesCount >= 5) {
      shouldLevel = 'advanced';
    } else if (totalPractices >= 5 && averageScore >= 80 && coursesCount >= 2) {
      shouldLevel = 'intermediate';
    }
    
    console.log('\n✅ 等级判定:');
    console.log('   当前等级:', user.level === 'beginner' ? '初级' : user.level === 'intermediate' ? '中级' : '高级');
    console.log('   应有等级:', shouldLevel === 'beginner' ? '初级' : shouldLevel === 'intermediate' ? '中级' : '高级');
    
    if (user.level === shouldLevel) {
      console.log('\n✅ 用户等级正确！');
    } else {
      console.log('\n⚠️ 用户等级不匹配，需要更新');
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

checkUserLevel();
