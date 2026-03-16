/**
 * 自动化 Supabase 数据库设置
 * 使用 Playwright 自动打开 Supabase Dashboard 并执行 SQL
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function autoSetupSupabase() {
  console.log('==========================================');
  console.log('  自动化 Supabase 数据库设置');
  console.log('==========================================\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 步骤 1: 导航到 Supabase Dashboard
    console.log('1️⃣  正在打开 Supabase Dashboard...');
    await page.goto('https://supabase.com/dashboard/project/utvbpbxhdckgzhxcgqui/sql/new');
    console.log('   ✅ 已打开 Dashboard\n');

    // 等待用户登录
    console.log('⚠️  请在浏览器中登录你的 Supabase 账号（如果未登录）');
    console.log('⏳ 登录后，脚本将自动继续...\n');

    // 等待 SQL Editor 加载
    await page.waitForLoadState('networkidle');

    // 检查是否需要登录
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      console.log('⏳ 等待登录完成...');
      await page.waitForURL(/sql/, { timeout: 0 });
    }

    console.log('✅ 已登录并进入 SQL Editor\n');

    // 读取 SQL 文件
    const schemaSQL = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8');
    console.log(`📄 schema.sql: ${schemaSQL.length} 字符`);

    // 步骤 2: 找到 SQL 编辑器并输入 schema
    console.log('\n2️⃣  准备执行 SQL...');

    // 等待编辑器加载
    await page.waitForTimeout(3000);

    // 尝试找到编辑器的 textarea
    const editorSelector = '.monaco-editor textarea, .input, textarea, [contenteditable="true"]';

    try {
      await page.waitForSelector(editorSelector, { timeout: 10000 });
      console.log('   ✅ 找到 SQL 编辑器');

      // 由于可能有多个 textarea，我们需要找到正确的那个
      const textareas = await page.$$(editorSelector);
      console.log(`   找到 ${textareas.length} 个文本区域`);

      // 输入 schema.sql
      // 先尝试点击编辑器区域
      await page.click('.monaco-editor, .sql-editor, [class*="editor"]');
      await page.waitForTimeout(500);

      // 尝试通过键盘快捷键全选并粘贴
      // 方法 1: 使用 fill
      try {
        const mainEditor = await page.$('.monaco-editor textarea');
        if (mainEditor) {
          await mainEditor.click();
          await page.keyboard.press('Control+A');
          await page.waitForTimeout(200);
          await page.keyboard.type(schemaSQL);
          console.log('   ✅ 已输入 schema.sql');
        }
      } catch (err) {
        console.log('   ⚠️  无法自动输入，请手动粘贴');
      }

      // 步骤 3: 点击运行按钮
      console.log('\n3️⃣  准备执行 schema.sql...');

      await page.waitForTimeout(2000);

      // 尝试找到并点击运行按钮
      const runButtonSelectors = [
        'button:has-text("Run")',
        'button:has-text("运行")',
        '[aria-label="Run"]',
        'button[type="submit"]',
        '.run-button'
      ];

      let clicked = false;
      for (const selector of runButtonSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            console.log('   ✅ 已点击运行按钮');
            clicked = true;
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (!clicked) {
        console.log('   ⚠️  无法自动点击运行按钮，请手动点击');
      }

      // 等待执行完成
      await page.waitForTimeout(5000);

    } catch (error) {
      console.log('   ⚠️  自动化遇到问题:', error.message);
    }

    console.log('\n==========================================');
    console.log('  请在浏览器中完成以下操作');
    console.log('==========================================\n');

    console.log('📝 步骤 1: 如果 SQL 还没有自动执行，请手动点击 "Run" 按钮\n');

    console.log('📝 步骤 2: schema.sql 执行成功后，点击 "New Query" 创建新查询\n');

    console.log('📝 步骤 3: 复制以下文件的内容并粘贴到 SQL Editor:\n');
    console.log('   - supabase/seed-sentences-only.sql\n');

    console.log('📝 步骤 4: 修改 courses 表 ID:\n');
    console.log('   执行以下 SQL:\n');
    console.log('   -- 清空引用表');
    console.log('   TRUNCATE TABLE public.characters CASCADE;');
    console.log('   TRUNCATE TABLE public.sentences CASCADE;');
    console.log('   TRUNCATE TABLE public.shares CASCADE;');
    console.log('   ');
    console.log('   -- 更新 ID');
    console.log('   UPDATE public.courses SET id = 1 WHERE id = 17;');
    console.log('   UPDATE public.courses SET id = 2 WHERE id = 18;');
    console.log('   UPDATE public.courses SET id = 3 WHERE id = 19;');
    console.log('   UPDATE public.courses SET id = 4 WHERE id = 20;');
    console.log('   UPDATE public.courses SET id = 5 WHERE id = 21;');
    console.log('   UPDATE public.courses SET id = 6 WHERE id = 22;');
    console.log('   UPDATE public.courses SET id = 7 WHERE id = 23;');
    console.log('   UPDATE public.courses SET id = 8 WHERE id = 24;');
    console.log('   ');
    console.log('   -- 重置序列');
    console.log('   ALTER SEQUENCE public.courses_id_seq RESTART WITH 9;');
    console.log('   ');
    console.log('   -- 验证');
    console.log('   SELECT id, course_number, title_cn FROM courses ORDER BY id;\n');

    console.log('📝 步骤 5: 插入角色数据（16 条）\n');

    console.log('📝 步骤 6: 插入句子数据（48 条）\n');

    console.log('==========================================\n');

    console.log('💡 浏览器将保持打开，你可以继续操作');
    console.log('⌨️  按 Ctrl+C 关闭浏览器\n');

    // 保持浏览器打开，等待用户操作
    await page.waitForTimeout(300000); // 等待 5 分钟

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  } finally {
    await browser.close();
  }
}

autoSetupSupabase().catch(console.error);
