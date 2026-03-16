#!/bin/bash

# =====================================================
# SpeakJapaneseApp - Supabase 快速设置脚本
# 使用方法: bash supabase/setup.sh
# =====================================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  SpeakJapaneseApp - Supabase 设置"
echo "=========================================="
echo ""

# 检查环境变量
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ 错误: 请设置 Supabase 环境变量"
    echo ""
    echo "使用方法:"
    echo "  export SUPABASE_URL='your-project-url'"
    echo "  export SUPABASE_ANON_KEY='your-anon-key'"
    echo "  bash supabase/setup.sh"
    echo ""
    exit 1
fi

echo "✅ 环境变量检查通过"
echo ""

# 提取数据库连接信息
# 从 SUPABASE_URL 中提取项目引用
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).supabase.co\/.*/\1/')
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_NAME="postgres"
DB_PORT="5432"

echo "📊 项目信息:"
echo "  项目引用: $PROJECT_REF"
echo "  数据库主机: $DB_HOST"
echo ""

# 询问数据库密码
echo "请输入 Supabase 数据库密码:"
echo "提示: 在 Supabase Dashboard -> Project Settings -> Database 中查看"
echo ""
read -s -p "数据库密码: " DB_PASSWORD
echo ""
echo ""

# 构建连接字符串
CONNECTION_STRING="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/postgres"

echo "=========================================="
echo "  开始执行数据库设置"
echo "=========================================="
echo ""

# 检查 psql 是否安装
if ! command -v psql &> /dev/null; then
    echo "⚠️  警告: psql 命令未找到"
    echo ""
    echo "请使用以下方法之一:"
    echo ""
    echo "方法 1: 使用 Supabase SQL Editor（推荐）"
    echo "  1. 访问 https://supabase.com/dashboard"
    echo "  2. 选择你的项目"
    echo "  3. 点击 SQL Editor"
    echo "  4. 复制并执行 schema.sql 的内容"
    echo "  5. 复制并执行 seed-data.sql 的内容"
    echo ""
    echo "方法 2: 安装 PostgreSQL 客户端"
    echo "  Windows: https://www.postgresql.org/download/windows/"
    echo "  Mac: brew install postgresql"
    echo "  Linux: sudo apt-get install postgresql-client"
    echo ""
    exit 1
fi

echo "✅ 找到 psql 命令"
echo ""

# 执行 schema.sql
echo "📝 创建数据库表结构..."
if psql "$CONNECTION_STRING" -f supabase/schema.sql 2>/dev/null; then
    echo "✅ 数据库表创建成功"
else
    echo "❌ 数据库表创建失败"
    echo ""
    echo "请检查:"
    echo "  1. 数据库密码是否正确"
    echo "  2. 网络连接是否正常"
    echo "  3. Supabase 项目是否正常运行"
    exit 1
fi
echo ""

# 等待一下让表完全创建
sleep 2

# 执行 seed-data.sql
echo "📊 导入测试数据..."
if psql "$CONNECTION_STRING" -f supabase/seed-data.sql 2>/dev/null; then
    echo "✅ 测试数据导入成功"
else
    echo "❌ 测试数据导入失败"
    echo ""
    echo "请检查 schema.sql 是否已成功执行"
    exit 1
fi
echo ""

# 验证数据
echo "🔍 验证数据库设置..."
echo ""

# 检查表数量
TABLE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

if [ "$TABLE_COUNT" -ge 8 ]; then
    echo "✅ 数据库表创建完成 (${TABLE_COUNT} 个表)"
else
    echo "⚠️  警告: 表数量不正确 (预期: 8+, 实际: $TABLE_COUNT)"
fi

# 检查课程数据
COURSE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM courses;" 2>/dev/null | xargs)

if [ "$COURSE_COUNT" -eq 8 ]; then
    echo "✅ 课程数据导入完成 (${COURSE_COUNT} 个课程)"
else
    echo "⚠️  警告: 课程数量不正确 (预期: 8, 实际: $COURSE_COUNT)"
fi

# 检查角色数据
CHARACTER_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM characters;" 2>/dev/null | xargs)

if [ "$CHARACTER_COUNT" -eq 16 ]; then
    echo "✅ 角色数据导入完成 (${CHARACTER_COUNT} 个角色)"
else
    echo "⚠️  警告: 角色数量不正确 (预期: 16, 实际: $CHARACTER_COUNT)"
fi

# 检查句子数据
SENTENCE_COUNT=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM sentences;" 2>/dev/null | xargs)

if [ "$SENTENCE_COUNT" -ge 30 ]; then
    echo "✅ 句子数据导入完成 (${SENTENCE_COUNT} 个句子)"
else
    echo "⚠️  警告: 句子数量不正确 (预期: 30+, 实际: $SENTENCE_COUNT)"
fi

echo ""
echo "=========================================="
echo "  ✅ 数据库设置完成！"
echo "=========================================="
echo ""

echo "📋 下一步:"
echo ""
echo "1. 更新 .env 文件中的 Supabase 配置"
echo "   NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
echo ""
echo "2. 启动开发服务器"
echo "   npm run dev"
echo ""
echo "3. 访问应用"
echo "   http://localhost:3000"
echo ""
echo "4. 测试用户注册功能"
echo "   - 注册新用户会自动创建 users 记录"
echo "   - 可以浏览 8 个课程"
echo "   - 可以查看角色和句子"
echo ""

echo "📚 查看文档:"
echo "   - supabase/使用指南.md - 详细的设置和使用指南"
echo "   - supabase/schema.sql - 数据库结构"
echo "   - supabase/seed-data.sql - 测试数据"
echo ""

echo "💡 提示:"
echo "   如需重新导入数据，可以运行: bash supabase/reset-data.sh"
echo ""
