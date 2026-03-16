/**
 * 检查数据库中用户level字段的状态
 */

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkUserLevels() {
  console.log('🔍 检查用户level字段状态...\n');
  console.log('📡 连接到:', supabaseUrl);

  try {
    // 查询所有用户的level
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=id,email,level,created_at&order=created_at.desc&limit=10`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`查询失败: ${response.status} ${await response.text()}`);
    }

    const users = await response.json();

    console.log(`\n📊 找到 ${users.length} 个用户:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Level: "${user.level || '(NULL)'}"`);
      console.log(`   创建时间: ${user.created_at}\n`);
    });

    // 统计level分布
    const levelCounts = users.reduce((acc, user) => {
      const level = user.level || '(NULL)';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Level 分布统计:');
    Object.entries(levelCounts).forEach(([level, count]) => {
      console.log(`   ${level}: ${count} 个用户`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

checkUserLevels();
