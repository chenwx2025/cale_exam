# AWS Amplify 快速部署指南 🚀

**更新日期**: 2025-10-25
**状态**: ✅ 准备就绪

---

## ✅ 你的项目状态

- ✅ Nuxt 配置为 SPA 模式（`ssr: false`）- 可使用 Amplify 免费层
- ✅ 数据库已迁移到 PostgreSQL（AWS RDS）
- ✅ amplify.yml 已优化
- ✅ 依赖项已配置

**现在可以直接部署了！**

---

## 🚀 快速部署（3 步骤）

### 步骤 1: 准备环境变量

你需要准备以下环境变量值：

```bash
# 必需变量
DATABASE_URL="postgresql://user:pass@your-rds-host:5432/cale_exam?schema=public"
JWT_SECRET="生成一个32位以上的随机字符串"
JWT_REFRESH_SECRET="生成另一个32位以上的随机字符串"
NUXT_PUBLIC_API_BASE="https://你的amplify域名.amplifyapp.com"
NODE_ENV="production"

# 可选变量
OPENAI_API_KEY="sk-..."  # 如果使用 AI 功能
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your@email.com"
```

**生成 JWT 密钥：**
```bash
# 运行两次生成两个不同的密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 2: 在 AWS Amplify Console 设置

#### 2.1 创建应用（如果还没有）

1. 访问 [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. 点击 "New app" → "Host web app"
3. 选择你的代码仓库（GitHub/GitLab/Bitbucket）
4. 授权 AWS Amplify 访问你的仓库
5. 选择你的仓库和分支（通常是 `main`）

#### 2.2 配置构建设置

AWS Amplify 会自动检测到 [amplify.yml](amplify.yml)，保持默认即可。

#### 2.3 添加环境变量

在 "Advanced settings" 或部署后在 "Environment variables" 中添加：

```
键                          值
─────────────────────────────────────────────────
DATABASE_URL               postgresql://...
JWT_SECRET                 [你生成的密钥1]
JWT_REFRESH_SECRET         [你生成的密钥2]
NUXT_PUBLIC_API_BASE       https://[你的app-id].amplifyapp.com
NODE_ENV                   production
```

**重要**: 先部署获取 Amplify URL，然后回来设置 `NUXT_PUBLIC_API_BASE`，再重新部署。

### 步骤 3: 部署

1. 点击 "Save and deploy"
2. AWS Amplify 会自动：
   - 克隆你的代码
   - 安装依赖
   - 生成 Prisma Client
   - 构建应用
   - 部署到 CDN

部署过程大约需要 **5-10 分钟**。

---

## 📋 关键配置说明

### 1. 为什么移除了 `prisma migrate deploy`？

因为：
- ✅ 你的 PostgreSQL 数据库已经在 AWS RDS 上运行
- ✅ 数据库 schema 已经存在
- ✅ 只需要 `prisma generate` 生成客户端代码

如果你需要运行迁移，应该：
1. 在本地连接到生产数据库运行
2. 或使用 AWS Lambda 等服务运行一次性迁移

### 2. 输出目录配置

```yaml
artifacts:
  baseDirectory: .output/public  # Nuxt 3 SPA 模式的输出目录
```

因为 `ssr: false`，Nuxt 会生成纯静态文件到 `.output/public`。

### 3. Node.js 版本

```yaml
- nvm install 22
- nvm use 22
```

使用 Node.js 22 以确保与本地开发环境一致。

---

## ⚠️ 重要注意事项

### 1. AWS RDS 安全组配置

确保你的 RDS 安全组允许来自 Amplify 的连接：

**选项 A: 允许所有 IP（简单但不太安全）**
```
入站规则:
类型: PostgreSQL
端口: 5432
来源: 0.0.0.0/0
```

**选项 B: 使用 VPC（更安全）**
- 将 RDS 和 Amplify 配置在同一 VPC 中
- 需要 AWS Amplify 高级配置

### 2. 数据库连接字符串格式

```bash
# 正确格式
postgresql://username:password@host.region.rds.amazonaws.com:5432/database?schema=public

# 如需 SSL（推荐）
postgresql://username:password@host.region.rds.amazonaws.com:5432/database?schema=public&sslmode=require
```

### 3. 环境变量设置时机

**方法 A: 首次部署时设置（推荐）**
- 在 "Advanced settings" 添加所有环境变量
- 一次性完成

**方法 B: 部署后设置**
1. 先部署一次（会失败，但能获得 Amplify URL）
2. 在 App settings → Environment variables 添加变量
3. 使用真实的 Amplify URL 设置 `NUXT_PUBLIC_API_BASE`
4. 重新部署

---

## ✅ 部署后验证

### 1. 检查构建日志

在 Amplify Console:
- 选择你的应用
- Build history → 选择最新构建
- 查看各个阶段的日志

**成功标志**:
```
✔ Provision
✔ Build
✔ Deploy
✔ Verify
```

### 2. 测试应用

访问你的 Amplify URL（格式：`https://[branch].[app-id].amplifyapp.com`）

测试以下功能：
- [ ] 首页加载
- [ ] 用户注册
- [ ] 用户登录
- [ ] API 调用
- [ ] 数据查询

### 3. 检查日志

Amplify Console → Monitoring → Logs

查找：
- 数据库连接错误
- API 错误
- JavaScript 错误

---

## 🐛 常见问题

### 问题 1: 构建失败 - "Cannot find module '@nuxtjs/tailwindcss'"

**原因**: devDependencies 未安装

**解决**: amplify.yml 已配置 `npm install --legacy-peer-deps`（包含 dev 依赖）

### 问题 2: 运行时数据库连接失败

**检查清单**:
- [ ] DATABASE_URL 环境变量已设置
- [ ] RDS 安全组允许入站连接
- [ ] RDS 实例状态为 "Available"
- [ ] 连接字符串格式正确
- [ ] 用户名密码正确

**测试连接**:
```bash
# 本地测试
export DATABASE_URL="你的RDS URL"
npx prisma db pull
```

### 问题 3: 页面空白或 404

**可能原因**:
- baseDirectory 配置错误（已修复为 `.output/public`）
- 路由配置问题

**检查**:
- 访问 `/index.html` 看是否能加载
- 检查浏览器控制台错误
- 查看 Amplify 部署的文件列表

### 问题 4: API 路由 404

**原因**: Amplify 静态托管不支持服务端 API 路由

**解决方案**:

因为你的应用是 SPA 模式（`ssr: false`），Nuxt API 路由会被编译为无服务器函数。

**需要配置重定向规则**:

在 Amplify Console → App settings → Rewrites and redirects:
```
源地址: /api/<*>
目标地址: /api/<*>
类型: 200 (Rewrite)
```

或在 amplify.yml 添加：
```yaml
  customHeaders:
    - pattern: '/api/**'
      headers:
        - key: 'Access-Control-Allow-Origin'
          value: '*'
```

---

## 💡 优化建议

### 1. 启用缓存

Amplify 会自动缓存静态资源，但你可以优化：

在 Amplify Console → App settings → Caching:
- 启用 "Instant cache invalidation"
- 设置 TTL（建议 300 秒）

### 2. 设置自定义域名

1. App settings → Domain management
2. 添加你的域名
3. 配置 DNS（CNAME 或 A 记录）
4. 等待 SSL 证书生成（自动）

### 3. 启用分支部署

- `main` 分支 → 生产环境
- `dev` 分支 → 开发环境
- PR → 预览部署

### 4. 配置通知

App settings → Notifications:
- 构建成功/失败通知
- Email 或 Slack 集成

---

## 📊 成本估算（AWS 免费层）

因为你的应用是 SPA（`ssr: false`），可以使用 **Amplify Hosting 免费层**：

| 项目 | 免费额度 | 超出后价格 |
|------|---------|-----------|
| 构建时间 | 1000 分钟/月 | $0.01/分钟 |
| 存储 | 15 GB | $0.023/GB |
| 流量 | 15 GB/月 | $0.15/GB |
| 托管 | 免费 | 免费 |

**预估月成本**: $0（在免费额度内）

**注意**: RDS PostgreSQL 需要单独付费（约 $15-30/月，取决于实例类型）

---

## 🔗 有用的链接

- [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [Amplify 文档](https://docs.aws.amazon.com/amplify/)
- [你的现有文档](AWS_AMPLIFY_DEPLOYMENT_CHECKLIST.md)
- [免费层分析](AWS_AMPLIFY_FREE_TIER_ANALYSIS.md)

---

## 🎯 部署后清单

- [ ] 应用成功部署
- [ ] 用户认证功能正常
- [ ] 数据库连接正常
- [ ] API 路由工作正常
- [ ] 设置自定义域名（可选）
- [ ] 配置构建通知
- [ ] 启用分支部署
- [ ] 配置监控和告警

---

## 📞 需要帮助？

**构建失败**:
1. 查看 Build logs
2. 检查环境变量
3. 验证 amplify.yml 配置

**运行时错误**:
1. 查看 Monitoring → Logs
2. 检查浏览器控制台
3. 验证 RDS 连接

**AWS 支持**:
- [AWS Support Center](https://console.aws.amazon.com/support/)
- [Amplify Discord](https://discord.gg/amplify)

---

**准备好了就开始部署吧！** 🚀

**下一步**: 访问 [AWS Amplify Console](https://console.aws.amazon.com/amplify/) 开始部署
