/**
 * 修复空昵称问题的迁移脚本
 * 使用Supabase REST API直接执行SQL更新
 */

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

async function fixNicknamesViaAPI() {
  console.log('🚀 开始修复空昵称...\n');
  console.log('📡 连接到:', supabaseUrl);

  try {
    // 方法1: 尝试直接更新users表
    console.log('\n📊 方法1: 通过REST API更新users表...\n');

    // 先查询
    console.log('🔍 查询空昵称用户...');
    const queryUrl = `${supabaseUrl}/rest/v1/users?select=id,email,nickname&or=(nickname.is.null,nickname.eq.,nickname.eq. )`;
    console.log('查询URL:', queryUrl);

    const queryResponse = await fetch(queryUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!queryResponse.ok) {
      throw new Error(`查询失败: ${queryResponse.status} ${await queryResponse.text()}`);
    }

    const users = await queryResponse.json();
    console.log(`📋 找到 ${users.length} 个空昵称用户\n`);

    if (users.length === 0) {
      console.log('✅ 没有需要修复的用户！');
      return;
    }

    // 显示用户列表
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - 当前昵称: "${user.nickname || '(空)'}"`);
    });

    console.log('\n开始更新...\n');

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const newNickname = user.email.split('@')[0];

      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ nickname: newNickname }),
      });

      if (updateResponse.ok) {
        console.log(`✅ ${user.email} -> "${newNickname}"`);
        successCount++;
      } else {
        const errorText = await updateResponse.text();
        console.error(`❌ ${user.email} - 失败: ${errorText}`);
        failCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 迁移结果:');
    console.log(`   ✅ 成功: ${successCount} 个`);
    console.log(`   ❌ 失败: ${failCount} 个`);
    console.log(`   📊 总计: ${users.length} 个`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 验证
    console.log('🔍 验证结果...');
    const verifyResponse = await fetch(queryUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (verifyResponse.ok) {
      const remainingUsers = await verifyResponse.json();
      if (remainingUsers.length === 0) {
        console.log('✅ 验证通过！所有用户现在都有昵称了！');
      } else {
        console.log(`⚠️  仍有 ${remainingUsers.length} 个用户没有昵称`);
      }
    }

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('\n💡 备选方案: 请访问Supabase Dashboard的SQL Editor，执行以下SQL:\n');
    console.log('UPDATE users');
    console.log('SET nickname = SPLIT_PART(email, \'@\', 1)');
    console.log('WHERE nickname IS NULL');
    console.log('  OR nickname = \'\'');
    console.log('  OR TRIM(nickname) = \'\';\n');
  }
}

fixNicknamesViaAPI()
  .then(() => {
    console.log('✅ 迁移脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 失败:', error);
    process.exit(1);
  });
