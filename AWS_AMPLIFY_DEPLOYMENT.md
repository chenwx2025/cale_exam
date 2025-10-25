# AWS Amplify 部署指南

## 🚀 快速开始

AWS Amplify 为全栈应用提供简单的部署方案，支持自动构建和部署。

---

## 📋 前提条件

1. **AWS 账户** - [注册 AWS](https://aws.amazon.com/)
2. **Git 仓库** - 代码托管在 GitHub/GitLab/Bitbucket
3. **数据库** - PostgreSQL 数据库（推荐使用 AWS RDS）

---

## 🔧 第一步：准备代码

### 1. 确认文件已创建
✅ `amplify.yml` - Amplify 构建配置（已创建）
✅ `.env.example` - 环境变量模板（已创建）

### 2. 推送代码到 Git
```bash
git add .
git commit -m "Prepare for AWS Amplify deployment"
git push origin main
```

---

## 🗄️ 第二步：设置数据库

### 选项 A: 使用 AWS RDS（推荐）

1. **创建 RDS PostgreSQL 实例**
   - 登录 AWS Console
   - 进入 RDS 服务
   - 点击 "Create database"
   - 选择 PostgreSQL
   - 选择实例类型（开发环境可选 db.t3.micro）
   - 设置数据库名称、用户名、密码
   - 注意记录连接信息

2. **安全组配置**
   - 允许来自 Amplify 的连接
   - 添加入站规则：PostgreSQL (5432)

3. **获取连接字符串**
   ```
   postgresql://username:password@endpoint:5432/database_name
   ```

### 选项 B: 使用其他数据库服务

也可以使用：
- [Supabase](https://supabase.com/) - 提供免费的 PostgreSQL
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Railway](https://railway.app/) - 简单的数据库托管

---

## ☁️ 第三步：在 Amplify 创建应用

### 1. 进入 Amplify Console
- 登录 [AWS Amplify Console](https://console.aws.amazon.com/amplify)
- 点击 "New app" > "Host web app"

### 2. 连接 Git 仓库
1. 选择 Git 提供商（GitHub/GitLab/Bitbucket）
2. 授权 AWS Amplify 访问您的仓库
3. 选择您的仓库和分支（通常是 main 或 master）
4. 点击 "Next"

### 3. 配置构建设置
Amplify 会自动检测 `amplify.yml` 文件。

**如果需要自定义，可以编辑构建配置：**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --legacy-peer-deps
        - npx prisma generate
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .output/public
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
backend:
  phases:
    preBuild:
      commands:
        - npx prisma migrate deploy
```

### 4. 高级设置
- **App name**: cale-exam
- **Environment name**: production
- 勾选 "Enable SSR" (如果有此选项)

---

## 🔐 第四步：配置环境变量

在 Amplify Console 中：

1. 进入应用 > "Environment variables"
2. 添加以下环境变量：

### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT 密钥（32+ 字符） | `your-random-32-char-string-here` |
| `JWT_REFRESH_SECRET` | 刷新令牌密钥 | `another-random-32-char-string` |
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-...` |
| `NODE_ENV` | 环境 | `production` |

### 可选的环境变量（邮件功能）

| 变量名 | 说明 |
|--------|------|
| `SMTP_HOST` | SMTP 服务器 |
| `SMTP_PORT` | SMTP 端口 |
| `SMTP_USER` | SMTP 用户名 |
| `SMTP_PASS` | SMTP 密码 |
| `SMTP_FROM` | 发件人邮箱 |

### 生成随机密钥
```bash
# 在本地生成随机字符串
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 第五步：部署

1. 点击 "Save and deploy"
2. Amplify 会自动开始构建
3. 构建过程大约需要 5-10 分钟

### 监控构建进度
- **Provision**: 准备环境
- **Build**: 执行构建命令
- **Deploy**: 部署到 CDN
- **Verify**: 验证部署

---

## ✅ 第六步：验证部署

### 1. 访问应用
构建完成后，Amplify 会提供一个 URL：
```
https://main.xxxxxx.amplifyapp.com
```

### 2. 测试核心功能
- [ ] 首页能正常访问
- [ ] 用户登录功能
- [ ] 创建学习计划（测试即时显示）
- [ ] API 端点正常响应
- [ ] 数据库连接正常

### 3. 查看日志
在 Amplify Console：
- "Build logs" - 查看构建日志
- "Runtime logs" - 查看运行时日志（如果启用了 SSR）

---

## 🔄 自动部署

Amplify 会自动监听 Git 仓库的变化：

1. **代码推送自动部署**
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Amplify 会自动：**
   - 检测到代码变化
   - 拉取最新代码
   - 执行构建
   - 部署新版本

3. **回滚**
   - 在 Amplify Console 可以快速回滚到之前的版本
   - 点击特定构建 > "Redeploy this version"

---

## 🌍 自定义域名（可选）

### 1. 添加自定义域名
1. 在 Amplify Console > "Domain management"
2. 点击 "Add domain"
3. 输入您的域名（如 `example.com`）

### 2. 配置 DNS
根据 Amplify 提供的说明，在您的域名提供商处添加：
- CNAME 记录或
- ANAME/ALIAS 记录

### 3. SSL 证书
Amplify 会自动提供和管理 SSL 证书（通过 AWS Certificate Manager）

---

## 📊 监控和日志

### CloudWatch 集成
Amplify 自动将日志发送到 CloudWatch：

1. **访问日志**
   - AWS Console > CloudWatch
   - 查找 Amplify 应用的日志组

2. **设置告警**
   - 在 CloudWatch 创建告警
   - 监控错误率、响应时间等

### 应用监控
考虑添加：
- AWS X-Ray（分布式追踪）
- CloudWatch Application Insights
- 第三方服务（如 Sentry）

---

## 💰 成本估算

### Amplify 定价
- **构建时间**: $0.01 per build minute
- **托管**: $0.15 per GB stored, $0.15 per GB served
- **SSR 请求**: $0.30 per GB-second

### 示例月度成本（小型应用）
- 构建: ~10 次/月，5 分钟/次 = $0.50
- 托管: ~1 GB = $0.15
- 流量: ~10 GB = $1.50
- **总计**: ~$2-5/月

### RDS 成本（额外）
- db.t3.micro: ~$15-20/月
- 或使用 Supabase 免费层

---

## ⚠️ 常见问题

### 构建失败

1. **检查构建日志**
   ```
   Amplify Console > Builds > 选择失败的构建 > View logs
   ```

2. **常见原因**
   - 环境变量未设置
   - Node.js 版本不匹配
   - 依赖安装失败

3. **解决方法**
   ```yaml
   # 在 amplify.yml 中指定 Node.js 版本
   frontend:
     phases:
       preBuild:
         commands:
           - nvm use 18
           - npm ci --legacy-peer-deps
   ```

### 数据库连接失败

1. **检查 DATABASE_URL**
   - 确保格式正确
   - 确保数据库可以从外部访问

2. **RDS 安全组**
   - 允许来自任何地方的连接（开发环境）
   - 或添加 Amplify NAT Gateway IP

### SSR 功能不工作

1. **确认 Amplify 支持 SSR**
   - 某些 Amplify 版本可能不完全支持 Nuxt 3 SSR
   - 考虑使用静态生成（SSG）或客户端渲染（CSR）

2. **替代方案**
   ```bash
   # 生成静态站点
   npm run generate
   
   # 修改 amplify.yml
   artifacts:
     baseDirectory: .output/public
   ```

---

## 🔧 优化建议

### 1. 启用缓存
在 `amplify.yml` 中已配置缓存：
```yaml
cache:
  paths:
    - node_modules/**/*
    - .nuxt/**/*
```

### 2. 使用 CDN
Amplify 自动使用 CloudFront CDN

### 3. 图片优化
- 使用 AWS S3 存储图片
- 配置 CloudFront 图片优化

### 4. 环境分离
创建多个环境：
- `main` 分支 → production
- `dev` 分支 → development
- `staging` 分支 → staging

---

## 📱 移动应用支持

Amplify 也支持 React Native/Flutter：
1. 使用相同的后端 API
2. 可以共享环境变量
3. 统一的部署流程

---

## 🔒 安全最佳实践

1. **环境变量**
   - 永远不要在代码中硬编码密钥
   - 使用 Amplify 的环境变量功能

2. **访问控制**
   - 使用 IAM 角色限制权限
   - 启用 MFA

3. **数据库安全**
   - 使用强密码
   - 定期轮换密钥
   - 启用 SSL 连接

4. **监控**
   - 启用 CloudWatch 告警
   - 监控异常访问
   - 定期审查日志

---

## 📚 相关资源

- [AWS Amplify 文档](https://docs.amplify.aws/)
- [Nuxt 3 部署指南](https://nuxt.com/docs/getting-started/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)

---

## ✅ 部署检查清单

部署前：
- [ ] 代码已推送到 Git
- [ ] `amplify.yml` 文件已创建
- [ ] `.env.example` 已创建
- [ ] 数据库已准备好

部署时：
- [ ] 在 Amplify 创建应用
- [ ] 连接 Git 仓库
- [ ] 配置环境变量
- [ ] 执行首次部署

部署后：
- [ ] 访问应用 URL
- [ ] 测试核心功能
- [ ] 检查日志无错误
- [ ] 配置自定义域名（可选）
- [ ] 设置监控和告警

---

## 🎉 完成！

您的应用现在运行在 AWS Amplify 上，享受：
- ✅ 自动 CI/CD
- ✅ 全球 CDN 加速
- ✅ 自动 SSL 证书
- ✅ 简单的环境管理
- ✅ 内置监控

**祝部署顺利！** 🚀

---

## 💡 获取帮助

如遇问题：
1. 查看 Amplify Console 的构建日志
2. 检查 CloudWatch 日志
3. 参考 AWS Amplify 文档
4. 联系 AWS 支持

