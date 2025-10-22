# ============================================
# Cale 加州中医考试系统 - Docker 部署配置
# ============================================
#
# 构建命令:
#   docker build -t cale-exam .
#
# 运行命令:
#   docker run -p 3001:3001 --env-file .env.production cale-exam
#
# 或使用 docker-compose:
#   docker-compose up -d
#
# ============================================

# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache \
    openssl \
    libc6-compat

# ============================================
# 依赖安装阶段
# ============================================
FROM base AS deps

WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# 安装依赖（包括开发依赖，用于构建）
RUN npm ci --production=false

# 生成 Prisma Client
RUN npx prisma generate

# ============================================
# 构建阶段
# ============================================
FROM base AS builder

WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 删除开发依赖
RUN npm ci --production && \
    npm cache clean --force

# ============================================
# 生产运行阶段
# ============================================
FROM base AS runner

WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# 复制构建产物
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nuxtjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./

# 创建必要的目录
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nuxtjs:nodejs /app/logs /app/uploads

# 切换到非 root 用户
USER nuxtjs

# 暴露端口
EXPOSE 3001

# 设置环境变量
ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["node", ".output/server/index.mjs"]
