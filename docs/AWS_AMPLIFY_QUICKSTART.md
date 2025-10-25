# AWS Amplify 快速部署指南

5 分钟快速部署您的中医考试系统到 AWS Amplify。

## 🎯 准备工作（5 分钟）

### 1. 准备数据库

您有两个选择：

#### 选项 A：Supabase（推荐，完全免费）

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册并创建新项目
3. 等待项目初始化（约 2 分钟）
4. 获取数据库连接字符串：
   - 左侧菜单 → Settings → Database
   - Connection string → URI
   - 复制连接字符串（格式：`postgresql://postgres:[password]@[host]:5432/postgres`）

#### 选项 B：AWS RDS（12 个月免费）

1. 访问 AWS RDS 控制台
2. 创建数据库：
   - 引擎：PostgreSQL 14
   - 模板：**Free tier**
   - 实例标识符：`cale-exam-db`
   - 主用户名：`postgres`
   - 设置主密码
   - 公开访问：**是**
   - VPC 安全组：创建新的，允许 PostgreSQL (5432)
3. 等待创建完成（约 5 分钟）
4. 记录端点地址

**RDS 连接字符串格式**：
```
postgresql://postgres:[您的密码]@[端点地址]:5432/cale_exam
```

### 2. 生成 JWT 密钥

在本地终端运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的字符串（类似：`a1b2c3d4e5f6...`）

---

## 🚀 部署到 AWS Amplify（5 分钟）

### 步骤 1：推送代码到 GitHub

如果还没有推送代码：

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/cale_exam.git
git push -u origin main
```

### 步骤 2：在 AWS Amplify 创建应用

1. **访问 AWS Amplify 控制台**
   - 登录 [AWS 控制台](https://console.aws.amazon.com)
   - 搜索 "Amplify"
   - 点击 "Get Started" 或 "New app"

2. **连接仓库**
   - 选择 "Host web app"
   - 选择 "GitHub"
   - 点击 "Continue"
   - 授权 AWS Amplify 访问您的 GitHub
   - 选择仓库：`cale_exam`
   - 选择分支：`main`
   - 点击 "Next"

3. **配置应用设置**
   - App name: `cale-exam`
   - Environment: `production`
   - 点击 "Advanced settings" 展开

4. **添加环境变量**

   点击 "Add environment variable"，添加以下变量：

   | Key | Value | 说明 |
   |-----|-------|------|
   | `DATABASE_URL` | `postgresql://postgres:...` | 数据库连接字符串 |
   | `JWT_SECRET` | 刚才生成的密钥 | JWT 加密密钥 |
   | `ADMIN_PASSWORD` | 您的管理员密码 | 首次登录密码 |
   | `NODE_ENV` | `production` | 生产环境 |

   **重要提示**：
   - `DATABASE_URL` 使用您在步骤 1 获取的数据库连接字符串
   - `JWT_SECRET` 使用刚才生成的 32 位随机字符串
   - `ADMIN_PASSWORD` 设置一个强密码（至少 12 位）

5. **配置构建设置**

   Amplify 会自动检测到 `amplify.yml` 文件并使用它。

   如果没有自动检测，手动输入：

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
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
   ```

6. **开始部署**
   - 点击 "Save and deploy"
   - 等待构建完成（约 5-10 分钟）

### 步骤 3：运行数据库迁移

**首次部署完成后**，需要初始化数据库。

#### 方法 1：在本地运行（推荐）

```bash
# 在本地项目目录
# 使用生产数据库 URL 运行迁移
DATABASE_URL="postgresql://postgres:..." npx prisma migrate deploy

# 运行数据填充（可选）
DATABASE_URL="postgresql://postgres:..." npx prisma db seed
```

#### 方法 2：更新构建配置

1. 在 Amplify 控制台点击 "Build settings"
2. 更新 `amplify.yml`，在 `preBuild` 部分添加：
   ```yaml
   preBuild:
     commands:
       - npm ci
       - npx prisma generate
       - npx prisma migrate deploy  # 添加这行
   ```
3. 重新部署

### 步骤 4：访问应用

部署成功后：

1. Amplify 会显示应用 URL（格式：`https://main.xxxxxx.amplifyapp.com`）
2. 点击 URL 访问应用
3. 使用以下凭据登录：
   - 用户名：`admin`
   - 密码：您设置的 `ADMIN_PASSWORD`

---

## ✅ 部署成功检查清单

- [ ] 应用可以访问（URL 加载成功）
- [ ] 可以使用 `admin` 和您设置的密码登录
- [ ] 可以创建考试
- [ ] 可以添加题目
- [ ] 可以参加考试并提交
- [ ] 知识点页面显示正常

如果以上都正常，恭喜您部署成功！🎉

---

## 🔧 常见问题

### 问题 1：构建失败 "Cannot find module '@prisma/client'"

**原因**：Prisma Client 未生成

**解决**：
- 确认 `amplify.yml` 中包含 `npx prisma generate`
- 在 Amplify 控制台 → Build settings → 编辑 `amplify.yml`
- 重新部署

### 问题 2：应用启动后显示 "Database connection failed"

**原因**：数据库连接字符串错误或数据库无法访问

**解决**：
1. 检查 `DATABASE_URL` 环境变量是否正确
2. 如果使用 RDS，确认安全组允许外部访问（端口 5432）
3. 如果使用 Supabase，确认项目未暂停

### 问题 3：无法登录管理员账号

**原因**：数据库未初始化或密码错误

**解决**：
1. 确认已运行 `npx prisma migrate deploy`
2. 检查 `ADMIN_PASSWORD` 环境变量
3. 尝试重新部署

### 问题 4：应用很慢或经常超时

**原因**：
- 冷启动（长时间无访问）
- 数据库在其他区域（网络延迟）

**解决**：
1. 等待几次访问后会变快（Amplify 自动扩展）
2. 确保 RDS 与 Amplify 在同一区域（如 us-east-1）
3. 考虑升级到 AWS Amplify Compute（付费）

### 问题 5：部署成功但页面显示 404

**原因**：Nuxt 3 SSR 路由配置问题

**解决**：
1. 检查 `amplify.yml` 中 `baseDirectory` 是否为 `.output/public`
2. 确认 `npm run build` 成功完成
3. 查看构建日志查找错误

---

## 🔄 后续更新

每次更新代码后：

```bash
# 推送代码到 GitHub
git add .
git commit -m "更新功能"
git push origin main

# Amplify 自动重新部署 ✨
# 无需其他操作！
```

---

## 📊 监控和日志

### 查看构建日志

1. Amplify 控制台 → 您的应用
2. 左侧菜单 → "Build history"
3. 点击具体构建查看详细日志

### 查看应用日志

1. Amplify 控制台 → 您的应用
2. 左侧菜单 → "Monitoring"
3. 可以看到访问量、错误率等指标

### 设置告警

1. Amplify 控制台 → 您的应用
2. 左侧菜单 → "Alarms"
3. 创建告警规则（如：错误率 > 5%）

---

## 🌐 自定义域名（可选）

### 添加自定义域名

1. Amplify 控制台 → 您的应用
2. 左侧菜单 → "Domain management"
3. 点击 "Add domain"
4. 输入您的域名（如：`exam.yourdomain.com`）
5. 按照指示在域名注册商处添加 DNS 记录
6. 等待 SSL 证书自动配置（约 15 分钟）

**DNS 配置示例**（根据 Amplify 显示的值）：
```
类型: CNAME
名称: exam
值: xxxxx.cloudfront.net
```

---

## 💰 成本预估

### 完全免费方案

- **AWS Amplify 免费额度**：
  - 1000 构建分钟/月
  - 15GB 托管流量/月
  - 足够个人项目使用

- **Supabase 免费版**：
  - 500MB 数据库
  - 无限 API 请求
  - 1GB 文件存储

**总计**：**$0/月**（在免费额度内）

### 超出免费额度后

- **Amplify**：
  - 构建：$0.01/分钟
  - 托管流量：$0.15/GB
  - 预计：$5-15/月

- **Supabase Pro**：$25/月

**总计**：约 $5-40/月

---

## 🎓 下一步

部署成功后，您可以：

1. **配置自定义域名**（见上文）
2. **设置定时任务**（使用 AWS Lambda + EventBridge）
3. **配置文件上传**（使用 AWS S3）
4. **添加监控告警**（使用 CloudWatch）
5. **优化性能**（使用 CloudFront CDN）

详细信息请参考：
- [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) - 完整 AWS 部署指南
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 通用部署指南

---

## 🆘 需要帮助？

- **AWS Amplify 文档**：https://docs.amplify.aws/
- **Supabase 文档**：https://supabase.com/docs
- **Nuxt 3 部署**：https://nuxt.com/docs/getting-started/deployment

遇到问题？查看 [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) 的故障排除部分。
