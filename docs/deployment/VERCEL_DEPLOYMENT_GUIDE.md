# Vercel 部署完整指南

## 🎯 为什么选择 Vercel？

- ✅ **完美支持 Nuxt SSR** - 零配置
- ✅ **完全免费** - 慷慨的免费层
- ✅ **5 分钟部署** - 最快的部署方式
- ✅ **自动 CI/CD** - git push 即部署
- ✅ **全球 CDN** - 极快的访问速度
- ✅ **自动 SSL** - HTTPS 自动配置

## 📋 前提准备

### 1. 准备数据库（推荐 Supabase）

您需要一个 PostgreSQL 数据库。推荐使用 **Supabase 免费层**：

**步骤**:
1. 访问 [supabase.com](https://supabase.com)
2. 注册/登录账户
3. 点击 "New project"
4. 填写项目信息：
   - Name: `cale-exam`
   - Database Password: **设置强密码（记下来！）**
   - Region: 选择 `Northeast Asia (Tokyo)` 或最近的区域
5. 等待 2-3 分钟创建完成

**获取数据库连接字符串**:
1. 项目创建完成后，点击左侧 **Settings** (齿轮图标)
2. 点击 **Database**
3. 找到 **Connection string** 部分
4. 选择 **URI** 标签
5. 复制连接字符串（格式类似）：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. 将 `[YOUR-PASSWORD]` 替换为您设置的数据库密码

**示例**:
```bash
# 原始格式
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefgh.supabase.co:5432/postgres

# 替换密码后（假设密码是 MySecretPass123）
postgresql://postgres:MySecretPass123@db.abcdefgh.supabase.co:5432/postgres
```

### 2. 准备环境变量

您需要以下环境变量（已经为您生成好了）：

```bash
# 数据库连接
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# JWT 密钥（使用下面已生成的）
JWT_SECRET=bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb
JWT_REFRESH_SECRET=725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13

# OpenAI API（用于 AI 功能）
OPENAI_API_KEY=sk-your-openai-api-key-here

# 环境标识
NODE_ENV=production
```

**获取 OpenAI API Key**:
1. 访问 [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 登录/注册账户
3. 点击 "Create new secret key"
4. 复制密钥（格式：`sk-...`）

### 3. Git 仓库准备

确保您的代码已推送到 GitHub/GitLab/Bitbucket：

```bash
# 检查 Git 状态
git status

# 如果有未提交的更改
git add .
git commit -m "准备 Vercel 部署"
git push origin main
```

---

## 🚀 部署步骤（两种方式）

### 方式 1: 使用 Vercel CLI（推荐 - 最快）⭐

#### 步骤 1: 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 步骤 2: 登录 Vercel

```bash
vercel login
```

会打开浏览器，选择登录方式：
- GitHub（推荐）
- GitLab
- Bitbucket
- Email

#### 步骤 3: 部署项目

在项目根目录执行：

```bash
vercel
```

**交互式问题回答**:

```
? Set up and deploy "~/cale_exam"? [Y/n]
→ 输入: Y

? Which scope do you want to deploy to?
→ 选择您的账户

? Link to existing project? [y/N]
→ 输入: N （第一次部署）

? What's your project's name?
→ 输入: cale-exam （或您喜欢的名称）

? In which directory is your code located?
→ 直接回车（默认 ./）

? Want to override the settings? [y/N]
→ 输入: N
```

Vercel 会自动：
- ✅ 检测到 Nuxt 3 项目
- ✅ 安装依赖
- ✅ 构建项目
- ✅ 部署到临时 URL

**部署完成后**，您会看到：
```
✅ Production: https://cale-exam.vercel.app [复制]
```

#### 步骤 4: 配置环境变量

**重要：现在应用还不能正常运行，需要配置环境变量！**

访问：https://vercel.com/你的用户名/cale-exam/settings/environment-variables

或使用 CLI：

```bash
# 添加 DATABASE_URL
vercel env add DATABASE_URL production
# 粘贴您的 Supabase 连接字符串

# 添加 JWT_SECRET
vercel env add JWT_SECRET production
# 粘贴: bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb

# 添加 JWT_REFRESH_SECRET
vercel env add JWT_REFRESH_SECRET production
# 粘贴: 725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13

# 添加 OPENAI_API_KEY
vercel env add OPENAI_API_KEY production
# 粘贴您的 OpenAI API Key

# 添加 NODE_ENV
vercel env add NODE_ENV production
# 输入: production
```

#### 步骤 5: 运行数据库迁移

环境变量配置完成后，运行数据库迁移：

```bash
# 设置本地 DATABASE_URL（临时）
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# 运行迁移
npx prisma migrate deploy

# 或者如果没有迁移文件，推送架构
npx prisma db push
```

#### 步骤 6: 重新部署

环境变量和数据库配置完成后，重新部署：

```bash
vercel --prod
```

**完成！** 🎉 您的应用已成功部署到生产环境！

访问 URL: `https://cale-exam.vercel.app`

---

### 方式 2: 使用 Vercel Web 界面

#### 步骤 1: 导入项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New..." > "Project"
3. 选择 "Import Git Repository"
4. 授权 GitHub/GitLab/Bitbucket
5. 选择 `cale_exam` 仓库
6. 点击 "Import"

#### 步骤 2: 配置项目

Vercel 会自动检测到 Nuxt 3 配置。

**Build & Development Settings**:
- Framework Preset: `Nuxt.js` ✅ 自动检测
- Build Command: `npm run build` ✅ 自动填充
- Output Directory: `.output` ✅ 自动填充
- Install Command: `npm install --legacy-peer-deps` ⚠️ **需要修改**

**修改 Install Command**:
```bash
npm install --legacy-peer-deps && npx prisma generate
```

#### 步骤 3: 添加环境变量

在部署前，点击 "Environment Variables" 部分，添加：

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | `bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb` |
| `JWT_REFRESH_SECRET` | `725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13` |
| `OPENAI_API_KEY` | `sk-your-openai-api-key` |
| `NODE_ENV` | `production` |

#### 步骤 4: 部署

点击 "Deploy" 按钮。

Vercel 会：
- ✅ 克隆仓库
- ✅ 安装依赖
- ✅ 生成 Prisma 客户端
- ✅ 构建项目
- ✅ 部署到全球 CDN

**等待 3-5 分钟**，部署完成！

#### 步骤 5: 运行数据库迁移

部署成功后，在本地运行迁移：

```bash
# 使用 Supabase 数据库 URL
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# 运行迁移
npx prisma migrate deploy
```

#### 步骤 6: 访问应用

部署完成后，访问分配的 URL：
```
https://cale-exam.vercel.app
```

或您的自定义域名（如果已配置）。

---

## ✅ 部署后验证

### 1. 测试核心功能

访问您的应用 URL，测试：

- [ ] 首页加载正常
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 创建学习计划（立即显示）
- [ ] 创建个人笔记（立即显示）
- [ ] 加入学习小组
- [ ] 发布讨论帖子
- [ ] 收藏功能

### 2. 检查数据库

访问 Supabase Dashboard:
1. 点击左侧 **Table Editor**
2. 查看是否有数据表创建
3. 尝试注册用户，查看 `User` 表是否有新记录

### 3. 查看日志

如果遇到错误：

**Vercel Dashboard**:
1. 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 点击 "Logs" 或 "Functions"
4. 查看实时日志

**或使用 CLI**:
```bash
vercel logs
```

---

## 🔄 自动部署设置

部署成功后，Vercel 会自动监听 Git 仓库。

**每次推送代码时自动部署**:

```bash
# 修改代码
git add .
git commit -m "更新功能"
git push origin main

# Vercel 自动检测并部署！
```

**部署状态**:
- 每次 commit 都会触发构建
- 可以在 Vercel Dashboard 查看进度
- 构建失败会收到邮件通知

---

## 🌐 配置自定义域名（可选）

### 步骤 1: 添加域名

1. 访问 Vercel Dashboard > 您的项目
2. 点击 "Settings" > "Domains"
3. 输入您的域名（如 `cale-exam.com`）
4. 点击 "Add"

### 步骤 2: 配置 DNS

Vercel 会提供 DNS 记录，在您的域名注册商添加：

**A 记录**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME 记录**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 步骤 3: 等待验证

DNS 传播需要 10 分钟到 48 小时。Vercel 会自动：
- ✅ 验证域名
- ✅ 签发 SSL 证书
- ✅ 配置 HTTPS

---

## 💰 成本估算

### Vercel 免费层（Hobby Plan）

**包含**:
- ✅ 100 GB 带宽/月
- ✅ 100 小时 Serverless 函数执行时间
- ✅ 无限项目
- ✅ 自动 SSL
- ✅ 全球 CDN

**对于小型到中型应用完全免费！**

### Supabase 免费层

**包含**:
- ✅ 500 MB 数据库
- ✅ 1 GB 文件存储
- ✅ 50,000 月活用户
- ✅ 无限 API 请求

**足够初期使用！**

### OpenAI API

**按使用量计费**:
- GPT-4: $0.03/1K tokens (输入), $0.06/1K tokens (输出)
- GPT-3.5 Turbo: $0.0005/1K tokens (输入), $0.0015/1K tokens (输出)

**预估**: $5-20/月（取决于 AI 功能使用量）

**总成本**: $0-20/月（OpenAI API 是主要成本）

---

## 🔧 常见问题排查

### 1. 构建失败：`@nuxtjs/tailwindcss` 未找到

**已修复**！`vercel.json` 中的安装命令包含了所有依赖：
```json
"installCommand": "npm install --legacy-peer-deps && npx prisma generate"
```

### 2. 运行时错误：数据库连接失败

**检查**:
- ✅ `DATABASE_URL` 环境变量是否正确设置
- ✅ Supabase 数据库是否正常运行
- ✅ 数据库迁移是否已执行

**解决**:
```bash
# 重新运行迁移
export DATABASE_URL="your-database-url"
npx prisma migrate deploy
```

### 3. 运行时错误：JWT 相关错误

**检查**:
- ✅ `JWT_SECRET` 是否已设置
- ✅ `JWT_REFRESH_SECRET` 是否已设置

**解决**:
在 Vercel Dashboard > Settings > Environment Variables 添加缺失的变量。

### 4. 函数执行超时

**原因**: Vercel 免费层函数执行时间限制 10 秒。

**解决**:
- 优化数据库查询
- 添加索引
- 或升级到 Vercel Pro（60 秒超时）

### 5. 应用加载缓慢

**优化**:
1. 确保数据库和 Vercel 在同一区域
   - Vercel 默认部署到多个区域
   - Supabase 选择 Tokyo 区域（亚洲用户）
2. 检查是否启用了 CDN 缓存
3. 优化图片加载（使用 Nuxt Image）

---

## 📊 监控和日志

### 实时日志

**CLI 方式**:
```bash
# 查看实时日志
vercel logs --follow

# 查看特定部署的日志
vercel logs [deployment-url]
```

**Web 方式**:
1. Vercel Dashboard > 项目
2. 点击 "Logs" 或 "Functions"
3. 查看实时日志和错误

### 性能监控

Vercel 自动提供：
- ✅ 请求数统计
- ✅ 函数执行时间
- ✅ 带宽使用量
- ✅ 错误率

访问：Dashboard > 项目 > Analytics

---

## 🔐 安全最佳实践

### 1. 环境变量

- ✅ 所有密钥都通过 Vercel 环境变量设置
- ✅ 不要在代码中硬编码密钥
- ✅ `.env` 文件不要提交到 Git

### 2. 数据库安全

- ✅ 使用强密码
- ✅ 启用 Supabase Row Level Security (RLS)
- ✅ 定期备份数据

### 3. API 安全

- ✅ 使用 JWT 认证
- ✅ 验证所有用户输入
- ✅ 限制 API 请求频率（Rate limiting）

---

## 📚 有用的命令

```bash
# 部署到生产环境
vercel --prod

# 部署到预览环境
vercel

# 查看部署列表
vercel ls

# 查看日志
vercel logs

# 查看环境变量
vercel env ls

# 删除部署
vercel remove [deployment-url]

# 链接到现有项目
vercel link

# 拉取环境变量到本地
vercel env pull
```

---

## ✅ 检查清单

部署前确认：

- [ ] Git 仓库已推送最新代码
- [ ] Supabase 数据库已创建
- [ ] DATABASE_URL 已获取
- [ ] OpenAI API Key 已获取
- [ ] JWT 密钥已生成（已提供）
- [ ] Vercel CLI 已安装（如果使用 CLI）
- [ ] Vercel 账户已注册

部署后确认：

- [ ] 应用 URL 可以访问
- [ ] 用户注册/登录正常
- [ ] 数据库连接正常
- [ ] 所有核心功能测试通过
- [ ] 日志中没有错误
- [ ] 自动部署已配置

---

## 🎉 完成！

恭喜！您的 Cale Exam 应用已成功部署到 Vercel！

**下一步**:
1. 测试所有功能
2. 邀请用户试用
3. 收集反馈
4. 持续迭代改进

**需要帮助？**
- Vercel 文档: [vercel.com/docs](https://vercel.com/docs)
- Nuxt 文档: [nuxt.com/docs](https://nuxt.com/docs)
- Supabase 文档: [supabase.com/docs](https://supabase.com/docs)

---

**创建日期**: 2025-10-25
**状态**: ✅ 准备就绪
**部署平台**: Vercel
**预估成本**: $0-20/月
