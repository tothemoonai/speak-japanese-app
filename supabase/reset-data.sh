#!/bin/bash

# =====================================================
# SpeakJapaneseApp - Supabase 数据重置脚本
# 使用方法: bash supabase/reset-data.sh
# =====================================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  SpeakJapaneseApp - 数据重置"
echo "=========================================="
echo ""

# 检查环境变量
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ 错误: 请设置 Supabase 环境变量"
    echo ""
    echo "使用方法:"
    echo "  export SUPABASE_URL='your-project-url'"
    echo "  export SUPABASE_ANON_KEY='your-anon-key'"
    echo "  bash supabase/reset-data.sh"
    echo ""
    exit 1
fi

echo "✅ 环境变量检查通过"
echo ""

# 提取数据库连接信息
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).supabase.co\/.*/\1/')
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"

echo "⚠️  警告: 此操作将清空所有测试数据！"
echo ""
read -p "确定要继续吗？(yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo "请输入 Supabase 数据库密码:"
read -s -p "数据库密码: " DB_PASSWORD
echo ""
echo ""

CONNECTION_STRING="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/postgres"

echo "=========================================="
echo "  开始重置数据"
echo "=========================================="
echo ""

# 清空所有数据（保留表结构）
echo "🗑️  清空现有数据..."

psql "$CONNECTION_STRING" << 'EOF'
-- 清空测试数据（按依赖顺序）
TRUNCATE TABLE public.practice_results CASCADE;
TRUNCATE TABLE public.practice_records CASCADE;
TRUNCATE TABLE public.daily_reports CASCADE;
TRUNCATE TABLE public.shares CASCADE;
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.sentences CASCADE;
TRUNCATE TABLE public.characters CASCADE;
TRUNCATE TABLE public.courses CASCADE;
EOF

if [ $? -eq 0 ]; then
    echo "✅ 数据清空完成"
else
    echo "❌ 数据清空失败"
    exit 1
fi

echo ""

# 重新导入测试数据
echo "📊 重新导入测试数据..."

if psql "$CONNECTION_STRING" -f supabase/seed-data.sql 2>/dev/null; then
    echo "✅ 测试数据重新导入完成"
else
    echo "❌ 测试数据导入失败"
    exit 1
fi

echo ""

# 验证数据
echo "🔍 验证数据..."

COURSE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM courses;" 2>/dev/null | xargs)
CHARACTER_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM characters;" 2>/dev/null | xargs)
SENTENCE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM sentences;" 2>/dev/null | xargs)

echo ""
echo "📊 数据统计:"
echo "  课程: ${COURSE_COUNT} 个"
echo "  角色: ${CHARACTER_COUNT} 个"
echo "  句子: ${SENTENCE_COUNT} 个"
echo ""

echo "=========================================="
echo "  ✅ 数据重置完成！"
echo "=========================================="
echo ""

echo "💡 提示:"
echo "   - 所有用户数据已清空"
echo "   - 测试数据已重新导入"
echo "   - 需要重新注册用户"
echo ""
