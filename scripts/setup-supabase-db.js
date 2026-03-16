/**
 * Supabase 数据库设置脚本
 * 直接连接到 Supabase PostgreSQL 数据库并执行 SQL 文件
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 从环境变量或命令行参数获取配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://utvbpbxhdckgzhxcgqui.supabase.co';
const DB_PASSWORD = process.env.DB_PASSWORD || process.argv[2]; // 从命令行参数获取

// 从 Supabase URL 中提取项目引用
function extractProjectRef(supabaseUrl) {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

const PROJECT_REF = extractProjectRef(SUPABASE_URL);
const DB_HOST = `db.${PROJECT_REF}.supabase.co`;
const DB_NAME = 'postgres';
const DB_USER = 'postgres';
const DB_PORT = 5432;

// 构建连接字符串
const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

async function executeSQLFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`\n📄 执行文件: ${path.basename(filePath)}`);

  try {
    // 将 SQL 按分号分割成多个语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.length < 10) continue; // 跳过太短的语句

      try {
        await client.query(statement);
        successCount++;
      } catch (err) {
        // 某些语句可能因为已存在而失败，这是可以接受的
        const errorMsg = err.message.toLowerCase();
        if (errorMsg.includes('already exists') ||
            errorMsg.includes('duplicate') ||
            errorMsg.includes('relation')) {
          console.log(`  ⚠️  跳过（已存在）: ${statement.substring(0, 50)}...`);
        } else {
          console.error(`  ❌ 错误: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`  ✅ 成功: ${successCount} 条语句${errorCount > 0 ? `, ⚠️  错误: ${errorCount} 条` : ''}`);
    return { successCount, errorCount };
  } catch (error) {
    console.error(`  ❌ 执行失败: ${error.message}`);
    throw error;
  }
}

async function verifyDatabase(client) {
  console.log('\n🔍 验证数据库设置...');

  const checks = [
    {
      name: '课程数量',
      query: 'SELECT COUNT(*)::int as count FROM courses;',
      expected: 8
    },
    {
      name: '角色数量',
      query: 'SELECT COUNT(*)::int as count FROM characters;',
      expected: 16
    },
    {
      name: '句子数量',
      query: 'SELECT COUNT(*)::int as count FROM sentences;',
      expected: 30
    }
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const result = await client.query(check.query);
      const count = result.rows[0].count;
      const passed = count >= check.expected;
      const status = passed ? '✅' : '⚠️';
      const msg = passed ? '通过' : `预期 ${check.expected}+, 实际 ${count}`;

      console.log(`  ${status} ${check.name}: ${msg}`);

      if (!passed) allPassed = false;
    } catch (error) {
      console.log(`  ❌ ${check.name}: 查询失败 - ${error.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

async function main() {
  console.log('==========================================');
  console.log('  SpeakJapaneseApp - Supabase 数据库设置');
  console.log('==========================================');
  console.log(`\n📊 项目信息:`);
  console.log(`  项目引用: ${PROJECT_REF}`);
  console.log(`  数据库主机: ${DB_HOST}`);
  console.log(`  数据库: ${DB_NAME}`);

  if (!DB_PASSWORD) {
    console.error('\n❌ 错误: 未提供数据库密码');
    console.error('\n使用方法:');
    console.error('  方法 1 (环境变量):');
    console.error('    export DB_PASSWORD="your-database-password"');
    console.error('    node scripts/setup-supabase-db.js');
    console.error('\n  方法 2 (命令行参数):');
    console.error('    node scripts/setup-supabase-db.js your-database-password');
    console.error('\n获取数据库密码:');
    console.error('  1. 访问 https://supabase.com/dashboard');
    console.error('  2. 选择你的项目');
    console.error('  3. 进入 Project Settings → Database');
    console.error('  4. 复制 "Database Password"');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Supabase 需要 SSL
    }
  });

  try {
    console.log('\n🔗 连接到数据库...');
    await client.connect();
    console.log('✅ 连接成功');

    // 执行 schema.sql
    console.log('\n==========================================');
    console.log('  第 1 步: 创建数据库表结构');
    console.log('==========================================');
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    await executeSQLFile(client, schemaPath);

    // 等待一下让表完全创建
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 执行 seed-data.sql
    console.log('\n==========================================');
    console.log('  第 2 步: 导入测试数据');
    console.log('==========================================');
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed-data.sql');
    await executeSQLFile(client, seedPath);

    // 验证数据
    console.log('\n==========================================');
    console.log('  第 3 步: 验证数据');
    console.log('==========================================');
    const verificationPassed = await verifyDatabase(client);

    console.log('\n==========================================');
    console.log('  ✅ 数据库设置完成！');
    console.log('==========================================');

    if (verificationPassed) {
      console.log('\n📋 下一步:');
      console.log('  1. 启动开发服务器: npm run dev');
      console.log('  2. 访问应用: http://localhost:3000');
      console.log('  3. 注册新用户测试功能');
    } else {
      console.log('\n⚠️  警告: 部分验证未通过，请检查数据库设置');
    }

  } catch (error) {
    console.error('\n❌ 设置失败:', error.message);
    console.error('\n请检查:');
    console.error('  1. 数据库密码是否正确');
    console.error('  2. 网络连接是否正常');
    console.error('  3. Supabase 项目是否正常运行');
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 数据库连接已关闭');
  }
}

// 支持命令行参数
if (process.argv.length > 2) {
  process.env.DB_PASSWORD = process.argv[2];
}

main();
