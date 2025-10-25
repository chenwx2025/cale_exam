# AWS Amplify 构建错误修复

## 问题：`@nuxtjs/tailwindcss` 未安装

**错误信息**:
```
[error] Could not load `@nuxtjs/tailwindcss`. Is it installed?
npm error command failed
npm error command sh -c nuxt prepare
```

## 根本原因

1. `@nuxtjs/tailwindcss` 在 `package.json` 的 **devDependencies** 中
2. AWS Amplify 使用了 `npm ci --legacy-peer-deps` 命令
3. `npm ci` 在生产环境可能跳过 devDependencies
4. Nuxt 构建需要 `@nuxtjs/tailwindcss` 模块

## ✅ 已修复

### 修改内容：amplify.yml

**修改前**:
```yaml
preBuild:
  commands:
    - npm ci --legacy-peer-deps  # ❌ 可能跳过 devDependencies
```

**修改后**:
```yaml
preBuild:
  commands:
    - nvm install 22              # ✅ 指定 Node.js 版本
    - nvm use 22
    - npm install --legacy-peer-deps  # ✅ 安装所有依赖（包括 dev）
    - npx prisma generate
```

### 其他改进：

1. **添加了 Node.js 版本管理**:
   ```yaml
   - nvm install 22
   - nvm use 22
   ```

2. **修正输出目录**:
   ```yaml
   artifacts:
     baseDirectory: .output  # 原来是 .output/public（错误）
   ```

3. **添加了安全头**:
   ```yaml
   customHeaders:
     - pattern: '**/*'
       headers:
         - key: 'Strict-Transport-Security'
           value: 'max-age=31536000; includeSubDomains'
   ```

## 🚀 现在可以重新部署

### 步骤 1: 推送更新的 amplify.yml

```bash
git add amplify.yml
git commit -m "fix: 修复 AWS Amplify 构建配置"
git push origin main
```

### 步骤 2: AWS Amplify 会自动重新构建

访问 Amplify Console 查看构建进度。

## ⚠️ 重要提醒：AWS Amplify 不支持 SSR

即使修复了构建问题，您的 Nuxt SSR 应用**仍然无法在 AWS Amplify 免费层上运行**。

构建可能成功，但运行时会失败，错误类似：
```
This is a server-side rendered (SSR) application
Amplify Hosting only supports static websites
```

## 🎯 推荐的解决方案

### 选项 1: 使用 Vercel（强烈推荐）⭐

**为什么选择 Vercel:**
- ✅ 完美支持 Nuxt SSR
- ✅ 完全免费（慷慨的免费层）
- ✅ 零配置部署
- ✅ 5 分钟完成部署

**快速部署到 Vercel:**

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署（自动检测配置）
vercel

# 4. 配置环境变量
# 访问 vercel.com > 项目 > Settings > Environment Variables
# 添加：
# - DATABASE_URL
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - OPENAI_API_KEY
# - NODE_ENV=production

# 5. 完成！每次 git push 自动部署
```

### 选项 2: 使用 Railway

内置数据库 + SSR 支持，$5/月免费额度。

```bash
# 访问 railway.app
# 连接 GitHub 仓库
# 添加 PostgreSQL 服务
# 环境变量自动配置
```

### 选项 3: 继续用 AWS（需要付费）

**AWS Amplify Compute** - 支持 SSR，但价格：
- 约 $50-150/月（持续运行）
- 需要在 Amplify Console 中启用 "SSR" 模式

## 📋 完整的 amplify.yml（已修复）

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 22
        - nvm use 22
        - node --version
        - npm --version
        - npm install --legacy-peer-deps
        - npx prisma generate
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .output
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .nuxt/**/*
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'Strict-Transport-Security'
          value: 'max-age=31536000; includeSubDomains'
        - key: 'X-Frame-Options'
          value: 'SAMEORIGIN'
        - key: 'X-Content-Type-Options'
          value: 'nosniff'
```

## 🔍 验证本地构建

在推送之前，先本地验证：

```bash
# 清理
rm -rf node_modules .nuxt .output

# 重新安装
npm install --legacy-peer-deps

# 生成 Prisma 客户端
npx prisma generate

# 构建
npm run build

# 如果成功，输出应该在 .output 目录
ls -la .output
```

## ✅ 总结

1. **构建问题已修复** - `amplify.yml` 已更新
2. **但 SSR 仍然是问题** - AWS Amplify 免费层不支持
3. **推荐使用 Vercel** - 完美支持 + 免费

## 下一步

**选择 A: 推送到 AWS Amplify（测试修复）**
```bash
git add amplify.yml
git commit -m "fix: amplify build configuration"
git push origin main
```

**选择 B: 改用 Vercel（推荐）**
```bash
npm i -g vercel
vercel
```

**告诉我您想选择哪个，我可以继续协助！** 🚀

---

**修复日期**: 2025-10-25
**状态**: ✅ 构建配置已修复，等待选择部署平台
