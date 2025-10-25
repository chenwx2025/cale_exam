# 部署指南

## 前提条件

- Node.js 18+ 
- PostgreSQL 数据库
- PM2 (进程管理器)

```bash
npm install -g pm2
```

## 1. 环境准备

### 复制环境变量模板
```bash
cp .env.example .env
```

### 编辑 .env 文件
```bash
nano .env
```

必须设置的变量：
- `DATABASE_URL`: PostgreSQL 连接字符串
- `JWT_SECRET`: JWT 密钥（至少 32 字符）
- `JWT_REFRESH_SECRET`: 刷新令牌密钥
- `OPENAI_API_KEY`: OpenAI API 密钥（用于 AI 功能）

可选变量（用于邮件通知）：
- `SMTP_*`: 邮件服务器配置

## 2. 数据库设置

### 生成 Prisma Client
```bash
npx prisma generate
```

### 执行数据库迁移
```bash
# 生产环境使用
npx prisma migrate deploy

# 或者开发/测试环境使用
npx prisma db push
```

### 创建初始管理员用户（如果需要）
```bash
node scripts/create-admin.js
```

## 3. 构建应用

```bash
# 安装依赖
npm install --production=false

# 构建
npm run build
```

构建完成后，生成的文件在 `.output` 目录。

## 4. 启动应用

### 使用 PM2（推荐）

```bash
# 首次启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs cale-exam

# 重启
pm2 restart cale-exam

# 停止
pm2 stop cale-exam

# 开机自启
pm2 startup
pm2 save
```

### 直接启动（不推荐生产环境）

```bash
node .output/server/index.mjs
```

## 5. Nginx 配置（可选）

如果使用 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location /_nuxt/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 6. SSL 配置（推荐）

使用 Certbot 自动配置 SSL：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 7. 监控和日志

### PM2 监控
```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs cale-exam --lines 100

# 日志文件位置
logs/out.log  # 标准输出
logs/err.log  # 错误输出
```

### 数据库备份
```bash
# 手动备份
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 自动备份（添加到 crontab）
0 2 * * * pg_dump $DATABASE_URL > /backups/db_$(date +\%Y\%m\%d).sql
```

## 8. 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖
npm install

# 3. 运行数据库迁移
npx prisma migrate deploy

# 4. 重新构建
npm run build

# 5. 重启应用
pm2 restart cale-exam

# 6. 查看日志确认
pm2 logs cale-exam
```

## 9. 故障排查

### 应用无法启动
```bash
# 查看错误日志
pm2 logs cale-exam --err

# 检查端口占用
lsof -i :3000

# 检查数据库连接
npx prisma db pull
```

### 性能问题
```bash
# 查看进程资源使用
pm2 monit

# 查看系统资源
htop
```

## 10. 安全建议

1. **定期更新依赖**
   ```bash
   npm audit
   npm audit fix
   ```

2. **限制访问**
   - 配置防火墙只开放必要端口
   - 使用强密码和密钥
   - 定期更换 JWT 密钥

3. **备份策略**
   - 每日自动备份数据库
   - 定期备份代码和配置
   - 保留至少 7 天的备份

4. **监控告警**
   - 设置应用监控（如 PM2 Plus）
   - 配置错误告警
   - 监控服务器资源使用

## 常见问题

### Q: 构建失败
A: 检查 Node.js 版本是否 >= 18，清理缓存后重试：
```bash
rm -rf node_modules .nuxt .output
npm install
npm run build
```

### Q: 数据库连接失败
A: 检查 DATABASE_URL 格式，确认数据库服务运行中。

### Q: 页面 404
A: 确认应用已正确启动，检查 Nginx 配置是否正确。

---

**需要帮助?** 查看日志或联系技术支持。
