/**
 * 使用 Supabase REST API 和 service_role key 执行迁移
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 缺少环境变量');
  process.exit(1);
}

if (serviceRoleKey.includes('YOUR_SECRET_KEY_HERE')) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY 还是占位符');
  console.error('\n请从以下位置获取 service_role key:');
  console.error('https://supabase.com/dashboard/project/utvbpbxhdckgzhxcgqui/settings/api\n');
  console.error('然后更新 .env.local 中的 SUPABASE_SERVICE_ROLE_KEY\n');
  process.exit(1);
}

console.log('🚀 使用 Supabase REST API 执行数据库迁移');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 提取项目 ID
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectId = match ? match[1] : 'unknown';
console.log(`📡 项目: ${projectId}\n`);

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeMigration() {
  try {
    console.log('📝 步骤 1/5: 创建 books 表...\n');

    // 使用 RPC 执行 SQL（如果可用）
    // 或者直接通过 REST API 操作

    // 方法1：直接插入数据（会自动创建表结构）
    // 首先获取课程总数
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id');

    if (coursesError) {
      throw coursesError;
    }

    const courseCount = courses?.length || 0;

    console.log(`   ℹ️  当前课程数: ${courseCount}\n`);

    // 尝试插入测试课本
    console.log('📝 步骤 2/5: 插入"测试课本"...\n');

    const { data: existingBooks, error: checkError } = await supabase
      .from('books')
      .select('*')
      .eq('id', 1);

    if (checkError && checkError.message.includes('does not exist')) {
      // books 表不存在，需要手动创建
      console.log('⚠️  books 表尚未创建');
      console.log('\n请在 Supabase SQL Editor 中执行以下 SQL:\n');
      console.log('═══════════════════════════════════════════════════════════════');

      const migrationSQL = readFileSync(
        path.join(__dirname, '../supabase/migrations/2026032501_create_books_and_migrate.sql'),
        'utf-8'
      );

      console.log(migrationSQL);
      console.log('═══════════════════════════════════════════════════════════════\n');

      console.log('💡 快速操作：');
      console.log('   1. 打开: https://supabase.com/dashboard/project/' + projectId + '/editor');
      console.log('   2. 复制上面的 SQL');
      console.log('   3. 粘贴到 SQL Editor 并点击 Run');
      console.log('   4. 重新运行此脚本\n');

      process.exit(0);
    }

    if (checkError) {
      throw checkError;
    }

    if (existingBooks && existingBooks.length > 0) {
      console.log('   ℹ️  测试课本已存在');
      console.log(`   📚 书名: ${existingBooks[0].title_cn} / ${existingBooks[0].title_jp}`);
    } else {
      // 插入测试课本
      const { data: newBook, error: insertError } = await supabase
        .from('books')
        .insert({
          id: 1,
          book_number: 1,
          title_cn: '测试课本',
          title_jp: 'テスト教科書',
          description: '用于测试的课本，包含现有的所有课程',
          difficulty: 'N5',
          total_courses: courseCount,
          sort_order: 1,
          is_published: true,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log('   ✅ 测试课本创建成功');
      console.log(`   📚 书名: ${newBook.title_cn} / ${newBook.title_jp}`);
      console.log(`   📊 课程数: ${newBook.total_courses}`);
    }

    // 更新所有课程的 book_id
    console.log('\n📝 步骤 3/5: 更新课程的 book_id...\n');

    const { data: allCourses, error: allCoursesError } = await supabase
      .from('courses')
      .select('id, book_id');

    if (allCoursesError) {
      throw allCoursesError;
    }

    const coursesWithoutBookId = allCourses?.filter(c => !c.book_id || c.book_id === 0) || [];

    if (coursesWithoutBookId.length > 0) {
      console.log(`   ℹ️  发现 ${coursesWithoutBookId.length} 个课程没有 book_id`);

      // 批量更新
      const { error: updateError } = await supabase
        .from('courses')
        .update({ book_id: 1 })
        .is('book_id', null);

      if (updateError) {
        throw updateError;
      }

      console.log('   ✅ 课程 book_id 更新成功');
    } else {
      console.log('   ℹ️  所有课程已有 book_id');
    }

    // 更新书本的课程总数
    console.log('\n📝 步骤 4/5: 更新书本课程总数...\n');

    const { count, error: countError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', 1);

    if (countError) {
      throw countError;
    }

    const { error: updateCountError } = await supabase
      .from('books')
      .update({ total_courses: count || 0 })
      .eq('id', 1);

    if (updateCountError) {
      throw updateCountError;
    }

    console.log(`   ✅ 书本课程总数已更新: ${count}`);

    // 验证结果
    console.log('\n📝 步骤 5/5: 验证迁移结果...\n');

    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*');

    if (booksError) {
      throw booksError;
    }

    console.log('✅ 书本列表：');
    books.forEach(book => {
      console.log(`   📚 ${book.title_cn} (${book.title_jp})`);
      console.log(`      难度: ${book.difficulty} | 课程数: ${book.total_courses}`);
    });

    const { data: sampleCourses } = await supabase
      .from('courses')
      .select('id, title_cn, book_id')
      .eq('book_id', 1)
      .limit(5);

    if (sampleCourses && sampleCourses.length > 0) {
      console.log('\n✅ 课程样本（book_id=1）：');
      sampleCourses.forEach(course => {
        console.log(`   - ${course.title_cn}`);
      });
    }

    console.log('\n🎉 数据库迁移完成！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 下一步：\n');
    console.log('   1. 启动开发服务器:');
    console.log('      npm run dev\n');
    console.log('   2. 访问书本列表页:');
    console.log('      http://localhost:3000/books\n');
    console.log('   3. 测试功能:\n');
    console.log('      - 查看课本列表');
    console.log('      - 点击课本查看课程');
    console.log('      - 测试课程练习功能\n');

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('\n详细错误:');
    console.error(error);

    // 如果是表不存在错误，输出 SQL
    if (error.message && error.message.includes('does not exist')) {
      console.log('\n💡 提示：books 表尚未创建');
      console.log('请在 Supabase SQL Editor 中执行迁移 SQL:\n');
      console.log('https://supabase.com/dashboard/project/' + projectId + '/editor\n');
    }

    process.exit(1);
  }
}

executeMigration();
