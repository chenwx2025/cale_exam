# 🚀 AWS Amplify 部署 - 准备就绪

**状态**: ✅ 所有准备工作已完成
**日期**: 2025-10-25

---

## ✅ 已完成检查

| 项目 | 状态 | 说明 |
|------|------|------|
| amplify.yml 配置 | ✅ | Node 22, npm install, Prisma generate |
| 本地构建测试 | ✅ | 构建成功，无阻塞错误 |
| 输出目录验证 | ✅ | .output 目录结构正确 |
| 环境变量文档 | ✅ | 所有必需变量已记录 |
| JWT 密钥生成 | ✅ | 已生成并记录 |

---

## ⚠️ 重要提醒

### AWS Amplify 类型选择

部署时**必须选择**：
- ✅ **"Server-side rendered (SSR)"** 或 **"Compute"**
- ❌ 不要选择 "Static web hosting"（免费层，但不支持 SSR）

### 成本

- **AWS Amplify Compute**: ~$145/月
- **数据库（Supabase）**: $0/月（免费层）
- **OpenAI API**: ~$5-20/月
- **总计**: **~$150-165/月**

---

## 📋 环境变量（复制备用）

```bash
# 必需变量
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb
JWT_REFRESH_SECRET=725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=production

# 可选变量（邮件功能）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

---

## 🚀 快速部署步骤

### 1. 推送代码
```bash
git add .
git commit -m "准备 AWS Amplify 部署"
git push origin main
```

### 2. AWS Console
1. 访问：https://console.aws.amazon.com/amplify
2. "New app" > "Host web app"
3. 连接 Git 仓库（GitHub/GitLab/Bitbucket）
4. 选择 `cale_exam` 仓库 > `main` 分支

### 3. 配置
1. **App type**: 选择 **"SSR"** 或 **"Compute"** ⚠️
2. 添加环境变量（见上方）
3. "Save and deploy"

### 4. 等待部署（5-10 分钟）

### 5. 运行数据库迁移
```bash
export DATABASE_URL="your-production-database-url"
npx prisma migrate deploy
```

---

## 📚 详细文档

- **[AWS_AMPLIFY_DEPLOYMENT_CHECKLIST.md](AWS_AMPLIFY_DEPLOYMENT_CHECKLIST.md)** - 完整部署指南
- **[amplify.yml](amplify.yml)** - 构建配置文件
- **[AMPLIFY_BUILD_FIX.md](AMPLIFY_BUILD_FIX.md)** - 构建错误修复说明
- **[AWS_AMPLIFY_FREE_TIER_ANALYSIS.md](AWS_AMPLIFY_FREE_TIER_ANALYSIS.md)** - 免费层限制分析

---

## ⚠️ 部署后需要修改的功能

### 1. 文件上传（优先级：高）
**问题**: Amplify 文件系统只读
**解决方案**: 使用 Supabase Storage 或 AWS S3
**工作量**: 2-3 小时

### 2. 定时任务（优先级：中）
**问题**: Serverless 不支持持续运行的 cron
**解决方案**: 使用 AWS EventBridge 或 GitHub Actions
**工作量**: 1-2 小时

---

## 💡 替代方案（如果预算有限）

### Vercel（推荐）- 免费

- **成本**: $0/月
- **SSR 支持**: ✅ 完美
- **配置**: 已准备好所有文件
- **部署时间**: 15 分钟

参考：[VERCEL_QUICK_START.md](VERCEL_QUICK_START.md)

**成本对比**:
- AWS Amplify: ~$150/月
- Vercel: $0/月
- **节省**: $1,800/年

---

## ✅ 现在可以开始部署！

所有准备工作已完成，您可以立即开始 AWS Amplify 部署。

**需要帮助？** 查看详细文档或告诉我遇到的任何问题。

---

**创建日期**: 2025-10-25
**准备时间**: 已完成
**可以部署**: ✅ 是
