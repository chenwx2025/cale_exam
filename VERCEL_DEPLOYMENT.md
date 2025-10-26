# Vercel 部署指南

## ⚠️ 重要：数据库迁移

**当前项目使用 SQLite，但 Vercel 不支持 SQLite！**

你需要先迁移到支持的数据库：

### 推荐选项 1: Vercel Postgres（推荐）

1. 在 Vercel 项目中添加 Postgres 数据库
2. 获取 `POSTGRES_PRISMA_URL` 连接字符串
3. 更新 `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 推荐选项 2: Neon（免费且简单）

1. 访问 [neon.tech](https://neon.tech)
2. 创建免费数据库
3. 获取连接字符串
4. 同样更新 schema.prisma

### 推荐选项 3: Supabase

1. 访问 [supabase.com](https://supabase.com)
2. 创建项目
3. 获取 PostgreSQL 连接字符串

## 📋 Vercel 环境变量配置

在 Vercel Dashboard 的 Settings → Environment Variables 中添加以下变量：

### 必需的环境变量

```bash
# 数据库连接（使用上面选择的数据库）
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT 密钥（生成强密码，至少32位）
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-min-32-chars"

# 应用配置
NODE_ENV="production"
NUXT_PUBLIC_API_BASE="https://your-domain.vercel.app"
```

### 可选的环境变量

```bash
# OpenAI API（如果使用 AI 功能）
OPENAI_API_KEY="sk-your-openai-api-key"

# Email 服务（邮件通知功能）
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="your-email@gmail.com"

# Web Push 通知
# 生成方法: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@domain.com"
```

## 🚀 部署步骤

### 1. 准备数据库

首先选择并配置数据库（见上面的数据库迁移部分）

### 2. 更新 Prisma Schema

编辑 `prisma/schema.prisma`，将 SQLite 改为 PostgreSQL：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. 连接到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 链接项目
vercel link
```

### 4. 设置环境变量

```bash
# 方式1: 使用 Vercel CLI
vercel env add DATABASE_URL

# 方式2: 在 Vercel Dashboard 中手动添加
# https://vercel.com/your-team/your-project/settings/environment-variables
```

### 5. 初始化数据库

在部署前，在本地运行（使用生产数据库 URL）：

```bash
# 设置生产数据库 URL
export DATABASE_URL="your-production-database-url"

# 推送 schema 到生产数据库
npx prisma db push

# 或使用迁移（推荐）
npx prisma migrate deploy

# 可选：seed 初始数据
npm run db:seed
```

### 6. 部署到 Vercel

```bash
# 预览部署（测试）
vercel

# 生产部署
vercel --prod
```

## 🔧 配置说明

### vercel.json 配置

已配置以下功能：
- ✅ 自动运行 Prisma generate
- ✅ 安全 HTTP 头部
- ✅ API 路由缓存控制
- ✅ 日本东京区域（hnd1）

### Nuxt 配置

当前配置：
- ✅ SSR 已禁用（适合 Vercel）
- ✅ 代码分割和优化
- ✅ 图片优化
- ✅ 路由规则和缓存

## 📊 部署后检查清单

- [ ] 数据库连接正常
- [ ] 环境变量全部配置
- [ ] Prisma 迁移/推送成功
- [ ] API 路由正常工作
- [ ] 认证功能正常
- [ ] 邮件发送功能正常（如启用）
- [ ] 文件上传功能正常

## 🐛 常见问题

### 1. Prisma Client 未生成

**解决方案**：确保 `buildCommand` 包含 `npx prisma generate`

### 2. 数据库连接失败

**检查**：
- DATABASE_URL 是否正确设置
- 数据库是否允许 Vercel IP 访问
- PostgreSQL 连接字符串格式是否正确

### 3. 环境变量未生效

**解决方案**：
- 确保在 Vercel Dashboard 中正确设置
- 重新部署项目
- 检查变量名是否有前缀要求（如 `NUXT_PUBLIC_`）

### 4. 文件上传问题

Vercel 无服务器环境不支持持久化文件存储。需要使用：
- Vercel Blob Storage
- AWS S3
- Cloudinary
- UploadThing

## 📚 相关资源

- [Vercel Nuxt 文档](https://vercel.com/docs/frameworks/nuxt)
- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## 🔒 安全建议

1. **永远不要**将密钥提交到 Git
2. 使用强随机密钥（至少 32 位）
3. 定期轮换 JWT 密钥
4. 启用 Vercel 的认证保护
5. 配置 CORS 规则
6. 启用速率限制

## 📞 获取帮助

如遇问题：
1. 检查 Vercel 部署日志
2. 查看 Runtime Logs
3. 使用 `vercel logs` 命令
4. 访问 Vercel 社区论坛
