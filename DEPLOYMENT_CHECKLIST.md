# Vercel 部署检查清单 ✅

## 📋 部署前检查

### 1. 数据库配置
- [x] Schema 已更新为 PostgreSQL（[prisma/schema.prisma](prisma/schema.prisma:9)）
- [ ] 有 AWS PostgreSQL 连接字符串
- [ ] AWS RDS 安全组已配置（允许外部连接）
- [ ] 数据库可公开访问或配置了 VPC

### 2. 环境变量准备
准备以下环境变量：

#### 必需变量
- [ ] `DATABASE_URL` - AWS PostgreSQL 连接字符串
- [ ] `JWT_SECRET` - 至少32位随机字符串
- [ ] `JWT_REFRESH_SECRET` - 至少32位随机字符串
- [ ] `NUXT_PUBLIC_API_BASE` - Vercel 应用 URL
- [ ] `NODE_ENV` - 设为 "production"

#### 可选变量
- [ ] `OPENAI_API_KEY` - 如果使用 AI 功能
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - 邮件服务
- [ ] `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` - Web Push 通知

### 3. Vercel 配置文件
- [x] [vercel.json](vercel.json) 已优化
- [x] [.vercelignore](.vercelignore) 已创建
- [x] Build command 包含 `prisma generate`

### 4. 本地测试（可选）
```bash
# 使用 AWS 数据库 URL 本地测试
export DATABASE_URL="你的AWS数据库URL"
npx prisma generate
npm run build
```

---

## 🚀 部署步骤

### Step 1: 安装 Vercel CLI

```bash
npm i -g vercel
vercel login
```

### Step 2: 配置环境变量

**方法 A: 使用命令行**
```bash
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add NUXT_PUBLIC_API_BASE production
vercel env add NODE_ENV production
```

**方法 B: 使用 Vercel Dashboard**
1. 访问 https://vercel.com/dashboard
2. 选择项目 → Settings → Environment Variables
3. 添加所有必需的环境变量

### Step 3: 首次部署

```bash
# 预览部署（测试）
vercel

# 检查是否正常工作，然后部署到生产
vercel --prod
```

---

## ✅ 部署后验证

### 1. 基本功能测试
- [ ] 应用首页加载正常
- [ ] 静态资源加载正常（CSS, JS, 图片）
- [ ] API 路由响应正常

### 2. 数据库连接测试
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 数据查询功能
- [ ] 数据创建功能

### 3. 检查日志
```bash
# 查看构建日志
vercel logs --type=build

# 查看运行时日志
vercel logs --type=runtime --follow
```

或在 Vercel Dashboard:
- Deployments → 选择部署 → Logs

### 4. 性能检查
- [ ] 首屏加载时间 < 3秒
- [ ] API 响应时间合理
- [ ] 无明显错误或警告

---

## 🐛 常见问题排查

### 问题 1: 数据库连接失败

**检查清单**:
- [ ] DATABASE_URL 格式正确
- [ ] AWS 安全组允许入站 5432 端口
- [ ] RDS 实例状态为 "Available"
- [ ] 用户名密码正确
- [ ] 数据库名称正确

**测试连接**:
```bash
# 使用 psql 测试
psql "postgresql://user:pass@host:5432/database"

# 或使用 Prisma
npx prisma db pull
```

### 问题 2: Prisma Client 未找到

**解决方案**:
- [ ] 检查 vercel.json buildCommand 包含 `prisma generate`
- [ ] 重新部署：`vercel --prod --force`

### 问题 3: 环境变量未生效

**检查**:
- [ ] 环境变量名拼写正确
- [ ] 设置在正确的环境（Production）
- [ ] 重新部署应用

### 问题 4: API 路由 500 错误

**调试**:
```bash
# 查看详细错误
vercel logs --follow
```

---

## 📊 部署后优化

### 1. 性能优化
- [ ] 启用 Vercel Analytics
- [ ] 配置缓存策略
- [ ] 优化图片加载
- [ ] 使用 CDN

### 2. 安全加固
- [ ] 限制 AWS 数据库访问 IP
- [ ] 使用强密码
- [ ] 启用数据库 SSL
- [ ] 配置 CORS 策略
- [ ] 设置速率限制

### 3. 监控设置
- [ ] 配置错误告警
- [ ] 设置正常运行时间监控
- [ ] 启用日志保留

### 4. 备份策略
- [ ] 启用 AWS RDS 自动备份
- [ ] 配置备份保留期
- [ ] 测试恢复流程

---

## 📚 有用的命令

```bash
# 部署相关
vercel                    # 预览部署
vercel --prod            # 生产部署
vercel --force           # 强制重新部署

# 环境变量
vercel env ls            # 列出所有环境变量
vercel env add           # 添加环境变量
vercel env rm            # 删除环境变量

# 日志和调试
vercel logs              # 查看日志
vercel logs --follow     # 实时查看日志
vercel inspect           # 检查部署详情

# 项目管理
vercel list              # 列出所有部署
vercel remove            # 删除部署
vercel domains           # 管理域名

# 数据库
npx prisma generate      # 生成 Prisma Client
npx prisma db push       # 推送 schema 到数据库
npx prisma studio        # 打开数据库 GUI
```

---

## 🎯 下一步行动

部署成功后：

1. **设置自定义域名**
   - Vercel Dashboard → Settings → Domains
   - 添加你的域名并配置 DNS

2. **配置 SSL（自动）**
   - Vercel 自动提供免费 SSL 证书

3. **设置团队协作**
   - Settings → Team
   - 邀请团队成员

4. **配置 CI/CD**
   - 连接 GitHub 仓库
   - 自动部署 push/PR

5. **监控和分析**
   - 启用 Vercel Analytics
   - 配置告警通知

---

## 📞 需要帮助？

- **详细指南**: [VERCEL_AWS_DEPLOYMENT.md](VERCEL_AWS_DEPLOYMENT.md)
- **快速参考**: [VERCEL_QUICKSTART.md](VERCEL_QUICKSTART.md)
- **Vercel 文档**: https://vercel.com/docs
- **Vercel 支持**: https://vercel.com/support

---

**准备好了就开始部署吧！** 🚀
