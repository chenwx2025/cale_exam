# AWS Amplify SSR 部署解决方案

## 问题：AWS Amplify 不支持免费托管 SSR 应用

您的应用是 Nuxt 3 SSR（服务端渲染）应用，AWS Amplify 免费层只支持静态网站。

## 解决方案（3 个选择）

### 选项 1: 使用 AWS Amplify Compute (推荐) ⭐

AWS 在 2024 年推出了 Amplify Compute，专门支持 SSR 应用。

**优点**:
- ✅ 原生支持 Nuxt SSR
- ✅ 自动 CI/CD
- ✅ 全球 CDN
- ✅ 自动扩展

**缺点**:
- ⚠️ 价格较高：$0.20/小时运行时间（约 $144/月持续运行）
- ⚠️ 但可以按使用量付费，低流量时便宜

**配置方法**:

1. **修改 amplify.yml**:
```yaml
version: 1
applications:
  - appRoot: /
    frontend:
      phases:
        preBuild:
          commands:
            - nvm install 22
            - nvm use 22
            - npm ci --legacy-peer-deps
            - npx prisma generate
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .output
        files:
          - '**/*'
    platform: WEB_COMPUTE  # 关键：指定使用 Compute
    buildspec: |-
      version: 1
      frontend:
        phases:
          preBuild:
            commands:
              - nvm install 22
              - nvm use 22
              - npm ci --legacy-peer-deps
              - npx prisma generate
          build:
            commands:
              - npm run build
        artifacts:
          baseDirectory: .output
          files:
            - '**/*'
```

2. **在 Amplify Console 中**:
   - 创建新应用时，选择 "SSR" 类型
   - 或在现有应用中，Settings > General > App type > 选择 "Server-side rendered (SSR)"

---

### 选项 2: 转换为静态生成 (SSG) - 免费 ✅

将应用转换为静态生成，可以使用 Amplify 免费层。

**优点**:
- ✅ 完全免费（或每月 $2-5）
- ✅ 性能更好（预渲染）
- ✅ 更简单的部署

**缺点**:
- ❌ 失去动态 SSR 功能
- ❌ 需要修改代码

**实施步骤**:

1. **修改 nuxt.config.ts**:
```typescript
export default defineNuxtConfig({
  ssr: false,  // 改为客户端渲染
  // 或使用混合渲染
  routeRules: {
    '/': { prerender: true },
    '/study-groups': { prerender: true },
    // 其他页面按需配置
  }
})
```

2. **重新构建测试**:
```bash
npm run build
npm run preview
```

3. **修改 amplify.yml**:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 22
        - nvm use 22
        - npm ci --legacy-peer-deps
        - npx prisma generate
    build:
      commands:
        - npm run generate  # 使用 generate 而不是 build
  artifacts:
    baseDirectory: dist  # SSG 输出到 dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

### 选项 3: 使用其他支持 SSR 的平台 (推荐) 🌟

改用其他专门支持 Nuxt SSR 的免费/低成本平台。

#### 3a. Vercel (最推荐)

**优点**:
- ✅ 完美支持 Nuxt SSR
- ✅ 免费层非常慷慨
- ✅ 零配置部署
- ✅ 自动 CI/CD
- ✅ 全球 CDN

**免费额度**:
- 100 GB 带宽/月
- 100 小时函数执行时间
- 足够小到中型应用

**部署步骤**:

1. **安装 Vercel CLI**:
```bash
npm i -g vercel
```

2. **登录并部署**:
```bash
vercel login
vercel
```

3. **配置环境变量**:
```bash
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add OPENAI_API_KEY production
```

4. **完成！**
- Vercel 会自动检测 Nuxt 配置
- 每次 git push 自动部署

**vercel.json** (可选):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nuxtjs",
  "outputDirectory": ".output"
}
```

---

#### 3b. Netlify

**优点**:
- ✅ 支持 Nuxt SSR
- ✅ 免费层慷慨
- ✅ 简单配置

**免费额度**:
- 100 GB 带宽/月
- 300 分钟构建时间

**部署文件 netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = ".output/public"
  functions = ".output/server"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "22"
```

---

#### 3c. Railway (推荐用于数据库集成)

**优点**:
- ✅ 完美支持 SSR
- ✅ 内置 PostgreSQL 数据库
- ✅ $5 免费额度/月
- ✅ 简单配置

**免费额度**:
- $5 免费额度（足够小型应用）
- 之后按使用量付费

**部署步骤**:

1. 访问 railway.app
2. "New Project" > "Deploy from GitHub"
3. 选择您的仓库
4. 添加 PostgreSQL 服务
5. 环境变量自动设置

---

#### 3d. Render

**优点**:
- ✅ 支持 SSR
- ✅ 免费 PostgreSQL 数据库
- ✅ 简单可靠

**免费层**:
- 750 小时/月服务器时间
- 免费 PostgreSQL (90 天后删除)

**render.yaml**:
```yaml
services:
  - type: web
    name: cale-exam
    env: node
    buildCommand: npm install --legacy-peer-deps && npm run build
    startCommand: node .output/server/index.mjs
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: cale-exam-db
          property: connectionString

databases:
  - name: cale-exam-db
    databaseName: cale_exam
    user: cale_user
```

---

## 🎯 我的推荐

### 如果预算有限（推荐）:
**使用 Vercel** - 免费、零配置、完美支持 Nuxt SSR

### 如果需要更多控制:
**使用 Railway** - 内置数据库、简单部署、按需付费

### 如果坚持用 AWS:
**使用 AWS Amplify Compute** - 但价格较高

## 📋 对比表格

| 平台 | SSR 支持 | 免费额度 | 月成本估算 | 易用性 |
|------|---------|---------|-----------|--------|
| **Vercel** | ✅ 完美 | 100GB/月 | $0-20 | ⭐⭐⭐⭐⭐ |
| **Railway** | ✅ 完美 | $5 额度 | $5-15 | ⭐⭐⭐⭐ |
| **Netlify** | ✅ 良好 | 100GB/月 | $0-20 | ⭐⭐⭐⭐ |
| **Render** | ✅ 良好 | 750h/月 | $0-15 | ⭐⭐⭐⭐ |
| **AWS Amplify Compute** | ✅ 完美 | 无 | $50-150 | ⭐⭐⭐ |
| **AWS Amplify (静态)** | ❌ 仅 SSG | 免费层 | $2-5 | ⭐⭐⭐⭐ |

## 🚀 快速开始 - Vercel 部署（5 分钟）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 配置环境变量（通过 Web 界面或 CLI）
# 访问 vercel.com > 您的项目 > Settings > Environment Variables

# 5. 推送代码即自动部署！
git push origin main
```

## ❓ 需要帮助？

**告诉我您想选择哪个方案，我可以帮您:**
1. 生成对应的配置文件
2. 提供详细的部署步骤
3. 解答任何问题

---

**创建日期**: 2025-10-25
**推荐方案**: Vercel (免费 + 零配置)
