# Vercel 快速部署指南 🚀

## ✅ 你的项目状态

- ✅ 已配置 PostgreSQL（AWS）
- ✅ Vercel 配置已优化
- ✅ Schema 已更新

**现在只需要配置环境变量即可部署！**

---

## 🎯 快速部署 3 步骤

### 步骤 1: 准备 AWS PostgreSQL 连接信息

获取你的 AWS RDS PostgreSQL 连接信息：

```bash
# 连接字符串格式
postgresql://username:password@host:5432/database?schema=public

# 示例
postgresql://postgres:mypass@my-db.us-east-1.rds.amazonaws.com:5432/cale_exam?schema=public
```

**重要**: 确保 AWS RDS 安全组允许 Vercel 连接
- 临时测试：允许所有 IP `0.0.0.0/0` 端口 `5432`
- 生产环境：参考 Vercel IP 地址列表

### 步骤 2: 生成 JWT 密钥

```bash
# 生成两个不同的密钥（至少32位）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 3: 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署（首次会自动链接项目）
vercel --prod
```

在部署过程中，Vercel 会提示你设置环境变量。**至少需要设置 `DATABASE_URL`**。

---

## 🔑 必需的环境变量

在 Vercel Dashboard → Settings → Environment Variables 添加：

```bash
# 数据库（必需）
DATABASE_URL="postgresql://..."

# JWT 密钥（必需）- 生成强密码
JWT_SECRET="至少32位的随机字符串"
JWT_REFRESH_SECRET="至少32位的随机字符串"

# 应用 URL（必需）
NUXT_PUBLIC_API_BASE="https://your-app.vercel.app"
```

### 生成安全的 JWT 密钥：

```bash
# 方法 1: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法 2: 使用 OpenSSL
openssl rand -hex 32
```

---

## 📝 可选环境变量

```bash
# OpenAI (AI 功能)
OPENAI_API_KEY="sk-..."

# Email (通知功能)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="app-password"
SMTP_FROM="your@email.com"

# Web Push (浏览器通知)
# 生成: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:your@email.com"
```

---

## ✅ 部署后检查清单

- [ ] 访问你的 Vercel 部署 URL
- [ ] 检查首页能否正常加载
- [ ] 测试用户注册/登录
- [ ] 测试 API 路由（如 /api/auth/login）
- [ ] 检查 Vercel Logs 没有错误
- [ ] 测试数据库操作（创建数据、查询数据）

---

## 🐛 常见问题

### 1. 构建失败：找不到 Prisma Client

**解决方案**: [vercel.json](vercel.json:2) 已配置 `buildCommand`，确保包含 `prisma generate`

### 2. 运行时错误：数据库连接失败

**检查**:
- DATABASE_URL 环境变量是否正确设置
- PostgreSQL 数据库是否在线
- 连接字符串格式是否正确

### 3. 页面 404 错误

**可能原因**:
- 检查 [nuxt.config.ts](nuxt.config.ts:5) 的 `ssr: false` 设置
- 检查路由配置
- 查看 Vercel 构建日志

### 4. API 路由 500 错误

**调试步骤**:
```bash
# 查看实时日志
vercel logs --follow

# 或在 Vercel Dashboard 查看
# Project → Deployments → 选择部署 → Runtime Logs
```

---

## 📚 有用的命令

```bash
# 查看部署日志
vercel logs

# 查看环境变量
vercel env ls

# 添加环境变量
vercel env add DATABASE_URL

# 删除部署
vercel remove

# 预览部署（测试环境）
npm run vercel:preview

# 生产部署
npm run vercel:deploy

# 本地开发
npm run dev

# 查看 Prisma Studio（数据库 GUI）
npm run db:studio
```

---

## 🔗 快速链接

- [Vercel Dashboard](https://vercel.com/dashboard)
- [部署文档](./VERCEL_DEPLOYMENT.md) - 详细说明
- [环境变量示例](.env.example)
- [Vercel 文档](https://vercel.com/docs)
- [Nuxt on Vercel](https://vercel.com/docs/frameworks/nuxt)

---

## 🆘 需要帮助？

1. 查看 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 详细文档
2. 检查 Vercel Dashboard 的 Runtime Logs
3. 运行 `vercel logs` 查看错误
4. 访问 Vercel 社区: https://github.com/vercel/vercel/discussions

---

**祝部署顺利！** 🎉
