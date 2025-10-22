# 🚀 Cale 加州中医考试系统 - 部署指南

## 📋 目录
1. [部署前准备](#部署前准备)
2. [环境配置](#环境配置)
3. [构建项目](#构建项目)
4. [部署选项](#部署选项)
5. [数据库迁移](#数据库迁移)
6. [域名和SSL配置](#域名和ssl配置)
7. [监控和维护](#监控和维护)

---

## 部署前准备

### ✅ 检查清单
- [ ] 所有功能测试完成
- [ ] 数据库备份已完成
- [ ] 环境变量已配置
- [ ] 生产数据库已准备
- [ ] 域名已注册（如需要）
- [ ] SSL证书已准备（推荐 Let's Encrypt）

### 📦 系统要求
- **Node.js**: 18.x 或更高版本
- **数据库**: PostgreSQL 14+ (推荐) 或 SQLite
- **内存**: 最低 512MB，推荐 1GB+
- **存储**: 最低 1GB 可用空间

---

## 环境配置

### 1. 创建生产环境变量文件

创建 `.env.production` 文件：

```bash
# 数据库配置（生产环境使用PostgreSQL）
DATABASE_URL="postgresql://username:password@host:5432/cale_exam?schema=public"

# 应用配置
NODE_ENV="production"
PORT=3001

# JWT 密钥（必须修改为强密码）
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars-long-change-this"

# 管理员密码（必须修改）
ADMIN_PASSWORD="your-secure-admin-password"

# 应用URL（修改为你的域名）
APP_URL="https://yourdomain.com"

# 邮件配置（可选，用于通知功能）
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Web Push 通知配置（可选）
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@gmail.com"

# 日志级别
LOG_LEVEL="info"
```

### 2. 安全注意事项

⚠️ **重要**：确保以下配置项已修改：
- `JWT_SECRET`: 使用至少32位的随机字符串
- `ADMIN_PASSWORD`: 使用强密码
- 永远不要将 `.env.production` 提交到 Git

---

## 构建项目

### 方法一：标准构建（推荐用于VPS/云服务器）

```bash
# 1. 停止开发服务器
# 按 Ctrl+C 停止 npm run dev

# 2. 安装生产依赖
npm ci --production=false

# 3. 生成 Prisma Client
npx prisma generate

# 4. 构建项目
npm run build

# 5. 启动生产服务器
NODE_ENV=production node .output/server/index.mjs
```

### 方法二：静态生成（适用于静态托管）

```bash
# 生成静态站点
npm run generate

# 输出目录: .output/public
# 可直接部署到 Netlify, Vercel, GitHub Pages 等
```

---

## 部署选项

### 选项 1: Vercel（最简单，推荐）

Vercel 完美支持 Nuxt 3，零配置部署。

#### 步骤：

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署**
```bash
# 首次部署
vercel

# 生产部署
vercel --prod
```

4. **配置环境变量**
在 Vercel Dashboard 中添加环境变量：
- Settings → Environment Variables
- 添加所有 `.env.production` 中的变量

5. **配置数据库**
- 推荐使用 Vercel Postgres 或 Supabase
- 更新 `DATABASE_URL`

#### 配置文件（可选）

创建 `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nuxtjs",
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

### 选项 2: Netlify

1. **安装 Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **登录并部署**
```bash
netlify login
netlify init
netlify deploy --prod
```

3. **配置文件**

创建 `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 选项 3: Docker 容器部署

#### 1. 创建 Dockerfile

创建 `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci --production=false

# 生成 Prisma Client
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", ".output/server/index.mjs"]
```

#### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/cale_exam
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cale_exam
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. 构建和运行

```bash
# 构建镜像
docker-compose build

# 运行数据库迁移
docker-compose run app npx prisma db push

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

### 选项 4: VPS/云服务器（Ubuntu/Debian）

#### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装 PM2（进程管理器）
sudo npm install -g pm2
```

#### 2. 创建数据库

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE cale_exam;
CREATE USER caleuser WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cale_exam TO caleuser;
\q
```

#### 3. 部署应用

```bash
# 克隆代码（或上传）
cd /var/www
git clone your-repo-url cale_exam
cd cale_exam

# 安装依赖
npm ci --production=false

# 配置环境变量
nano .env.production

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma db push

# 构建应用
npm run build

# 使用 PM2 启动
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 4. 创建 PM2 配置文件

创建 `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'cale-exam',
    script: '.output/server/index.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

#### 5. 配置 Nginx 反向代理

```bash
sudo apt install -y nginx
```

创建 Nginx 配置 `/etc/nginx/sites-available/cale-exam`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/cale-exam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 数据库迁移

### 从 SQLite 迁移到 PostgreSQL

#### 1. 导出 SQLite 数据

```bash
# 安装 pgloader（Ubuntu/Debian）
sudo apt install -y pgloader

# 迁移数据
pgloader dev.db postgresql://username:password@host:5432/cale_exam
```

#### 2. 或者使用 Prisma

```bash
# 备份当前数据（使用 prisma studio 导出 CSV）

# 更新 DATABASE_URL 到 PostgreSQL

# 推送 schema
npx prisma db push

# 重新导入数据
```

---

## 域名和SSL配置

### 使用 Let's Encrypt（免费SSL）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期（Certbot 会自动设置 cron job）
sudo certbot renew --dry-run
```

### DNS 配置

在你的域名注册商处添加 A 记录：
```
A    @              your-server-ip
A    www            your-server-ip
```

---

## 监控和维护

### PM2 监控命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs cale-exam

# 重启应用
pm2 restart cale-exam

# 停止应用
pm2 stop cale-exam

# 监控面板
pm2 monit
```

### 数据库备份

```bash
# 创建备份脚本
cat > /usr/local/bin/backup-cale-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/cale-exam"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# PostgreSQL 备份
pg_dump -U caleuser cale_exam > $BACKUP_DIR/backup_$DATE.sql

# 保留最近30天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-cale-db.sh

# 添加到 crontab（每天凌晨2点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-cale-db.sh") | crontab -
```

### 日志管理

```bash
# 配置日志轮转
sudo nano /etc/logrotate.d/cale-exam
```

```
/var/www/cale_exam/.output/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

---

## 🎯 快速部署命令汇总

### Vercel 一键部署
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Docker 一键部署
```bash
docker-compose up -d
docker-compose run app npx prisma db push
```

### VPS 完整部署
```bash
# 1. 准备服务器
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs postgresql nginx
sudo npm install -g pm2

# 2. 部署应用
cd /var/www/cale_exam
npm ci --production=false
npx prisma generate
npx prisma db push
npm run build
pm2 start ecosystem.config.js --env production
pm2 save

# 3. 配置 SSL
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 故障排查

### 应用无法启动
```bash
# 检查日志
pm2 logs cale-exam

# 检查端口占用
sudo lsof -i :3001

# 检查环境变量
pm2 env 0
```

### 数据库连接失败
```bash
# 测试数据库连接
npx prisma db pull

# 检查 PostgreSQL 状态
sudo systemctl status postgresql
```

### Nginx 配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 获取帮助

- **文档**: [Nuxt 3 Deployment](https://nuxt.com/docs/getting-started/deployment)
- **Prisma**: [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- **Issues**: 项目 GitHub Issues

---

## ✅ 部署后检查清单

- [ ] 应用可以正常访问
- [ ] SSL 证书正常工作（HTTPS）
- [ ] 数据库连接正常
- [ ] 用户可以注册/登录
- [ ] 考试功能正常
- [ ] 管理后台可访问
- [ ] 邮件通知正常（如启用）
- [ ] 移动端响应正常
- [ ] 备份脚本运行正常
- [ ] 监控工具配置完成

---

祝部署顺利！🎉
