# 🚀 Vercel + Supabase 完整部署方案

**更新时间**: 2025-10-26
**部署方案**: Vercel (前端+API) + Supabase (PostgreSQL 数据库)
**状态**: ✅ 配置完整，可以立即部署

---

## 📋 目录

1. [方案概述](#方案概述)
2. [准备工作](#准备工作)
3. [Supabase 配置](#supabase-配置)
4. [数据库迁移](#数据库迁移)
5. [Vercel 部署](#vercel-部署)
6. [环境变量配置](#环境变量配置)
7. [部署后验证](#部署后验证)
8. [故障排查](#故障排查)

---

## 🎯 方案概述

### 为什么选择 Vercel + Supabase？

#### ✅ Vercel 优势
- **免费额度充足**: 100GB 带宽/月，100 次构建/天
- **全球 CDN**: 自动分发到全球节点
- **零配置部署**: Git push 自动部署
- **免费 SSL**: 自动 HTTPS
- **Serverless**: 自动扩展
- **完美支持 Nuxt 3**: 官方推荐

#### ✅ Supabase 优势
- **免费 PostgreSQL**: 500MB 数据库 + 1GB 文件存储
- **自动备份**: 每日备份（付费版）
- **全球可访问**: 无需配置安全组
- **实时功能**: 支持实时订阅
- **内置认证**: 可选的用户认证系统
- **REST API**: 自动生成 RESTful API

### 架构图

```
用户浏览器
    ↓
Vercel (全球 CDN)
    ↓
Nuxt 3 应用 (SSR: false, SPA 模式)
    ↓
API 路由 (Serverless Functions)
    ↓
Supabase PostgreSQL (云数据库)
```

### 成本估算

| 服务 | 免费额度 | 预估使用 | 月成本 |
|------|----------|----------|--------|
| Vercel | 100GB 流量 | ~20GB | $0 |
| Supabase | 500MB 数据库 | ~100MB | $0 |
| **总计** | - | - | **$0** |

---

## 🛠️ 准备工作

### 1. 账号注册

- [ ] **Vercel 账号**: https://vercel.com/signup
- [ ] **Supabase 账号**: https://supabase.com/dashboard/sign-up
- [ ] **GitHub 账号**: 已有（`shxld/cale_exam`）

### 2. 本地工具安装

```bash
# Vercel CLI (可选，推荐)
npm i -g vercel

# Supabase CLI (可选，用于本地开发)
brew install supabase/tap/supabase
# 或
npm i -g supabase
```

### 3. 环境检查

```bash
# 检查 Git 状态
git status
git log --oneline -3

# 检查当前配置
cat .env | head -20
```

---

## 📊 Supabase 配置（步骤 1-6）

### 步骤 1: 创建 Supabase 项目

1. **访问 Supabase Dashboard**
   - 🔗 https://supabase.com/dashboard

2. **点击 "New Project"**
   - Organization: 选择或创建组织
   - Project name: `cale-exam` 或你喜欢的名称
   - Database Password: 生成强密码（**务必保存！**）
   - Region: 选择 `Northeast Asia (Tokyo)` 或 `US West (Oregon)`
   - Pricing Plan: Free

3. **等待项目创建**
   - 大约需要 2-3 分钟
   - 状态变为 "Active" 后继续

### 步骤 2: 获取数据库连接信息

1. **进入项目 Settings**
   - 左侧菜单 → Settings → Database

2. **复制连接信息**

**Connection String (URI)**:
```
postgres://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Connection Pooling (推荐用于 Serverless)**:
```
postgres://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

**示例**:
```
postgres://postgres:your_password_here@db.abcdefghijklmnop.supabase.co:6543/postgres?pgbouncer=true&schema=public
```

3. **转换为 Prisma 格式**

```bash
# 原始 Supabase 连接字符串
postgres://postgres:PASSWORD@db.REF.supabase.co:6543/postgres?pgbouncer=true

# Prisma 格式（添加 schema 参数）
postgresql://postgres:PASSWORD@db.REF.supabase.co:6543/postgres?pgbouncer=true&schema=public
```

### 步骤 3: 测试数据库连接

```bash
# 设置环境变量
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:6543/postgres?pgbouncer=true&schema=public"

# 测试连接
npx prisma db pull
```

**成功输出**:
```
✔ Introspected 0 models and wrote them into prisma/schema.prisma
```

### 步骤 4: 推送数据库 Schema

```bash
# 推送 schema 到 Supabase
npx prisma db push

# 查看确认
# 应该看到创建了所有表
```

**预期输出**:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your schema.
```

### 步骤 5: （可选）运行数据库 Seed

```bash
# 填充初始数据
npm run db:seed
```

### 步骤 6: 在 Supabase Dashboard 验证

1. **Table Editor**
   - 左侧菜单 → Table Editor
   - 应该看到所有表（User, Question, Category 等）

2. **SQL Editor** (可选测试)
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

---

## 🔄 数据库迁移（如果从 AWS RDS 迁移）

### 选项 A: 使用 Prisma 迁移（推荐）

```bash
# 1. 导出现有数据库结构
export OLD_DATABASE_URL="postgresql://postgres:Cwren2016!@database-2.cctouc4g4uv3.us-east-1.rds.amazonaws.com:5432/cale_exam?schema=public"

# 2. 设置新的 Supabase URL
export NEW_DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:6543/postgres?pgbouncer=true&schema=public"

# 3. 推送 schema 到新数据库
DATABASE_URL=$NEW_DATABASE_URL npx prisma db push

# 4. （可选）运行 seed
DATABASE_URL=$NEW_DATABASE_URL npm run db:seed
```

### 选项 B: 数据迁移（如果有现有数据）

```bash
# 1. 从旧数据库导出数据
pg_dump $OLD_DATABASE_URL > backup.sql

# 2. 导入到 Supabase
psql $NEW_DATABASE_URL < backup.sql
```

---

## 🚀 Vercel 部署（步骤 7-12）

### 步骤 7: 安装 Vercel CLI（可选）

```bash
npm i -g vercel
vercel login
```

### 步骤 8: 更新 .env 文件

```bash
# 更新为 Supabase 连接
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:6543/postgres?pgbouncer=true&schema=public

# JWT 密钥（已生成）
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559

# 应用配置
NODE_ENV=production
APP_NAME=Cale加州中医考试系统
APP_URL=https://your-project.vercel.app  # 部署后更新
NUXT_PUBLIC_API_BASE=https://your-project.vercel.app  # 部署后更新
```

### 步骤 9: 提交 Supabase 配置

```bash
# 注意：不要提交 .env 文件！
# 只更新 .env.example

# 验证 .env 不在 Git 追踪中
git status | grep .env

# 如果看到 .env，立即忽略
echo ".env" >> .gitignore
```

### 步骤 10: 通过 Vercel Dashboard 部署

#### 方法 A: Vercel Dashboard（推荐）

1. **访问 Vercel Dashboard**
   - 🔗 https://vercel.com/dashboard

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 "Import Git Repository"
   - 选择 GitHub 账号
   - 搜索并选择 `cale_exam`

3. **配置项目**
   - Framework Preset: **Nuxt.js**（自动检测）
   - Root Directory: `./`
   - Build Command: `npm run build`（自动）
   - Output Directory: `.output/public`（自动）

4. **配置环境变量**
   - 展开 "Environment Variables"
   - 添加以下变量：

   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:6543/postgres?pgbouncer=true&schema=public
   JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
   JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
   NODE_ENV=production
   APP_NAME=Cale加州中医考试系统
   ```

5. **点击 "Deploy"**
   - 等待构建完成（约 5-10 分钟）

#### 方法 B: Vercel CLI

```bash
# 链接项目
vercel link

# 设置环境变量
vercel env add DATABASE_URL production
# 粘贴 Supabase 连接字符串

vercel env add JWT_SECRET production
# 粘贴 JWT 密钥

vercel env add JWT_REFRESH_SECRET production
# 粘贴刷新密钥

vercel env add NODE_ENV production
# 输入: production

vercel env add APP_NAME production
# 输入: Cale加州中医考试系统

# 部署到生产环境
vercel --prod
```

### 步骤 11: 获取部署 URL

部署完成后，Vercel 会提供：

- **Production URL**: `https://your-project.vercel.app`
- **也可能是**: `https://cale-exam.vercel.app`

### 步骤 12: 更新 URL 环境变量

1. **在 Vercel Dashboard**
   - Project → Settings → Environment Variables

2. **添加/更新以下变量**:
   ```
   APP_URL=https://your-project.vercel.app
   NUXT_PUBLIC_API_BASE=https://your-project.vercel.app
   ```

3. **重新部署**
   - Deployments → 最新部署 → ... → Redeploy
   - 或推送新的 Git commit

---

## 🔐 环境变量完整清单

### 必需变量

| 变量名 | 值示例 | 说明 |
|--------|--------|------|
| `DATABASE_URL` | `postgresql://postgres:...@db.xxx.supabase.co:6543/...` | Supabase 连接 |
| `JWT_SECRET` | `3e63044708ae9a7229...` | JWT 签名密钥 |
| `JWT_REFRESH_SECRET` | `8ed6d6f3737a4568...` | 刷新令牌密钥 |
| `NODE_ENV` | `production` | 环境标识 |
| `APP_NAME` | `Cale加州中医考试系统` | 应用名称 |
| `APP_URL` | `https://your-project.vercel.app` | 应用 URL |
| `NUXT_PUBLIC_API_BASE` | `https://your-project.vercel.app` | API 基础 URL |

### 可选变量（功能增强）

```bash
# Email 服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-email@gmail.com

# Web Push 通知
VAPID_PUBLIC_KEY=生成的公钥
VAPID_PRIVATE_KEY=生成的私钥
VAPID_SUBJECT=mailto:your-email@domain.com
```

---

## ✅ 部署后验证

### 1. 基本功能测试

访问你的 Vercel URL：

- [ ] **首页加载**: https://your-project.vercel.app
- [ ] **用户注册**: 创建测试账号
- [ ] **用户登录**: 登录测试账号
- [ ] **题目查询**: 浏览题目列表
- [ ] **数据库操作**: 确认数据正常存储

### 2. API 测试

```bash
# 测试健康检查（如果有）
curl https://your-project.vercel.app/api/health

# 测试用户注册
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

### 3. 数据库验证

在 Supabase Dashboard:

1. **Table Editor** → **User** 表
2. 应该看到刚注册的用户

### 4. 监控和日志

#### Vercel 日志
- Dashboard → Project → Deployments → 选择部署 → Function Logs

#### Supabase 日志
- Dashboard → Project → Logs → API Logs

---

## 🐛 故障排查

### 问题 1: 构建失败 - Prisma Client 未生成

**错误**:
```
Cannot find module '@prisma/client'
```

**解决**:
- 检查 `vercel.json` 的 `buildCommand`:
  ```json
  {
    "buildCommand": "npx prisma generate && npm run build"
  }
  ```

### 问题 2: 数据库连接失败

**错误**:
```
Can't reach database server at db.xxx.supabase.co
```

**检查**:
1. DATABASE_URL 是否正确设置
2. 是否包含 `?pgbouncer=true&schema=public`
3. Supabase 项目是否处于 Active 状态

**测试**:
```bash
# 本地测试连接
export DATABASE_URL="你的Supabase URL"
npx prisma db pull
```

### 问题 3: API 路由 404

**原因**: Vercel 可能需要路由配置

**解决**: 检查 `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 问题 4: 环境变量未生效

**检查**:
1. Vercel Dashboard → Settings → Environment Variables
2. 确认变量设置在 "Production" 环境
3. 重新部署

**重新部署**:
```bash
vercel --prod --force
```

### 问题 5: Scheduler 错误（已修复）

如果看到:
```
error: Environment variable not found: DATABASE_URL
```

**确认修复**:
- 检查 `server/plugins/scheduler.ts` 包含预渲染检测
- Git commit 应该是 `c23013b` 或更新

---

## 📊 性能优化

### 1. Supabase 连接池

使用 Connection Pooling（已包含在 URL 中）:
```
?pgbouncer=true
```

### 2. Vercel 边缘缓存

在 API 路由中设置缓存头:
```typescript
export default defineEventHandler((event) => {
  setHeader(event, 'Cache-Control', 's-maxage=60, stale-while-revalidate')
  // ...
})
```

### 3. 数据库索引

确保 Prisma schema 中的索引正确:
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique

  @@index([email])  // 查询优化
}
```

---

## 🔒 安全最佳实践

### 1. 环境变量保护

- ✅ 永远不要提交 `.env` 到 Git
- ✅ 使用强密码（Supabase, JWT）
- ✅ 定期轮换密钥

### 2. 数据库安全

- ✅ 启用 Supabase Row Level Security (RLS)
- ✅ 限制数据库访问权限
- ✅ 启用自动备份（Supabase Pro）

### 3. API 安全

- ✅ 启用 CORS 配置
- ✅ 实施速率限制
- ✅ 验证所有输入

---

## 💰 成本管理

### Vercel 免费额度

- **带宽**: 100GB/月
- **构建时间**: 6000 分钟/月
- **Serverless Functions**: 100GB-小时
- **边缘 Functions**: 500,000 次调用/月

### Supabase 免费额度

- **数据库**: 500MB
- **文件存储**: 1GB
- **带宽**: 2GB/月
- **API 请求**: 无限

### 升级路径

如果超出免费额度:

**Vercel Pro**: $20/月
- 无限带宽
- 更多构建时间

**Supabase Pro**: $25/月
- 8GB 数据库
- 100GB 文件存储
- 每日备份

---

## 📚 相关文档

| 文档 | 链接 |
|------|------|
| Vercel 文档 | https://vercel.com/docs |
| Supabase 文档 | https://supabase.com/docs |
| Nuxt on Vercel | https://vercel.com/docs/frameworks/nuxt |
| Prisma with Supabase | https://www.prisma.io/docs/guides/database/supabase |

---

## ✅ 部署检查清单

### Supabase 设置
- [ ] Supabase 项目已创建
- [ ] 数据库密码已保存
- [ ] 连接字符串已获取
- [ ] Schema 已推送（`npx prisma db push`）
- [ ] 数据库表已验证

### Vercel 设置
- [ ] Vercel 账号已创建
- [ ] GitHub 仓库已连接
- [ ] 环境变量已配置
- [ ] 首次部署已完成
- [ ] URL 已获取并更新环境变量

### 功能验证
- [ ] 应用可以访问
- [ ] 用户注册/登录正常
- [ ] 数据库读写正常
- [ ] API 路由工作正常
- [ ] 无控制台错误

---

## 🎯 快速命令参考

```bash
# Supabase 相关
export DATABASE_URL="postgresql://..."  # 设置数据库 URL
npx prisma db push                      # 推送 schema
npx prisma studio                       # 打开数据库 GUI
npm run db:seed                         # 填充测试数据

# Vercel 相关
vercel login                            # 登录 Vercel
vercel link                             # 链接项目
vercel env add VAR_NAME production      # 添加环境变量
vercel env ls                           # 列出环境变量
vercel                                  # 预览部署
vercel --prod                           # 生产部署
vercel logs                             # 查看日志

# Git 相关
git status                              # 检查状态
git add .                               # 暂存更改
git commit -m "message"                 # 提交
git push origin main                    # 推送（触发 Vercel 自动部署）
```

---

## 🚀 准备就绪！

### 部署时间估算

- **Supabase 设置**: 10-15 分钟
- **数据库 Schema 推送**: 2-3 分钟
- **Vercel 首次部署**: 5-10 分钟
- **验证和测试**: 5-10 分钟
- **总计**: 约 30-40 分钟

### 成功率

**极高** ✅
- Vercel + Supabase 是成熟的技术栈
- 配置简单明了
- 社区支持丰富

---

**开始部署吧！** 🎉

**下一步**: 按照本文档从 "Supabase 配置" 部分开始执行
