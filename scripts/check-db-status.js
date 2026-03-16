/**
 * Supabase 数据库状态检查脚本
 * 在 SQL Editor 中运行此脚本来诊断问题
 */

// =====================================================
// 复制下面的查询到 Supabase SQL Editor 中执行
// =====================================================

const diagnosticQueries = `
-- ========================================
-- 1. 检查表是否存在
-- ========================================
SELECT
  table_name,
  CASE
    WHEN table_name IN ('users', 'courses', 'characters', 'sentences',
                       'practice_records', 'practice_results',
                       'daily_reports', 'shares')
    THEN '✅ 预期内的表'
    ELSE '⚠️ 其他表'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- 2. 检查每个表的数据量
-- ========================================
SELECT 'courses' as table_name, COUNT(*) as count FROM courses
UNION ALL
SELECT 'characters', COUNT(*) FROM characters
UNION ALL
SELECT 'sentences', COUNT(*) FROM sentences
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'shares', COUNT(*) FROM shares
ORDER BY table_name;

-- ========================================
-- 3. 检查外键约束
-- ========================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
`;

console.log('========================================');
console.log('Supabase 数据库诊断查询');
console.log('========================================\n');
console.log('请将下面的 SQL 复制到 Supabase SQL Editor 中执行：\n');
console.log(diagnosticQueries);

module.exports = { diagnosticQueries };
