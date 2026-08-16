/**
 * 课程导入脚本
 *
 * 用途：从JSON文件批量导入课程数据到数据库
 *
 * 使用方法：
 * 1. 创建 import-courses.json 文件（参考示例数据格式）
 * 2. 运行: node scripts/import-courses.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importCourses() {
  console.log('📚 开始导入课程...\n');

  // 读取导入数据
  let data;
  try {
    const jsonPath = join(process.cwd(), 'scripts', 'import-courses.json');
    const jsonContent = readFileSync(jsonPath, 'utf-8');
    data = JSON.parse(jsonContent);
  } catch (error) {
    console.error('❌ 无法读取 import-courses.json 文件');
    console.error('请确保该文件存在于 scripts/ 目录下\n');
    process.exit(1);
  }

  try {
    // 1. 检查书本是否已存在
    const { data: existingBook } = await supabase
      .from('jp_books')
      .select('*')
      .eq('book_number', data.book.book_number)
      .single();

    let book;

    if (existingBook) {
      console.log(`⚠️  书本已存在: ${existingBook.title_cn}`);
      console.log(`   使用现有书本 (ID: ${existingBook.id})\n`);
      book = existingBook;
    } else {
      // 插入新书本
      const { data: newBook, error: bookError } = await supabase
        .from('jp_books')
        .insert({
          book_number: data.book.book_number,
          title_cn: data.book.title_cn,
          title_jp: data.book.title_jp,
          description: data.book.description,
          difficulty: data.book.difficulty,
          target_audience: data.book.target_audience || null,
          cover_image_url: data.book.cover_image_url || null,
          sort_order: data.book.sort_order,
          is_published: data.book.is_published
        })
        .select()
        .single();

      if (bookError) throw bookError;
      book = newBook;
      console.log(`✅ 书本创建成功: ${book.title_cn} (ID: ${book.id})\n`);
    }

    // 2. 插入课程和句子
    let totalSentences = 0;

    for (const courseData of data.courses) {
      console.log(`📖 处理课程: ${courseData.title_cn}`);

      // 检查课程是否已存在（book_id 存的是业务键 book_number）
      const { data: existingCourse } = await supabase
        .from('jp_courses')
        .select('*')
        .eq('book_id', book.book_number)
        .eq('course_number', courseData.course_number)
        .single();

      let course;

      if (existingCourse) {
        console.log(`   ⚠️  课程已存在，跳过创建\n`);
        course = existingCourse;
        continue;
      }

      // 插入课程
      const { data: newCourse, error: courseError } = await supabase
        .from('jp_courses')
        .insert({
          book_id: book.book_number,
          course_number: courseData.course_number,
          title_cn: courseData.title_cn,
          title_jp: courseData.title_jp,
          description: courseData.description,
          difficulty: courseData.difficulty,
          theme: courseData.theme || null,
          scene_image_url: courseData.scene_image_url || null,
          total_sentences: courseData.total_sentences,
          vocab_count: courseData.vocab_count || null,
          grammar_count: courseData.grammar_count || null,
          sort_order: courseData.sort_order ?? courseData.course_number
        })
        .select()
        .single();

      if (courseError) throw courseError;
      course = newCourse;
      console.log(`   ✅ 课程创建成功 (ID: ${course.id})`);

      // 插入句子
      if (courseData.sentences && courseData.sentences.length > 0) {
        let sentenceCount = 0;

        for (const sentenceData of courseData.sentences) {
          const { error: sentenceError } = await supabase
            .from('jp_sentences')
            .insert({
              book_id: book.book_number,
              course_id: course.course_number,
              sentence_order: sentenceData.sentence_order,
              character_id: sentenceData.character_id || 1,
              text_jp: sentenceData.text_jp,
              text_cn: sentenceData.text_cn,
              text_furigana: sentenceData.text_furigana || null,
              text_romaji: sentenceData.text_romaji || null,
              vocabulary: sentenceData.vocabulary || {},
              grammar_points: sentenceData.grammar_points || {},
              difficulty_level: sentenceData.difficulty_level || 'medium'
            });

          if (sentenceError) {
            console.error(`   ❌ 句子插入失败: ${sentenceError.message}`);
            throw sentenceError;
          }

          sentenceCount++;
        }

        console.log(`   ✅ 插入 ${sentenceCount} 个句子\n`);
        totalSentences += sentenceCount;
      } else {
        console.log(`   ⚠️  没有句子数据\n`);
      }
    }

    // 3. 更新书本的课程总数（book_id 为业务键 book_number）
    const { data: allCourses } = await supabase
      .from('jp_courses')
      .select('id')
      .eq('book_id', book.book_number);

    const courseCount = allCourses ? allCourses.length : 0;

    const { error: updateError } = await supabase
      .from('jp_books')
      .update({ total_courses: courseCount })
      .eq('id', book.id);

    if (updateError) throw updateError;

    // 4. 输出总结
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 导入完成！\n');
    console.log('📊 统计信息:');
    console.log(`   书本: ${book.title_cn} (${book.title_jp})`);
    console.log(`   课程数: ${courseCount}`);
    console.log(`   总句子数: ${totalSentences}\n`);
    console.log('🔗 查看页面:');
    console.log(`   书本列表: http://localhost:3000/books`);
    console.log(`   书本详情: http://localhost:3000/books/${book.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 导入失败:', error.message);
    if (error.details) {
      console.error('详情:', error.details);
    }
    if (error.hint) {
      console.error('提示:', error.hint);
    }
    process.exit(1);
  }
}

// 导出示例数据模板
function exportTemplate() {
  const template = {
    book: {
      book_number: 2,
      title_cn: "大家的日语",
      title_jp: "みんなの日本語",
      description: "专为初学者设计的日语教材",
      difficulty: "N5",
      target_audience: "初学者",
      cover_image_url: "https://images.unsplash.com/photo-xxx?w=800",
      sort_order: 2,
      is_published: true
    },
    courses: [
      {
        course_number: 1,
        title_cn: "自我介绍",
        title_jp: "自己紹介",
        description: "学习如何进行自我介绍",
        difficulty: "N5",
        theme: "日常会话",
        scene_image_url: "https://images.unsplash.com/photo-xxx?w=800",
        total_sentences: 3,
        vocab_count: 15,
        grammar_count: 3,
        sort_order: 1,
        sentences: [
          {
            sentence_order: 1,
            character_id: 1,
            text_jp: "こんにちは、はじめまして。",
            text_cn: "你好，初次见面。",
            text_furigana: "こんにちは、はじめまして。",
            text_romaji: "Konnichiwa, hajimemashite.",
            vocabulary: {
              "こんにちは": "你好",
              "はじめまして": "初次见面"
            },
            grammar_points: {
              "问候语": "基本的自我介绍问候"
            },
            difficulty_level: "easy"
          },
          {
            sentence_order: 2,
            character_id: 1,
            text_jp: "田中です。よろしくお願いします。",
            text_cn: "我是田中，请多关照。",
            text_furigana: "たなかです。よろしくおねがいします。",
            text_romaji: "Tanaka desu. Yoroshiku onegaishimasu.",
            vocabulary: {
              "田中": "姓氏",
              "よろしくお願いします": "请多关照"
            },
            grammar_points: {
              "自我介绍": "〜です（是...）"
            },
            difficulty_level: "easy"
          },
          {
            sentence_order: 3,
            character_id: 2,
            text_jp: "こちらこそ、よろしくお願いします。",
            text_cn: "彼此彼此，请多关照。",
            text_furigana: "こちらこそ、よろしくおねがいします。",
            text_romaji: "Kochira koso, yoroshiku onegaishimasu.",
            vocabulary: {
              "こちらこそ": "彼此彼此/我才应该"
            },
            grammar_points: {
              "礼貌用语": "こちらこそ（我才应该...）"
            },
            difficulty_level: "medium"
          }
        ]
      }
    ]
  };

  console.log('📝 示例数据模板 (import-courses.json):\n');
  console.log(JSON.stringify(template, null, 2));
  console.log('\n将以上内容保存到 scripts/import-courses.json，然后运行此脚本。\n');
}

// 检查命令行参数
const args = process.argv.slice(2);
if (args.includes('--template') || args.includes('-t')) {
  exportTemplate();
} else {
  importCourses();
}
