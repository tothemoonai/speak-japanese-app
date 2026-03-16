/**
 * SQL 语法验证工具
 * 检查 seed-data.sql 中的常见语法错误
 */

const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, '..', 'supabase', 'seed-data.sql');
const content = fs.readFileSync(sqlFile, 'utf8');

const lines = content.split('\n');
const errors = [];
const warnings = [];

console.log('🔍 正在检查 seed-data.sql...\n');

// 检查每一行
lines.forEach((line, index) => {
  const lineNum = index + 1;

  // 跳过注释和空行
  if (line.trim().startsWith('--') || line.trim() === '') {
    return;
  }

  // 检查 1: 双引号包裹的字符串（应该用单引号）
  if (line.match(/^\s*\([^)]*,"[^"]*"/)) {
    errors.push({
      line: lineNum,
      type: 'ERROR',
      message: '发现双引号包裹的字符串，应该使用单引号',
      content: line.trim().substring(0, 80) + '...'
    });
  }

  // 检查 2: 单引号未转义
  const stringLiterals = line.match(/'[^']*'/g) || [];
  stringLiterals.forEach(literal => {
    if (literal.includes("'") && !literal.includes("''") && literal.length > 2) {
      warnings.push({
        line: lineNum,
        type: 'WARNING',
        message: '可能包含未转义的单引号',
        content: literal
      });
    }
  });

  // 检查 3: JSON 格式错误
  if (line.includes('{')) {
    try {
      // 提取 JSON 部分
      const jsonMatches = line.match(/\{[^}]*\}/g) || [];
      jsonMatches.forEach(jsonStr => {
        try {
          JSON.parse(jsonStr);
        } catch (e) {
          errors.push({
            line: lineNum,
            type: 'ERROR',
            message: 'JSON 格式错误: ' + e.message,
            content: jsonStr
          });
        }
      });
    } catch (e) {
      // 忽略 JSON 解析错误
    }
  }
});

// 输出结果
console.log('========================================');
console.log('  检查结果');
console.log('========================================\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ 未发现语法错误！文件看起来很干净。\n');
} else {
  if (errors.length > 0) {
    console.log(`❌ 发现 ${errors.length} 个错误:\n`);
    errors.forEach(err => {
      console.log(`  ${err.type} [第 ${err.line} 行]`);
      console.log(`  ${err.message}`);
      console.log(`  内容: ${err.content}`);
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log(`⚠️  发现 ${warnings.length} 个警告:\n`);
    warnings.forEach(warn => {
      console.log(`  ${warn.type} [第 ${warn.line} 行]`);
      console.log(`  ${warn.message}`);
      console.log(`  内容: ${warn.content}`);
      console.log('');
    });
  }
}

// 统计信息
console.log('========================================');
console.log('  统计信息');
console.log('========================================\n');

const insertStatements = content.match(/INSERT INTO/gi) || [];
const totalLines = lines.length;
const commentLines = lines.filter(l => l.trim().startsWith('--')).length;
const emptyLines = lines.filter(l => l.trim() === '').length;

console.log(`📄 总行数: ${totalLines}`);
console.log(`📝 INSERT 语句: ${insertStatements.length}`);
console.log(`💬 注释行: ${commentLines}`);
console.log(`⏭️  空行: ${emptyLines}`);
console.log(`📊 有效代码行: ${totalLines - commentLines - emptyLines}\n`);

// 检查数据完整性
console.log('========================================');
console.log('  数据完整性检查');
console.log('========================================\n');

const courseCount = (content.match(/INSERT INTO public\.courses/gi) || []).length;
const characterCount = (content.match(/INSERT INTO public\.characters/gi) || []).length;
const sentenceCount = (content.match(/INSERT INTO public\.sentences/gi) || []).length;

console.log(`📚 课程插入语句: ${courseCount} (预期: 1)`);
console.log(`👥 角色插入语句: ${characterCount} (预期: 1)`);
console.log(`💬 句子插入语句: ${sentenceCount} (预期: 8)`);
console.log(`\n✅ 如果数字匹配，说明数据结构完整！\n`);
