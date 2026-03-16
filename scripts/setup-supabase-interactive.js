/**
 * 使用浏览器自动化在 Supabase Dashboard 中设置数据库
 * 这个脚本会打开浏览器并导航到 Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SUPABASE_URL = 'https://utvbpbxhdckgzhxcgqui.supabase.co';

async function setupDatabase() {
  console.log('==========================================');
  console.log('  Supabase 数据库自动化设置');
  console.log('==========================================');
  console.log(`\n📊 项目: ${SUPABASE_URL}`);
  console.log('\n正在启动浏览器...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 导航到 Supabase Dashboard
    console.log('1️⃣  正在打开 Supabase Dashboard...');
    await page.goto('https://supabase.com/dashboard');
    console.log('   ✅ Dashboard 已打开');
    console.log('\n⚠️  请在浏览器中登录你的 Supabase 账号');
    console.log('   登录后，脚本将继续自动执行...\n');

    // 等待用户登录
    console.log('⏳ 等待登录...');
    await page.waitForURL(/dashboard/, { timeout: 0 });

    // 2. 导航到项目
    console.log('\n2️⃣  正在导航到项目...');
    await page.goto(`${SUPABASE_URL}/auth/users`);
    await page.waitForLoadState('networkidle');

    // 3. 打开 SQL Editor
    console.log('   ✅ 已进入项目');
    console.log('\n3️⃣  正在打开 SQL Editor...');

    // 点击 SQL Editor
    await page.click('[aria-label="SQL Editor"], a[href*="sql"], text=SQL Editor');
    await page.waitForLoadState('networkidle');

    console.log('   ✅ SQL Editor 已打开');

    // 读取 SQL 文件
    const schemaSQL = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8');
    const seedSQL = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'seed-data.sql'), 'utf8');

    console.log('\n4️⃣  准备执行 SQL...');
    console.log('   📄 schema.sql: ' + schemaSQL.length + ' 字符');
    console.log('   📄 seed-data.sql: ' + seedSQL.length + ' 字符');

    // 尝试找到并点击 "New Query" 按钮
    try {
      await page.click('button:has-text("New Query"), button:has-text("新建查询")', { timeout: 5000 });
      console.log('   ✅ 已创建新查询');
    } catch (err) {
      console.log('   ⚠️  可能已经打开了新查询');
    }

    // 查找 SQL 编辑器文本区域
    console.log('\n5️⃣  正在执行数据库 schema...');
    const editorSelector = '.monaco-editor textarea, .input, textarea, [contenteditable="true"]';

    try {
      // 等待编辑器加载
      await page.waitForSelector(editorSelector, { timeout: 10000 });

      // 粘贴 schema.sql
      await page.fill(editorSelector, schemaSQL);

      // 点击运行按钮
      await page.click('button:has-text("Run"), button:has-text("运行"), button[aria-label="Run"]');

      console.log('   ✅ Schema SQL 已执行');
      await page.waitForTimeout(3000);
    } catch (err) {
      console.log('   ⚠️  无法自动执行，请手动复制粘贴 SQL');
      console.log('\n📋 手动操作步骤:');
      console.log('   1. 复制 supabase/schema.sql 的内容');
      console.log('   2. 粘贴到 SQL Editor 中');
      console.log('   3. 点击 "Run" 按钮');
      console.log('   4. 重复上述步骤执行 seed-data.sql');

      await page.waitForTimeout(10000);
    }

    console.log('\n==========================================');
    console.log('  🎯 设置完成！');
    console.log('==========================================');
    console.log('\n💡 提示:');
    console.log('   - 浏览器窗口将保持打开');
    console.log('   - 你可以继续在 SQL Editor 中手动执行 SQL');
    console.log('   - 按 Ctrl+C 退出脚本并关闭浏览器\n');

    // 保持浏览器打开
    await page.waitForTimeout(300000); // 等待 5 分钟

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('\n💡 建议: 请手动在浏览器中访问以下 URL:');
    console.log(`   ${SUPABASE_URL}/sql`);
    console.log('\n然后按照 supabase/使用指南.md 的步骤操作');
  } finally {
    await browser.close();
  }
}

setupDatabase().catch(console.error);
