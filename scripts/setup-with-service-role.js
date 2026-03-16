/**
 * 使用 Supabase Service Role Key 设置数据库
 * 直接使用 PostgreSQL 连接
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'utvbpbxhdckgzhxcgqui';
const DB_PASSWORD = 'dKNh7xERR6Mtpkxx';

// 尝试多个可能的连接端点
const CONNECTION_STRINGS = [
  // Pooler 端点 (推荐)
  `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,

  // 直连端点
  `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`,

  // 备用区域
  `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`
];

async function executeSQLFile(client, filePath, description) {
  console.log(`\n📄 ${description}`);
  console.log(`   文件: ${path.basename(filePath)}`);

  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    // 将 SQL 按分号分割，过滤掉空语句和注释
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
      .map(s => {
        // 移除行内注释
        return s.replace(/--.*$/gm, '').trim();
      })
      .filter(s => s.length > 10); // 过滤太短的语句

    console.log(`   找到 ${statements.length} 条 SQL 语句`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        await client.query(statement);
        successCount++;
        if (successCount % 5 === 0) {
          console.log(`   进度: ${successCount}/${statements.length}`);
        }
      } catch (err) {
        errorCount++;
        const errorMsg = err.message.toLowerCase();

        // 忽略一些可接受的错误
        if (errorMsg.includes('already exists') ||
            errorMsg.includes('duplicate') ||
            errorMsg.includes('does not exist') && statement.toUpperCase().includes('DROP')) {
          // 忽略
        } else {
          console.log(`   ⚠️  语句 ${i + 1} 错误: ${err.message.substring(0, 100)}`);
        }
      }
    }

    console.log(`   ✅ 完成: 成功 ${successCount}, 错误 ${errorCount}`);
    return { successCount, errorCount };
  } catch (error) {
    console.error(`   ❌ 执行失败: ${error.message}`);
    throw error;
  }
}

async function verifyDatabase(client) {
  console.log('\n🔍 验证数据库设置...');

  const checks = [
    { name: '课程数量', query: 'SELECT COUNT(*)::int as count FROM courses;', expected: 8 },
    { name: '角色数量', query: 'SELECT COUNT(*)::int as count FROM characters;', expected: 16 },
    { name: '句子数量', query: 'SELECT COUNT(*)::int as count FROM sentences;', expected: 48 }
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
  console.log('  Supabase 数据库自动设置');
  console.log('  使用 Service Role Key');
  console.log('==========================================');
  console.log(`\n项目: ${PROJECT_REF}`);
  console.log(`密码: ${DB_PASSWORD ? '已提供' : '未提供'}\n`);

  let client = null;
  let connected = false;

  // 尝试每个连接字符串
  for (let i = 0; i < CONNECTION_STRINGS.length; i++) {
    const connectionString = CONNECTION_STRINGS[i];
    console.log(`\n🔍 尝试连接 ${i + 1}/${CONNECTION_STRINGS.length}...`);

    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('   ✅ 连接成功！');
      connected = true;
      break;
    } catch (error) {
      console.log(`   ❌ 连接失败: ${error.message}`);
      await client.end().catch(() => {});
      client = null;
    }
  }

  if (!connected) {
    console.error('\n❌ 所有连接尝试都失败了');
    console.error('\n请检查:');
    console.error('1. 数据库密码是否正确');
    console.error('2. 项目引用是否正确');
    console.error('3. 项目是否正在运行');
    console.error('4. 网络连接是否正常\n');
    process.exit(1);
  }

  try {
    // 步骤 1: 清空并重置数据
    console.log('\n==========================================');
    console.log('  步骤 1: 清空现有数据');
    console.log('==========================================');

    await client.query('TRUNCATE TABLE public.shares CASCADE;');
    await client.query('TRUNCATE TABLE public.sentences CASCADE;');
    await client.query('TRUNCATE TABLE public.characters CASCADE;');
    await client.query('TRUNCATE TABLE public.courses CASCADE;');
    console.log('✅ 数据已清空');

    // 修正 courses 的 ID
    console.log('\n==========================================');
    console.log('  步骤 2: 重新插入课程数据');
    console.log('==========================================');

    const coursesSQL = `
      INSERT INTO public.courses (course_number, title_cn, title_jp, description, difficulty, theme, scene_image_url, total_sentences, vocab_count, grammar_count, sort_order) VALUES
      (1, '初次见面', '初めての会話', '学习基本的问候语和自我介绍', 'N5', '日常会话', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', 5, 20, 5, 1),
      (2, '购物场景', '買い物', '在商店购物时的实用对话', 'N5', '日常会话', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 6, 25, 8, 2),
      (3, '问路场景', '道を尋ねる', '学习如何问路和指路', 'N5', '日常会话', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', 5, 18, 6, 3),
      (4, '餐厅点餐', 'レストランで注文', '在餐厅点餐的基本对话', 'N4', '日常会话', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 7, 30, 10, 4),
      (5, '职场交流', '職場でのコミュニケーション', '办公室和工作场所的交流用语', 'N4', '商务日语', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 6, 28, 9, 5),
      (6, '旅行日语', '旅行の日本語', '旅行时必备的日语表达', 'N3', '旅行', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 8, 40, 15, 6),
      (7, '文化体验', '文化体験', '日本文化活动相关对话', 'N3', '文化', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', 5, 22, 8, 7),
      (8, '商务谈判', 'ビジネス交渉', '正式商务谈判用语', 'N3', '商务日语', 'https://images.unsplash.com/photo-1552664730-30f0ec360682?w=800', 6, 35, 12, 8);
    `;

    await client.query(coursesSQL);
    console.log('✅ 课程数据插入成功');

    // 验证 ID 是否正确
    const courseResult = await client.query('SELECT id, course_number FROM courses ORDER BY id');
    console.log('\n📊 课程 ID 验证:');
    courseResult.rows.forEach(row => {
      console.log(`   id=${row.id}, course_number=${row.course_number}`);
    });

    // 步骤 3: 插入角色数据
    console.log('\n==========================================');
    console.log('  步骤 3: 插入角色数据');
    console.log('==========================================');

    const charactersSQL = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'seed-data.sql'), 'utf8')
      .split(/-- 课程\d:/)[1] // 提取角色部分
      .split(/-- =====================================================/)[0]; // 截取到下一个部分

    // 手动构建角色 INSERT
    const charactersInsert = `
      INSERT INTO public.characters (course_id, name_cn, name_jp, gender, age_range, description, avatar_url, difficulty_level) VALUES
      (1, '田中先生', '田中先生', 'male', '30-40', '一位友好的商务人士', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanaka', 'medium'),
      (1, '山田小姐', '山田さん', 'female', '25-30', '温柔的办公室职员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yamada', 'easy'),
      (2, '店员', '店員さん', 'female', '20-30', '热情的商店店员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shopclerk', 'easy'),
      (2, '顾客', 'お客様', 'other', '35-45', '购物的顾客', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Customer', 'medium'),
      (3, '路人', '通行人', 'male', '25-35', '路过的行人', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Passerby', 'easy'),
      (3, '警察', '警察官', 'male', '30-40', '友好的警察', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Police', 'medium'),
      (4, '服务员', '店員さん', 'female', '20-25', '亲切的服务员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Waitress', 'easy'),
      (4, '厨师', 'シェフ', 'male', '35-45', '专业厨师', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chef', 'hard'),
      (5, '经理', 'マネージャー', 'male', '40-50', '部门经理', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager', 'hard'),
      (5, '同事', '同僚さん', 'female', '28-35', '亲切的同事', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Colleague', 'medium'),
      (6, '导游', 'ガイドさん', 'female', '25-35', '专业的导游', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guide', 'medium'),
      (6, '游客', '観光客', 'other', '30-40', '来自海外的游客', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tourist', 'easy'),
      (7, '老师', '先生', 'female', '35-45', '文化老师', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher', 'medium'),
      (7, '学生', '学生さん', 'other', '20-25', '学习文化的学生', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student', 'easy'),
      (8, '社长', '社長', 'male', '50-60', '公司社长', 'https://api.dicebear.com/7.x/avataaars/svg?seed=President', 'hard'),
      (8, '秘书', '秘書さん', 'female', '30-40', '专业秘书', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Secretary', 'hard');
    `;

    await client.query(charactersInsert);
    console.log('✅ 角色数据插入成功 (16 个角色)');

    // 步骤 4: 插入句子数据
    console.log('\n==========================================');
    console.log('  步骤 4: 插入句子数据');
    console.log('==========================================');

    const sentencesPath = path.join(__dirname, '..', 'supabase', 'seed-sentences-only.sql');
    await executeSQLFile(client, sentencesPath, '插入句子数据');

    // 步骤 5: 验证数据
    console.log('\n==========================================');
    console.log('  步骤 5: 验证数据库');
    console.log('==========================================');

    const verificationPassed = await verifyDatabase(client);

    console.log('\n==========================================');
    console.log('  ✅ 数据库设置完成！');
    console.log('==========================================');

    if (verificationPassed) {
      console.log('\n📋 下一步:');
      console.log('   1. 启动开发服务器: npm run dev');
      console.log('   2. 访问应用: http://localhost:3000');
      console.log('   3. 注册新用户测试功能\n');
    } else {
      console.log('\n⚠️  部分验证未通过，请检查数据\n');
    }

  } catch (error) {
    console.error('\n❌ 设置失败:', error.message);
    console.error('\n详细错误:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('\n👋 数据库连接已关闭\n');
    }
  }
}

main().catch(console.error);
