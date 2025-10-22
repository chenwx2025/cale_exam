#!/bin/bash

# ============================================
# Cale 加州中医考试系统 - 自动化部署脚本
# ============================================
#
# 使用方法:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh [production|staging]
#
# ============================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 环境参数
ENVIRONMENT=${1:-production}

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Cale 考试系统部署脚本${NC}"
echo -e "${GREEN}环境: $ENVIRONMENT${NC}"
echo -e "${GREEN}=====================================${NC}"

# ============================================
# 1. 环境检查
# ============================================
echo -e "\n${YELLOW}[1/8] 检查环境...${NC}"

if [ ! -f ".env.$ENVIRONMENT" ]; then
    echo -e "${RED}错误: .env.$ENVIRONMENT 文件不存在${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: npm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 环境检查通过${NC}"

# ============================================
# 2. 备份数据库
# ============================================
echo -e "\n${YELLOW}[2/8] 备份数据库...${NC}"

if [ -f "dev.db" ]; then
    BACKUP_FILE="backups/db-backup-$(date +%Y%m%d-%H%M%S).db"
    mkdir -p backups
    cp dev.db "$BACKUP_FILE"
    echo -e "${GREEN}✓ 数据库已备份到: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ 未找到 SQLite 数据库，跳过备份${NC}"
fi

# ============================================
# 3. 拉取最新代码 (如果使用 Git)
# ============================================
echo -e "\n${YELLOW}[3/8] 更新代码...${NC}"

if [ -d ".git" ]; then
    git pull origin main
    echo -e "${GREEN}✓ 代码已更新${NC}"
else
    echo -e "${YELLOW}⚠ 非 Git 仓库，跳过代码更新${NC}"
fi

# ============================================
# 4. 安装依赖
# ============================================
echo -e "\n${YELLOW}[4/8] 安装依赖...${NC}"

npm ci --production=false
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# ============================================
# 5. 生成 Prisma Client
# ============================================
echo -e "\n${YELLOW}[5/8] 生成 Prisma Client...${NC}"

npx prisma generate
echo -e "${GREEN}✓ Prisma Client 已生成${NC}"

# ============================================
# 6. 数据库迁移
# ============================================
echo -e "\n${YELLOW}[6/8] 执行数据库迁移...${NC}"

# 加载环境变量
export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)

npx prisma db push
echo -e "${GREEN}✓ 数据库迁移完成${NC}"

# ============================================
# 7. 构建应用
# ============================================
echo -e "\n${YELLOW}[7/8] 构建应用...${NC}"

npm run build
echo -e "${GREEN}✓ 应用构建完成${NC}"

# ============================================
# 8. 重启服务
# ============================================
echo -e "\n${YELLOW}[8/8] 重启服务...${NC}"

if command -v pm2 &> /dev/null; then
    # 使用 PM2
    pm2 restart ecosystem.config.js --env $ENVIRONMENT || pm2 start ecosystem.config.js --env $ENVIRONMENT
    pm2 save
    echo -e "${GREEN}✓ PM2 服务已重启${NC}"
elif command -v systemctl &> /dev/null; then
    # 使用 systemd
    sudo systemctl restart cale-exam
    echo -e "${GREEN}✓ Systemd 服务已重启${NC}"
else
    echo -e "${YELLOW}⚠ 未找到 PM2 或 systemd，请手动重启服务${NC}"
    echo -e "${YELLOW}运行命令: NODE_ENV=$ENVIRONMENT node .output/server/index.mjs${NC}"
fi

# ============================================
# 完成
# ============================================
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}✓ 部署完成！${NC}"
echo -e "${GREEN}=====================================${NC}"

# 显示服务状态
if command -v pm2 &> /dev/null; then
    echo -e "\n${YELLOW}服务状态:${NC}"
    pm2 status
fi

echo -e "\n${YELLOW}下一步:${NC}"
echo -e "1. 访问应用: ${APP_URL:-http://localhost:3001}"
echo -e "2. 查看日志: pm2 logs cale-exam"
echo -e "3. 监控服务: pm2 monit"
