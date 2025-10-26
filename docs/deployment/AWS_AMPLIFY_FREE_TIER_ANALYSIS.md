# AWS Amplify 免费层详细分析

## ⚠️ 重要结论

**AWS Amplify 免费层不支持您的 Nuxt SSR 应用！**

但是，让我详细解释所有选项和限制。

---

## 🔍 AWS Amplify 的两种托管方式

### 1. AWS Amplify Hosting（免费层）❌ 不支持 SSR

**适用于**: 静态网站（SSG - Static Site Generation）

**限制**:
- ❌ **只支持静态文件**（HTML、CSS、JS）
- ❌ **不支持服务端渲染（SSR）**
- ❌ **不支持 Node.js 服务器**
- ❌ **不支持 API 路由**（除非使用 AWS Lambda）

**您的应用**:
- ❌ Nuxt SSR 应用 - **不兼容**
- ❌ 需要 Node.js 服务器运行 `.output/server/index.mjs`
- ❌ 有 API 路由（`server/api/*`）
- ❌ 需要实时数据库连接

**部署会发生什么**:
```
✅ 构建成功（如果修复了之前的错误）
❌ 运行失败 - "This is an SSR app, requires compute"
```

**免费额度**（即使不能用）:
- 构建时间：1000 分钟/月
- 托管：15 GB 存储 + 15 GB 带宽/月

---

### 2. AWS Amplify Hosting with Compute（付费）✅ 支持 SSR

**适用于**: SSR 应用（包括 Nuxt、Next.js）

**支持**:
- ✅ 服务端渲染（SSR）
- ✅ Node.js 服务器
- ✅ API 路由
- ✅ 数据库连接
- ✅ 您的应用完全兼容

**价格**（重点）:
- **没有免费层！**
- **$0.20/小时** 运行时间
- 如果 24/7 运行：$0.20 × 24 × 30 = **$144/月**
- 构建时间：$0.01/分钟

**成本计算**（小型应用）:
```
运行时间：24/7 = $144/月
构建时间：10 次 × 5 分钟 × $0.01 = $0.50/月
总计：约 $145/月
```

**适合谁**:
- 企业应用
- 高流量网站
- 有预算的项目

---

## 🚫 为什么免费层不支持 SSR？

### 静态托管 vs SSR 对比

| 特性 | 静态托管（免费） | SSR（付费 Compute） |
|------|----------------|---------------------|
| 服务器 | ❌ 无服务器 | ✅ Node.js 服务器 |
| 成本 | 存储 + CDN | 服务器运行时间 |
| 适用 | HTML/CSS/JS | Nuxt/Next.js SSR |
| API 路由 | ❌ 不支持 | ✅ 支持 |
| 数据库 | ❌ 需要外部 | ✅ 直接连接 |
| **您的应用** | ❌ 不兼容 | ✅ 兼容 |

---

## 🎯 您的选择

### 选项 1: 使用 AWS Amplify Compute（付费）

**成本**: ~$145/月

**优点**:
- ✅ 完全支持您的应用
- ✅ AWS 官方支持
- ✅ 全球 CDN
- ✅ 自动扩展

**缺点**:
- ❌ 价格高昂（对于小型应用）
- ❌ 没有免费层

**配置**: 已经准备好（`amplify.yml` 已修复）

**部署步骤**:
1. 推送代码到 Git
2. AWS Amplify Console 创建应用
3. **选择 "SSR" 应用类型**（关键！）
4. 配置环境变量
5. 部署

**环境变量配置**:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb
JWT_REFRESH_SECRET=725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

---

### 选项 2: 转换为静态站点（SSG）- 使用免费层

**成本**: $0/月（免费层）

**需要修改**:
- 将 Nuxt 从 SSR 改为 SSG（Static Site Generation）
- 修改部分功能逻辑
- API 路由改用 AWS Lambda（额外复杂度）

**修改步骤**:

#### 2.1 修改 nuxt.config.ts

```typescript
export default defineNuxtConfig({
  ssr: false,  // 关闭 SSR，改为客户端渲染

  // 或使用预渲染
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    }
  },

  // 静态生成
  target: 'static',
})
```

#### 2.2 修改 API 路由

**问题**: 静态站点没有服务器，无法运行 API 路由

**解决方案**:
- 选项 A: 使用 AWS Lambda + API Gateway（复杂）
- 选项 B: 改用 Supabase 的数据库 API（需要重写）
- 选项 C: 放弃一些功能

#### 2.3 修改身份验证

- JWT 验证需要在客户端完成（不安全）
- 或使用 AWS Cognito（学习成本）

**工作量**: 5-10 天重构

**缺点**:
- ❌ 失去 SSR 的 SEO 优势
- ❌ 失去服务端安全性
- ❌ 需要大量重构
- ❌ 部分功能难以实现

**优点**:
- ✅ 完全免费
- ✅ 性能更好（预渲染）

---

### 选项 3: 使用 Vercel（推荐）⭐⭐⭐

**成本**: $0/月（免费层）

**优点**:
- ✅ **完美支持 Nuxt SSR**
- ✅ **无需修改代码**（除了文件上传和定时任务）
- ✅ **零配置部署**
- ✅ **免费额度慷慨**
- ✅ **全球 CDN**
- ✅ **自动 HTTPS**

**免费额度**:
- 100 GB 带宽/月
- 100 小时 Serverless 函数执行时间
- 无限项目

**对比 AWS Amplify**:

| 项目 | AWS Amplify 免费层 | AWS Amplify Compute | Vercel 免费层 |
|------|-------------------|---------------------|--------------|
| **SSR 支持** | ❌ 不支持 | ✅ 支持 | ✅ 支持 |
| **月成本** | $0（但不能用） | ~$145 | $0 |
| **配置难度** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **部署时间** | 10 分钟 | 15 分钟 | 5 分钟 |
| **您的应用** | ❌ 不兼容 | ✅ 兼容 | ✅ 兼容 |

---

### 选项 4: 其他免费/低成本平台

#### 4.1 Railway

- ✅ 支持 SSR
- ✅ $5 免费额度/月
- ✅ 内置 PostgreSQL
- ✅ 简单部署

**成本**: $0-10/月

#### 4.2 Render

- ✅ 支持 SSR
- ✅ 免费层（750 小时/月）
- ✅ 免费 PostgreSQL
- ⚠️ 应用闲置会休眠

**成本**: $0/月（免费层）

#### 4.3 Fly.io

- ✅ 支持 SSR
- ✅ 3 个免费应用
- ✅ 256 MB RAM 免费

**成本**: $0/月（免费层）

---

## 📊 完整成本对比

| 平台 | SSR 支持 | 月成本 | 免费额度 | 推荐指数 |
|------|---------|-------|---------|---------|
| **Vercel** | ✅ | $0 | 100GB 带宽 | ⭐⭐⭐⭐⭐ |
| **Railway** | ✅ | $0-10 | $5 额度 | ⭐⭐⭐⭐ |
| **Render** | ✅ | $0 | 750h/月 | ⭐⭐⭐⭐ |
| **Fly.io** | ✅ | $0 | 3 个应用 | ⭐⭐⭐ |
| **AWS Amplify 免费层** | ❌ | - | 不适用 | ⭐ |
| **AWS Amplify Compute** | ✅ | $145 | 无 | ⭐⭐ |

加上数据库：

| 数据库 | 月成本 | 免费额度 |
|--------|-------|---------|
| **Supabase** | $0 | 500 MB |
| **Railway PostgreSQL** | $5 | 包含在 $5 额度内 |
| **Render PostgreSQL** | $0 | 90 天后删除 |
| **AWS RDS** | $15-20 | 无（免费层 12 个月） |

**总成本（推荐组合）**:
- **Vercel + Supabase**: $0/月 ⭐⭐⭐⭐⭐
- **Railway（含数据库）**: $5-10/月 ⭐⭐⭐⭐
- **Render（含数据库）**: $0/月（90 天内）⭐⭐⭐
- **AWS Amplify Compute + RDS**: $160/月 ⭐

---

## 🎯 我的推荐（按优先级）

### 🥇 第一推荐: Vercel + Supabase

**为什么**:
- ✅ 完全免费
- ✅ 完美支持 SSR
- ✅ 零配置部署（5 分钟）
- ✅ 已经准备好所有配置文件
- ✅ 只需要修改文件上传和定时任务（3-5 小时）

**成本**: $0/月（+ OpenAI API ~$5-20/月）

**部署时间**: 15 分钟（基础版），3-5 小时（完整版）

---

### 🥈 第二推荐: Railway

**为什么**:
- ✅ 支持 SSR
- ✅ 内置 PostgreSQL（无需单独配置）
- ✅ 简单易用
- ✅ $5 免费额度足够小型应用

**成本**: $0-10/月

**部署时间**: 10 分钟

---

### 🥉 第三推荐: Render

**为什么**:
- ✅ 支持 SSR
- ✅ 完全免费（750 小时/月）
- ✅ 免费 PostgreSQL
- ⚠️ 闲置会休眠（需要 15-30 秒唤醒）

**成本**: $0/月

**部署时间**: 15 分钟

---

### ❌ 不推荐: AWS Amplify

**原因**:
- ❌ 免费层不支持 SSR
- ❌ Compute 版本太贵（$145/月）
- ❌ 配置复杂
- ❌ 性价比低（对于小型应用）

**除非**:
- 您有预算（$145/月+）
- 需要 AWS 生态系统集成
- 企业级应用

---

## 🚀 立即行动方案

### 方案 A: 使用 Vercel（最推荐）

**今天就可以完成**:

```bash
# 1. 安装 Vercel CLI（1 分钟）
npm install -g vercel

# 2. 登录（1 分钟）
vercel login

# 3. 部署（5 分钟）
vercel

# 4. 配置环境变量（5 分钟）
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add NODE_ENV production

# 5. 运行数据库迁移（2 分钟）
export DATABASE_URL="your-supabase-url"
npx prisma migrate deploy

# 6. 重新部署（1 分钟）
vercel --prod
```

**总时间**: 15 分钟

**成本**: $0/月

---

### 方案 B: 坚持使用 AWS Amplify Compute

**如果您确实想用 AWS**:

1. **确认预算**: ~$145/月
2. **推送代码**:
   ```bash
   git add amplify.yml
   git commit -m "AWS Amplify 配置"
   git push origin main
   ```
3. **AWS Amplify Console**:
   - 创建新应用
   - 连接 Git 仓库
   - **选择 "SSR" 应用类型**（关键！）
   - 配置环境变量
   - 部署

**总时间**: 20 分钟

**成本**: ~$145/月

---

### 方案 C: 转换为静态站点（不推荐）

**工作量**: 5-10 天重构

**成本**: $0/月

**缺点**: 失去很多功能

---

## 📋 决策树

```
您的应用是 Nuxt SSR
│
├─ 想用 AWS？
│  ├─ 有预算 ($145/月)？
│  │  ├─ Yes → AWS Amplify Compute ✅
│  │  └─ No → 改用 Vercel ⭐⭐⭐
│  │
│  └─ 愿意重构为静态站点（5-10 天）？
│     ├─ Yes → AWS Amplify 免费层（SSG）
│     └─ No → 改用 Vercel ⭐⭐⭐
│
└─ 想要免费/低成本？
   ├─ Vercel（推荐）⭐⭐⭐⭐⭐
   ├─ Railway（$5-10/月）⭐⭐⭐⭐
   └─ Render（免费但休眠）⭐⭐⭐
```

---

## ✅ 最终建议

**使用 Vercel + Supabase**

**理由**:
1. ✅ 完全免费（除了 OpenAI API）
2. ✅ 完美支持 SSR（无需修改核心代码）
3. ✅ 部署简单（15 分钟）
4. ✅ 性能优秀
5. ✅ 已经准备好所有配置文件
6. ✅ 只需要修改文件上传和定时任务

**对比 AWS Amplify 免费层**:
- AWS Amplify 免费层：❌ 不支持 SSR，无法使用
- Vercel 免费层：✅ 完美支持，立即可用

**对比 AWS Amplify Compute**:
- AWS Amplify Compute：$145/月
- Vercel：$0/月
- **节省**: $145/月 × 12 = $1,740/年

---

## 📞 下一步

**告诉我您的选择**:

1. **使用 Vercel**（推荐） - 我可以帮您立即部署
2. **使用 AWS Amplify Compute**（付费） - 我可以提供详细配置
3. **使用 Railway/Render** - 我可以创建配置文件
4. **需要更多信息** - 我可以解答任何问题

---

**创建日期**: 2025-10-25
**建议**: Vercel（免费 + 完美支持）
**不建议**: AWS Amplify 免费层（不支持 SSR）
