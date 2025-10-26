#!/bin/bash

# 迁移到 PostgreSQL 的脚本
# 使用方法: ./scripts/migrate-to-postgres.sh

set -e

echo "=================================="
echo "数据库迁移助手: SQLite → PostgreSQL"
echo "=================================="
echo ""

# 检查是否已设置 DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ 错误: DATABASE_URL 环境变量未设置"
    echo ""
    echo "请先设置 PostgreSQL 连接字符串:"
    echo "  export DATABASE_URL=\"postgresql://user:password@host:5432/database\""
    echo ""
    echo "推荐的数据库服务:"
    echo "  - Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres"
    echo "  - Neon (免费): https://neon.tech"
    echo "  - Supabase: https://supabase.com"
    exit 1
fi

echo "✅ 检测到 DATABASE_URL"
echo ""

# 1. 备份 schema.prisma
echo "📦 备份当前 schema.prisma..."
cp prisma/schema.prisma prisma/schema.prisma.sqlite.backup
echo "   备份已保存: prisma/schema.prisma.sqlite.backup"
echo ""

# 2. 更新 schema.prisma
echo "🔄 更新 schema.prisma 为 PostgreSQL..."
cat > prisma/schema.prisma << 'EOF'
// Prisma Schema for Cale Exam System
// 数据库架构设计

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
EOF

# 追加原 schema 的其余部分（跳过前11行）
tail -n +12 prisma/schema.prisma.sqlite.backup >> prisma/schema.prisma

echo "   ✅ schema.prisma 已更新为 PostgreSQL"
echo ""

# 3. 安装依赖（如果需要）
echo "📥 检查依赖..."
if ! command -v prisma &> /dev/null; then
    npm install
fi
echo ""

# 4. 生成 Prisma Client
echo "🔨 生成 Prisma Client..."
npx prisma generate
echo ""

# 5. 创建迁移
echo "📝 创建初始迁移..."
npx prisma migrate dev --name init_postgres
echo ""

# 6. 可选: 运行 seed
read -p "是否要运行数据库种子 (seed)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 运行数据库 seed..."
    npm run db:seed
    echo ""
fi

echo "=================================="
echo "✅ 迁移完成!"
echo "=================================="
echo ""
echo "下一步:"
echo "1. 测试应用是否正常运行: npm run dev"
echo "2. 在 Vercel Dashboard 设置 DATABASE_URL 环境变量"
echo "3. 部署到 Vercel: vercel --prod"
echo ""
echo "备份文件位置:"
echo "  - prisma/schema.prisma.sqlite.backup"
echo ""
