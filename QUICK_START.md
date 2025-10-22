# 🚀 快速上线指南

## 最快速的部署方式 - Vercel（推荐新手）

### 1. 准备工作（5分钟）

```bash
# 1. 确保代码已提交到 Git
git add .
git commit -m "准备部署"

# 2. 推送到 GitHub
git push origin main
```

### 2. Vercel 一键部署（3分钟）

1. 访问 [Vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的仓库 `cale_exam`
5. 点击 "Deploy" - **就这么简单！**

### 3. 配置数据库（5分钟）

Vercel 部署后，需要配置数据库：

#### 选项 A: 使用 Vercel Postgres（最简单）

1. 在 Vercel 项目页面，点击 "Storage"
2. 点击 "Create Database" → 选择 "Postgres"
3. 复制提供的 `DATABASE_URL`
4. 在 Vercel 项目设置中添加环境变量：
   - Settings → Environment Variables
   - 添加 `DATABASE_URL` = [你复制的连接字符串]

#### 选项 B: 使用 Supabase（免费）

1. 访问 [Supabase.com](https://supabase.com)
2. 创建新项目
3. 获取数据库连接字符串：Settings → Database → Connection string
4. 在 Vercel 添加环境变量 `DATABASE_URL`

### 4. 添加必要的环境变量

在 Vercel 项目设置中添加：

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-random-32-char-string
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
```

### 5. 重新部署

在 Vercel Deployments 页面点击 "Redeploy"

### ✅ 完成！

访问 Vercel 提供的 URL（如 `https://cale-exam.vercel.app`）即可使用！

---

## 稍微复杂但更灵活 - Docker 部署

### 前提条件
- 已安装 Docker 和 Docker Compose
- 有一台服务器（可以是本地电脑、VPS 或云服务器）

### 一键部署（10分钟）

```bash
# 1. 复制环境变量文件
cp .env.production.example .env.production

# 2. 编辑环境变量（至少修改密码）
nano .env.production
# 修改:
# - DB_PASSWORD
# - JWT_SECRET
# - ADMIN_PASSWORD

# 3. 启动所有服务
docker-compose up -d

# 4. 查看日志确认启动成功
docker-compose logs -f

# 5. 运行数据库迁移
docker-compose exec app npx prisma db push

# ✅ 完成！访问 http://localhost:3001
```

### 管理命令

```bash
# 查看运行状态
docker-compose ps

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f app

# 备份数据库
docker-compose exec db pg_dump -U caleuser cale_exam > backup.sql

# 进入应用容器
docker-compose exec app sh
```

---

## 传统 VPS 部署（适合有服务器经验的用户）

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt install -y nginx
```

### 2. 配置数据库

```bash
# 创建数据库
sudo -u postgres psql
```

```sql
CREATE DATABASE cale_exam;
CREATE USER caleuser WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cale_exam TO caleuser;
\q
```

### 3. 部署应用

```bash
# 克隆代码
cd /var/www
git clone your-repo-url cale_exam
cd cale_exam

# 复制并编辑环境变量
cp .env.production.example .env.production
nano .env.production

# 运行部署脚本
./scripts/deploy.sh production

# ✅ 完成！
```

### 4. 配置 Nginx

创建 `/etc/nginx/sites-available/cale-exam`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/cale-exam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 安装 SSL 证书
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 部署后检查

访问以下 URL 确认部署成功：

1. **首页**: `http://your-domain.com`
2. **健康检查**: `http://your-domain.com/api/health`
3. **登录**: `http://your-domain.com/login`
4. **管理后台**: `http://your-domain.com/admin`

---

## 🆘 遇到问题？

### 常见问题

**Q: 访问网站显示 502 Bad Gateway**
A: 检查应用是否正常运行：
```bash
# Docker
docker-compose logs app

# PM2
pm2 logs cale-exam

# 检查端口
sudo lsof -i :3001
```

**Q: 数据库连接失败**
A: 检查 `DATABASE_URL` 是否正确，数据库服务是否运行：
```bash
# PostgreSQL
sudo systemctl status postgresql

# Docker
docker-compose ps db
```

**Q: 无法登录管理后台**
A: 确认 `ADMIN_PASSWORD` 环境变量已设置，尝试重启服务。

---

## 📞 获取帮助

- 查看完整文档: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- GitHub Issues: 提交问题获取帮助

---

## ✨ 部署成功后的下一步

1. ✅ 修改管理员密码
2. ✅ 配置 SSL 证书（HTTPS）
3. ✅ 设置自动备份
4. ✅ 配置域名
5. ✅ 添加考试题目
6. ✅ 邀请用户注册

祝你部署顺利！🎉
