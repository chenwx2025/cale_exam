#!/bin/bash

###############################################################################
# AWS EC2 自动部署脚本
#
# 功能：
# - 拉取最新代码
# - 备份数据库
# - 更新依赖
# - 重新构建和部署应用
#
# 使用方法：
# chmod +x scripts/deploy-aws.sh
# ./scripts/deploy-aws.sh
#
# 环境要求：
# - Docker 和 Docker Compose 已安装
# - 已克隆项目到服务器
# - .env.production 文件已配置
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示横幅
echo ""
echo "=========================================="
echo "    AWS EC2 部署脚本 - Cale Exam"
echo "=========================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    log_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    log_error "Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 .env.production 是否存在
if [ ! -f ".env.production" ]; then
    log_error ".env.production 文件不存在"
    log_info "请从 .env.aws.example 复制并配置："
    log_info "cp .env.aws.example .env.production"
    log_info "nano .env.production"
    exit 1
fi

###############################################################################
# 步骤 1: 备份数据库
###############################################################################

log_info "步骤 1/7: 备份数据库..."

BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 检查数据库容器是否运行
if docker-compose ps db | grep -q "Up"; then
    log_info "正在备份数据库到 $BACKUP_FILE"
    docker-compose exec -T db pg_dump -U caleuser cale_exam > "$BACKUP_FILE"
    log_success "数据库备份成功"

    # 保留最近 7 天的备份
    find "$BACKUP_DIR" -name "db_backup_*.sql" -mtime +7 -delete
    log_info "已清理 7 天前的旧备份"
else
    log_warning "数据库容器未运行，跳过备份"
fi

###############################################################################
# 步骤 2: 拉取最新代码
###############################################################################

log_info "步骤 2/7: 拉取最新代码..."

# 保存本地更改（如果有）
if [ -n "$(git status --porcelain)" ]; then
    log_warning "检测到本地更改，将被暂存"
    git stash
fi

# 拉取最新代码
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log_info "当前分支: $CURRENT_BRANCH"

git fetch origin
git pull origin "$CURRENT_BRANCH"

log_success "代码更新成功"

###############################################################################
# 步骤 3: 检查更新
###############################################################################

log_info "步骤 3/7: 检查更新..."

# 显示最近的提交
log_info "最新的 3 个提交："
git log -3 --oneline --decorate

###############################################################################
# 步骤 4: 停止当前应用
###############################################################################

log_info "步骤 4/7: 停止当前应用..."

docker-compose down

log_success "应用已停止"

###############################################################################
# 步骤 5: 清理旧镜像（可选）
###############################################################################

log_info "步骤 5/7: 清理旧 Docker 镜像..."

# 清理未使用的镜像以节省空间
docker image prune -f

log_success "Docker 镜像清理完成"

###############################################################################
# 步骤 6: 重新构建和启动应用
###############################################################################

log_info "步骤 6/7: 重新构建和启动应用..."

# 重新构建镜像（如果 Dockerfile 或依赖有更新）
docker-compose build --no-cache

# 启动所有服务
docker-compose up -d

log_success "应用已启动"

###############################################################################
# 步骤 7: 等待应用就绪
###############################################################################

log_info "步骤 7/7: 等待应用就绪..."

# 等待应用启动（最多等待 60 秒）
TIMEOUT=60
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $TIMEOUT ]; do
    if docker-compose exec -T app node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" 2>/dev/null; then
        log_success "应用启动成功！"
        break
    fi

    log_info "等待应用启动... ($ELAPSED/$TIMEOUT 秒)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    log_error "应用启动超时，请检查日志"
    log_info "查看日志: docker-compose logs -f app"
    exit 1
fi

###############################################################################
# 显示服务状态
###############################################################################

echo ""
log_info "=========================================="
log_info "服务状态："
log_info "=========================================="
docker-compose ps

echo ""
log_info "=========================================="
log_info "应用日志（最后 20 行）："
log_info "=========================================="
docker-compose logs --tail=20 app

echo ""
log_success "=========================================="
log_success "部署完成！"
log_success "=========================================="
echo ""

# 显示访问信息
if [ -f ".env.production" ]; then
    APP_URL=$(grep "^APP_URL=" .env.production | cut -d '=' -f2 | tr -d '"')
    if [ -n "$APP_URL" ]; then
        log_info "应用访问地址: $APP_URL"
    fi
fi

log_info "健康检查: curl http://localhost:3001/api/health"
log_info "查看日志: docker-compose logs -f app"
log_info "重启应用: docker-compose restart app"
log_info "停止应用: docker-compose down"

echo ""
