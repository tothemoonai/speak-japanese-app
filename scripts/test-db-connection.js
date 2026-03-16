/**
 * 测试 Supabase 数据库连接
 */

const { Client } = require('pg');

const SUPABASE_URL = 'https://utvbpbxhdckgzhxcgqui.supabase.co';
const DB_PASSWORD = 'dKNh7xERR6Mtpkxx';
const PROJECT_REF = 'utvbpbxhdckgzhxcgqui';

// 可能的连接配置
const configs = [
  {
    name: '标准配置',
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: '不带 SSL',
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: null
  },
  {
    name: '使用 AWS 区域格式',
    host: `${PROJECT_REF}.db.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  }
];

async function testConnection(config) {
  console.log(`\n🔍 测试配置: ${config.name}`);
  console.log(`   主机: ${config.host}`);
  console.log(`   端口: ${config.port}`);

  const client = new Client(config);

  try {
    await client.connect();
    console.log('   ✅ 连接成功！');

    // 测试查询
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('   📊 数据库信息:');
    console.log(`      数据库: ${result.rows[0].current_database}`);
    console.log(`      用户: ${result.rows[0].current_user}`);
    console.log(`      版本: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);

    await client.end();
    return true;
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  console.log('==========================================');
  console.log('  Supabase 数据库连接测试');
  console.log('==========================================');
  console.log(`\n项目: ${SUPABASE_URL}`);
  console.log(`密码: ${DB_PASSWORD ? '已提供 (长度: ' + DB_PASSWORD.length + ')' : '未提供'}\n`);

  for (const config of configs) {
    const success = await testConnection(config);
    if (success) {
      console.log('\n==========================================');
      console.log('  ✅ 找到可用的连接配置！');
      console.log('==========================================');
      console.log('\n✅ 成功配置:');
      console.log(`   host: ${config.host}`);
      console.log(`   port: ${config.port}`);
      console.log(`   database: ${config.database}`);
      console.log(`   user: ${config.user}`);
      console.log(`   ssl: ${config.ssl ? 'enabled' : 'disabled'}`);
      process.exit(0);
    }
  }

  console.log('\n==========================================');
  console.log('  ❌ 所有连接配置都失败了');
  console.log('==========================================');
  console.log('\n可能的原因:');
  console.log('1. 数据库密码不正确');
  console.log('2. 项目引用 (utvbpbxhdckgzhxcgqui) 不正确');
  console.log('3. 数据库暂停或不可用');
  console.log('4. 网络连接问题\n');

  console.log('请检查:');
  console.log('- 在 Supabase Dashboard 中确认项目状态');
  console.log('- 在 Project Settings → Database 中确认密码');
  console.log('- 尝试在 Supabase SQL Editor 中执行测试查询\n');

  process.exit(1);
}

main().catch(console.error);
