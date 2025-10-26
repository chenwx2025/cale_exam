# AWS Amplify 部署最终检查清单

**日期**: 2025-10-25
**状态**: ✅ 准备就绪

---

## ⚠️ 重要提醒

### AWS Amplify 有两种服务：

1. **AWS Amplify Hosting（免费层）** - ❌ 不支持您的 Nuxt SSR 应用
2. **AWS Amplify Hosting with Compute（付费）** - ✅ 支持 SSR，约 $145/月

**您必须选择 "Hosting with Compute" 才能部署您的应用！**

---

## ✅ 已完成的准备工作

### 1. 配置文件 ✅

- ✅ [amplify.yml](amplify.yml) - 已创建并优化
  - Node.js 22 版本
  - npm install --legacy-peer-deps
  - Prisma 生成
  - 正确的输出目录（.output）
  - 安全响应头配置

### 2. 本地构建测试 ✅

```bash
✅ 构建成功！
✅ 无阻塞错误
⚠️  2 个警告（可忽略）:
   - Duplicated imports "getRequestIP"
   - Duplicated imports "validateEmail"
```

**构建输出**:
- 549 个模块转换
- 客户端包: ~85KB (gzipped)
- 构建时间: ~90 秒

### 3. 输出目录结构 ✅

```
.output/
├── nitro.json
├── public/          # 静态资源
│   ├── _nuxt/       # 客户端 JS/CSS
│   ├── favicon.ico
│   └── ...
└── server/          # 服务端代码（SSR）
```

---

## 📋 部署前检查清单

### 必需准备（在开始部署前）

- [ ] **Git 仓库已推送最新代码**
  ```bash
  git status
  git add .
  git commit -m "准备 AWS Amplify 部署"
  git push origin main
  ```

- [ ] **PostgreSQL 数据库已准备**
  - 推荐：Supabase（免费）
  - 或：AWS RDS（$15-20/月）
  - 获取 `DATABASE_URL` 连接字符串

- [ ] **OpenAI API Key 已获取**
  - 访问：https://platform.openai.com/api-keys
  - 创建新密钥
  - 格式：`sk-...`

- [ ] **JWT 密钥已准备**（已为您生成）
  - JWT_SECRET: `bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb`
  - JWT_REFRESH_SECRET: `725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13`

- [ ] **AWS 账户已注册**
  - 访问：https://aws.amazon.com
  - 需要信用卡（用于付费服务）

- [ ] **确认预算**
  - AWS Amplify Compute: ~$145/月
  - 数据库（如果用 RDS）: ~$15-20/月
  - OpenAI API: ~$5-20/月
  - **总计**: ~$165-185/月

---

## 🚀 AWS Amplify 部署步骤

### 步骤 1: 推送代码到 Git

```bash
# 确保所有更改已提交
git add amplify.yml
git commit -m "AWS Amplify 部署配置 - 使用 Node 22 和 Compute"
git push origin main
```

### 步骤 2: 登录 AWS Console

1. 访问：https://console.aws.amazon.com/amplify
2. 登录您的 AWS 账户
3. 选择区域（推荐：Tokyo - ap-northeast-1）

### 步骤 3: 创建新应用

1. 点击 **"New app"** > **"Host web app"**

2. **连接 Git 仓库**:
   - 选择：GitHub / GitLab / Bitbucket
   - 授权 AWS Amplify 访问您的仓库
   - 选择仓库：`cale_exam`
   - 选择分支：`main`
   - 点击 **"Next"**

### 步骤 4: 配置应用设置

**⚠️ 关键步骤：选择 SSR**

1. **App name**: `cale-exam`

2. **Environment name**: `production`

3. **Build settings**:
   - Amplify 会自动检测到 `amplify.yml`
   - ✅ 确认显示正确的配置
   - **不要修改**（除非有特殊需求）

4. **⚠️ 应用类型（最重要！）**:
   - 找到 **"App type"** 或 **"Hosting compute"** 选项
   - **必须选择**: **"Server-side rendered (SSR)"** 或 **"Compute"**
   - ❌ 不要选择 "Static web hosting"（不兼容）

5. **Service role**:
   - 如果是第一次使用，选择 **"Create new service role"**
   - 名称：`amplify-cale-exam-role`
   - 允许 Amplify 访问其他 AWS 服务

6. 点击 **"Next"**

### 步骤 5: 配置环境变量

**在部署前必须添加环境变量！**

1. 在配置页面找到 **"Environment variables"** 部分
2. 点击 **"Add variable"**

添加以下变量：

| Variable name | Value | 说明 |
|--------------|-------|------|
| `DATABASE_URL` | `postgresql://...` | Supabase 或 RDS 连接字符串 |
| `JWT_SECRET` | `bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb` | JWT 访问令牌密钥 |
| `JWT_REFRESH_SECRET` | `725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13` | JWT 刷新令牌密钥 |
| `OPENAI_API_KEY` | `sk-your-key-here` | OpenAI API 密钥 |
| `NODE_ENV` | `production` | 环境标识 |

**可选变量**（邮件功能需要）:

| Variable name | Value | 说明 |
|--------------|-------|------|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP 服务器 |
| `SMTP_PORT` | `587` | SMTP 端口 |
| `SMTP_USER` | `your-email@gmail.com` | 邮箱地址 |
| `SMTP_PASS` | `your-app-password` | Gmail 应用专用密码 |
| `SMTP_FROM` | `your-email@gmail.com` | 发件人地址 |

### 步骤 6: 查看并部署

1. 查看所有配置
2. 点击 **"Save and deploy"**
3. Amplify 开始构建和部署

**预计时间**: 5-10 分钟

---

## 📊 监控部署进度

### 构建阶段

Amplify Console 会显示 4 个阶段：

1. **Provision** (准备环境)
   - 分配计算资源
   - 预计：1-2 分钟

2. **Build** (构建应用)
   - 运行 amplify.yml 中的命令
   - npm install
   - Prisma generate
   - npm run build
   - 预计：3-5 分钟

3. **Deploy** (部署)
   - 上传构建产物
   - 配置服务器
   - 预计：1-2 分钟

4. **Verify** (验证)
   - 健康检查
   - 预计：< 1 分钟

### 查看日志

点击每个阶段可以查看详细日志：
- ✅ 绿色：成功
- 🟡 黄色：警告（通常可忽略）
- ❌ 红色：错误（需要修复）

---

## ✅ 部署成功后

### 1. 获取应用 URL

部署成功后，Amplify 会提供一个 URL：
```
https://main.xxxxxx.amplifyapp.com
```

### 2. 运行数据库迁移

**在本地运行迁移**（连接到生产数据库）:

```bash
# 设置生产数据库 URL
export DATABASE_URL="你的 Supabase 或 RDS URL"

# 运行迁移
npx prisma migrate deploy

# 或者推送架构（如果没有迁移文件）
npx prisma db push
```

### 3. 测试应用

访问您的应用 URL 并测试：

- [ ] 首页加载正常
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 创建学习计划
- [ ] 创建学习小组
- [ ] 发布讨论帖子
- [ ] 创建笔记
- [ ] 收藏功能

### 4. 查看日志（如果有错误）

Amplify Console > 应用 > **"Monitoring"** > **"Logs"**

---

## ⚠️ 常见问题和解决方案

### 问题 1: 构建失败 - "@nuxtjs/tailwindcss 未找到"

**已修复！** `amplify.yml` 使用 `npm install`（包含 devDependencies）

### 问题 2: 部署失败 - "This is an SSR app, requires compute"

**原因**: 选择了错误的应用类型（Static hosting）

**解决方案**:
1. 删除当前应用
2. 重新创建
3. **确保选择 "Server-side rendered (SSR)" 或 "Compute"**

### 问题 3: 运行时错误 - 数据库连接失败

**检查**:
- ✅ `DATABASE_URL` 环境变量是否正确
- ✅ 数据库是否允许外部连接
- ✅ Supabase 项目是否正常运行

**解决方案**:
```bash
# 测试数据库连接
export DATABASE_URL="your-url"
npx prisma db pull
```

### 问题 4: 运行时错误 - "JWT secret is required"

**原因**: 环境变量未设置或值错误

**解决方案**:
1. Amplify Console > 应用 > **"Environment variables"**
2. 检查 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`
3. 重新部署：点击 **"Redeploy this version"**

### 问题 5: 应用访问慢或超时

**可能原因**:
- 数据库和 Amplify 不在同一区域
- 数据库查询慢

**解决方案**:
1. 确保 Supabase 和 Amplify 在同一区域（Tokyo）
2. 检查数据库索引
3. 查看 Amplify Logs 找出慢查询

### 问题 6: 文件上传功能不工作

**原因**: Amplify 文件系统只读

**解决方案**: 需要集成外部存储（见下方）

---

## 🔧 部署后需要的修改

### 必须修改的功能

#### 1. 文件上传 - 需要使用外部存储

**当前问题**:
- 代码上传文件到本地 `public/uploads/`
- Amplify 文件系统只读，文件会丢失

**解决方案选择**:

**选项 A: 使用 Vercel Blob（推荐）**
- 安装：`npm install @vercel/blob`
- 免费：1 GB 存储
- 文档：[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

**选项 B: 使用 Supabase Storage（推荐）**
- 安装：`npm install @supabase/supabase-js`
- 免费：1 GB 存储
- 您已经在用 Supabase 数据库

**选项 C: 使用 AWS S3**
- AWS 原生，集成简单
- 免费：5 GB 存储（12 个月）
- 之后：$0.023/GB/月

**工作量**: 2-3 小时修改代码

#### 2. 定时任务 - 需要外部触发

**当前问题**:
- 使用 `node-cron` 运行定时任务
- Amplify Serverless 函数无状态，不支持持续运行

**解决方案选择**:

**选项 A: AWS EventBridge（推荐）**
- AWS 原生 Cron 服务
- 创建 API 端点供 EventBridge 调用
- 免费：100 万次调用/月

**选项 B: GitHub Actions（免费）**
- 配置 `.github/workflows/cron.yml`
- 定时调用您的 API
- 完全免费

**选项 C: 外部 Cron 服务**
- cron-job.org（免费）
- EasyCron（免费层）

**工作量**: 1-2 小时配置

---

## 💰 成本估算

### 月度成本（小型应用）

| 服务 | 月成本 | 说明 |
|------|-------|------|
| **AWS Amplify Compute** | ~$144 | $0.20/小时 × 24 × 30 |
| **Amplify 构建** | ~$0.50 | 10 次构建 × 5 分钟 × $0.01 |
| **Amplify 带宽** | ~$0 | 免费层够用 |
| **Supabase** | $0 | 免费层 |
| **或 AWS RDS** | $15-20 | db.t3.micro |
| **OpenAI API** | $5-20 | 按使用量 |
| **总计（Supabase）** | **~$150-165** | |
| **总计（RDS）** | **~$165-185** | |

### 免费层用完后（AWS 免费层 12 个月）

如果您是新 AWS 账户，可能有一些免费额度：
- EC2: 750 小时/月（12 个月）
- RDS: 750 小时/月（12 个月）
- 但 **Amplify Compute 没有免费层**

---

## 🔄 自动部署

部署成功后，Amplify 会自动监听 Git 仓库。

**每次推送代码时自动部署**:

```bash
# 修改代码
git add .
git commit -m "更新功能"
git push origin main

# Amplify 自动检测并部署！
```

**部署分支管理**:
- `main` 分支 → 生产环境
- 可以配置其他分支（如 `dev`）→ 测试环境

---

## 🌐 自定义域名（可选）

### 步骤 1: 添加域名

1. Amplify Console > 应用 > **"Domain management"**
2. 点击 **"Add domain"**
3. 输入您的域名（如 `cale-exam.com`）

### 步骤 2: 配置 DNS

Amplify 会提供 DNS 记录：

**CNAME 记录**:
```
Type: CNAME
Name: www
Value: xxxxxx.cloudfront.net
```

**A 记录**（Apex 域名）:
使用 Amplify 的 NS 服务器或 ALIAS 记录

### 步骤 3: 等待验证

DNS 传播需要 10 分钟到 48 小时。Amplify 会自动：
- ✅ 验证域名所有权
- ✅ 签发 SSL 证书
- ✅ 配置 HTTPS

---

## 📚 有用的资源

### AWS 文档
- [Amplify Hosting 文档](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Amplify SSR 指南](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html)
- [环境变量配置](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)

### 备用文档
- [AMPLIFY_BUILD_FIX.md](AMPLIFY_BUILD_FIX.md) - 构建错误修复
- [AWS_AMPLIFY_FREE_TIER_ANALYSIS.md](AWS_AMPLIFY_FREE_TIER_ANALYSIS.md) - 免费层分析
- [VERCEL_LIMITATIONS_ANALYSIS.md](VERCEL_LIMITATIONS_ANALYSIS.md) - Vercel 对比分析

---

## ✅ 最终检查

部署前最后确认：

- [ ] Git 代码已推送
- [ ] amplify.yml 文件正确（Node 22）
- [ ] 数据库已准备（Supabase 或 RDS）
- [ ] OpenAI API Key 已获取
- [ ] JWT 密钥已记录
- [ ] 确认预算（~$150-185/月）
- [ ] 选择 "SSR" 应用类型（关键！）
- [ ] 环境变量已准备好复制

---

## 🎯 部署建议

### 如果预算有限

**考虑使用 Vercel**:
- ✅ 完全免费（vs Amplify $145/月）
- ✅ 完美支持 SSR
- ✅ 更简单的配置
- ✅ 已准备好所有配置文件

参考：[VERCEL_QUICK_START.md](VERCEL_QUICK_START.md)

### 如果坚持使用 AWS

继续当前的 Amplify 部署流程，但要注意：
1. 成本较高（~$150/月）
2. 需要修改文件上传和定时任务
3. 配置相对复杂

---

## 📞 需要帮助？

**如果遇到问题**:
1. 查看 Amplify Console 日志
2. 参考本文档的"常见问题"部分
3. 查看 AWS 文档
4. 告诉我具体的错误信息，我可以帮您解决

---

**创建日期**: 2025-10-25
**最后更新**: 2025-10-25
**状态**: ✅ 准备就绪，可以开始部署
**预估成本**: ~$150-185/月

**祝部署顺利！** 🚀
