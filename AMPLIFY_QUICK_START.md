# AWS Amplify 部署快速开始

## ✅ 已准备就绪的文件

- ✅ `amplify.yml` - Amplify 构建配置
- ✅ `.env.example` - 环境变量模板
- ✅ `prisma/schema.prisma` - 数据库架构
- ✅ 项目已构建成功

## 🚀 5 步部署到 AWS Amplify

### 步骤 1: 推送代码到 Git（如果还没有）

```bash
# 如果还没有推送最新代码
git add .
git commit -m "准备 AWS Amplify 部署"
git push origin main
```

### 步骤 2: 准备数据库

**推荐选项 - Supabase（免费）:**
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取 PostgreSQL 连接字符串：
   - 项目设置 > Database > Connection string > URI
   - 格式：`postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

**或使用 AWS RDS:**
1. 在 AWS Console 创建 RDS PostgreSQL 实例
2. 记录连接信息

### 步骤 3: 在 AWS Amplify 创建应用

1. **登录 AWS Console**
   - 访问 [console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify)
   - 点击 "New app" > "Host web app"

2. **连接 Git 仓库**
   - 选择 GitHub/GitLab/Bitbucket
   - 授权并选择您的仓库
   - 选择分支（通常是 main）

3. **构建设置**
   - Amplify 会自动检测到 `amplify.yml`
   - 应用名称：cale-exam
   - 点击 "Next"

### 步骤 4: 配置环境变量

在 Amplify Console > Environment variables 添加：

#### 必需变量

```bash
# 数据库
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT 密钥（生成32位随机字符串）
JWT_SECRET=your-random-32-char-secret-here
JWT_REFRESH_SECRET=your-random-32-char-refresh-secret-here

# OpenAI API（用于 AI 功能）
OPENAI_API_KEY=sk-your-openai-api-key

# 环境
NODE_ENV=production
```

#### 可选变量（邮件功能）

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

**生成随机密钥:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 5: 部署

1. 点击 "Save and deploy"
2. 等待 5-10 分钟完成构建
3. 获取应用 URL：`https://main.xxxxxx.amplifyapp.com`

## 🧪 部署后测试

访问您的应用 URL 并测试：

- [ ] 首页加载正常
- [ ] 用户注册/登录
- [ ] 创建学习计划（立即显示）
- [ ] 创建个人笔记（立即显示）
- [ ] 学习小组功能
- [ ] 讨论区发帖

## 🔄 自动部署

现在每次推送代码到 main 分支，Amplify 会自动：
1. 检测代码变化
2. 运行构建
3. 部署新版本

```bash
# 开发流程
git add .
git commit -m "更新功能"
git push origin main
# Amplify 会自动部署！
```

## ⚠️ 常见问题

### 构建失败？

1. **查看构建日志**
   - Amplify Console > 选择失败的构建 > "View logs"

2. **常见错误及解决方法：**

   - **数据库连接失败**
     ```
     检查 DATABASE_URL 格式是否正确
     确保数据库允许外部连接
     ```

   - **Prisma 迁移失败**
     ```
     确保数据库为空或已有正确的表结构
     可能需要手动运行迁移
     ```

   - **环境变量未设置**
     ```
     检查所有必需的环境变量是否已添加
     ```

### 应用运行缓慢？

1. 检查数据库位置（建议使用同区域）
2. 考虑升级 Amplify 实例类型
3. 检查 CloudWatch 日志

### 如何查看日志？

- **构建日志**: Amplify Console > Builds > 选择构建
- **运行时日志**: Amplify Console > Monitoring > Logging

## 💰 成本估算

### 小型应用（预估）
- 构建: 10次/月 × 5分钟 × $0.01/分钟 = **$0.50**
- 托管: ~1 GB 存储 = **$0.15**
- 流量: ~10 GB = **$1.50**
- **月度总计**: ~$2-5

### Supabase 数据库
- 免费层: 500 MB 数据库，够用！
- 如果需要更多: $25/月（8GB 数据库）

### AWS RDS（如果使用）
- db.t3.micro: ~$15-20/月

## 📚 完整文档

详细部署指南请参考：
- `AWS_AMPLIFY_DEPLOYMENT.md` - 完整部署指南（400+ 行）
- `PRE_PUBLISH_CHECKLIST.md` - 发布前检查清单
- `DEPLOYMENT.md` - 通用部署指南

## 🔐 安全提醒

- ✅ 不要在代码中硬编码密钥
- ✅ 使用 Amplify 环境变量功能
- ✅ 定期轮换 JWT 密钥
- ✅ 使用强数据库密码
- ✅ 启用数据库 SSL 连接

## 🎉 完成！

部署完成后，您的应用将：
- ✅ 自动 CI/CD（推送即部署）
- ✅ 全球 CDN 加速
- ✅ 自动 SSL 证书
- ✅ 99.9% 可用性保证

**祝部署顺利！** 🚀

---

**创建日期**: 2025-10-25
**状态**: 准备就绪
