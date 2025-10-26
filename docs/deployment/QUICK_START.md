# 🚀 快速部署指南 - Vercel + Supabase

**更新**: 2025-10-26
**状态**: ✅ 全新部署（无需数据迁移）

---

## 📝 重要说明

- ✨ **这是全新部署**，不需要从 AWS RDS 迁移数据
- ⚡ **只需 3 步**，30 分钟完成
- 💰 **完全免费**（使用免费层）

---

## 第 1 步：创建 Supabase 项目 (10 分钟)

### 1.1 注册/登录 Supabase

访问: https://supabase.com

点击 "Start your project" → "New project"

### 1.2 创建项目

填写信息：
- **Name**: `cale-exam`（或你喜欢的名称）
- **Database Password**: 设置一个强密码（**务必保存！**）
- **Region**: 选择 `Singapore` 或 `Tokyo`（距离中国最近）
- **Pricing Plan**: Free（免费）

点击 "Create new project"，等待 2-3 分钟初始化。

### 1.3 获取数据库连接信息

项目创建后：

1. 点击左侧 "Project Settings" (齿轮图标)
2. 点击 "Database"
3. 找到 "Connection string" → "URI"
4. 复制连接字符串，格式类似：
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

### 1.4 修改连接字符串

**重要**: 必须添加 `?pgbouncer=true&schema=public` 到连接字符串末尾：

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```

**示例**:
```
postgresql://postgres.abcdefghij:MyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```

---

## 第 2 步：初始化数据库 (5 分钟)

### 2.1 更新本地 .env 文件

用文本编辑器打开项目的 `.env` 文件，更新 DATABASE_URL：

```bash
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```

**注意**:
- 替换 `[PROJECT-REF]` 为你的实际项目引用
- 替换 `[YOUR-PASSWORD]` 为你在 Supabase 设置的密码
- **不要**用引号包裹

### 2.2 创建数据库表

在项目目录运行以下命令：

```bash
# 生成 Prisma Client
npx prisma generate

# 创建所有数据库表
npx prisma db push
```

**期望输出**:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

### 2.3 验证表已创建

回到 Supabase 控制台：
1. 点击左侧 "Table Editor"
2. 应该看到所有表：`User`, `Question`, `Exam`, `ExamAttempt`, 等

✅ **数据库准备完成！**

---

## 第 3 步：部署到 Vercel (15 分钟)

### 3.1 访问 Vercel

打开: https://vercel.com/new

### 3.2 导入 Git 仓库

1. 选择 "Import Git Repository"
2. 如果没有连接 GitHub，点击 "Continue with GitHub"
3. 找到你的仓库: `shxld/cale_exam`
4. 点击 "Import"

### 3.3 配置项目

**Framework Preset**: 应该自动检测为 "Nuxt.js"

**Root Directory**: `.` (保持默认)

**Build Command**: 保持默认或使用:
```
npx prisma generate && npm run build
```

**Install Command**:
```
npm install --legacy-peer-deps
```

### 3.4 配置环境变量（关键步骤！）

点击 "Environment Variables"，添加以下变量：

#### 必需变量（7 个）

| Key | Value | 说明 |
|-----|-------|------|
| `DATABASE_URL` | `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@...?pgbouncer=true&schema=public` | 你的 Supabase 连接字符串 |
| `JWT_SECRET` | `3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379` | JWT 令牌密钥 |
| `JWT_REFRESH_SECRET` | `8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559` | JWT 刷新令牌密钥 |
| `NODE_ENV` | `production` | 环境模式 |
| `APP_NAME` | `Cale加州中医考试系统` | 应用名称 |
| `APP_URL` | `https://placeholder.vercel.app` | 先用占位符，部署后更新 |
| `NUXT_PUBLIC_API_BASE` | `https://placeholder.vercel.app` | 先用占位符，部署后更新 |

**重要提示**:
- ✅ 每个变量前面有 ✓ 标记才算添加成功
- ✅ DATABASE_URL 必须包含 `?pgbouncer=true&schema=public`
- ✅ APP_URL 和 NUXT_PUBLIC_API_BASE 稍后会更新

### 3.5 开始部署

点击 "Deploy" 按钮。

**部署时间**: 约 3-5 分钟

你会看到：
- ✓ Cloning repository
- ✓ Installing dependencies
- ✓ Building application
- ✓ Uploading build outputs
- ✓ Deployment ready

### 3.6 更新 URL 环境变量（重要！）

部署成功后：

1. 复制你的 Vercel URL，例如: `https://cale-exam-abc123.vercel.app`

2. 进入 Vercel 项目 → "Settings" → "Environment Variables"

3. 找到 `APP_URL`：
   - 点击右侧的 "⋯" (三个点)
   - 点击 "Edit"
   - 更新为你的实际 URL: `https://cale-exam-abc123.vercel.app`
   - 点击 "Save"

4. 找到 `NUXT_PUBLIC_API_BASE`：
   - 同样的操作
   - 更新为你的实际 URL: `https://cale-exam-abc123.vercel.app`
   - 点击 "Save"

5. **重新部署**:
   - 返回 "Deployments" 标签页
   - 点击最新的部署右侧的 "⋯"
   - 选择 "Redeploy"
   - 点击确认

等待 2-3 分钟重新部署完成。

---

## ✅ 部署完成检查

### 访问你的应用

打开你的 Vercel URL: `https://cale-exam-abc123.vercel.app`

### 测试基本功能

- [ ] 首页加载正常
- [ ] 可以看到"注册"和"登录"按钮
- [ ] 点击"注册"，填写信息并成功注册
- [ ] 使用注册的账号登录
- [ ] 可以看到题库或考试列表
- [ ] 点击一个题目，可以正常答题

如果以上都能正常工作，**恭喜你，部署成功！** 🎉

---

## 🐛 故障排除

### 问题 1: 部署失败，提示 "Could not load @nuxtjs/tailwindcss"

**不用担心！** 这是已知的本地依赖问题，但 Vercel 会重新安装依赖，不会有这个问题。

### 问题 2: 部署成功但访问页面 404

**解决方法**:
1. 等待 2-3 分钟（部署需要时间传播）
2. 检查 vercel.json 是否存在于项目根目录
3. 查看 Vercel 构建日志，确认构建成功

### 问题 3: 页面加载但 API 请求失败

**检查**:
1. Vercel → Settings → Environment Variables
2. 确认 `DATABASE_URL` 正确
3. 确认 `APP_URL` 和 `NUXT_PUBLIC_API_BASE` 已更新为实际 URL
4. 如果刚更新了环境变量，需要重新部署

### 问题 4: 数据库连接错误

**检查**:
1. DATABASE_URL 格式必须是:
   ```
   postgresql://postgres.[REF]:[PASSWORD]@...?pgbouncer=true&schema=public
   ```
2. 确保包含 `?pgbouncer=true&schema=public`
3. 密码中的特殊字符需要 URL 编码（如 `@` → `%40`）

### 问题 5: 定时任务不工作

**说明**:
- Vercel 免费层的 Serverless Functions 有 10 秒超时限制
- 定时任务会在首次 API 调用时触发
- 查看日志: Vercel → Deployments → View Function Logs

### 查看详细日志

1. 进入 Vercel 项目
2. 点击 "Deployments"
3. 选择最新的部署
4. 点击 "View Function Logs"
5. 查看错误信息

---

## 📊 Vercel 免费层限制

### 你目前的用量预估：

- **带宽**: 100 GB/月 免费
  - 预计使用: < 5 GB/月 ✅

- **执行时间**: 100 小时/月 免费
  - 预计使用: < 10 小时/月 ✅

- **函数调用**: 无限制（但有超时限制）

### Supabase 免费层限制：

- **数据库大小**: 500 MB 免费
  - 预计使用: < 100 MB ✅

- **数据传输**: 1 GB/月 免费
  - 预计使用: < 500 MB/月 ✅

**结论**: 初期使用完全免费！ 💰

---

## 🎯 总结

### 你已完成：

✅ 创建 Supabase 项目
✅ 初始化数据库（创建所有表）
✅ 部署到 Vercel
✅ 配置所有环境变量
✅ 应用正常运行

### 成本：

💵 **$0/月**（使用免费层）

### 性能：

⚡ **全球 CDN**（Vercel Edge Network）
⚡ **快速数据库**（Supabase PostgreSQL）
⚡ **自动扩展**（Serverless）

---

## 📚 相关文档

- [VERCEL_SUPABASE_DEPLOYMENT.md](VERCEL_SUPABASE_DEPLOYMENT.md) - 完整详细文档
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - 部署总结
- [CONFIGURATION_CHECKLIST.md](CONFIGURATION_CHECKLIST.md) - 配置清单

---

## 🔗 有用的链接

- **你的应用**: `https://[your-project].vercel.app`
- **Vercel 控制台**: https://vercel.com/dashboard
- **Supabase 控制台**: https://supabase.com/dashboard
- **项目仓库**: https://github.com/shxld/cale_exam

---

## 💡 下一步（可选）

部署成功后，你可以：

### 短期（1-7 天）
- [ ] 配置自定义域名（如 `exam.yourdomain.com`）
- [ ] 添加测试题目和考试
- [ ] 邀请用户测试

### 中期（1-4 周）
- [ ] 配置邮件服务（SMTP）用于密码重置
- [ ] 设置 Web Push 通知
- [ ] 添加 Google Analytics

### 长期（1-3 月）
- [ ] 监控用量，考虑是否需要升级
- [ ] 设置自动备份
- [ ] 性能优化

---

**祝部署顺利！有问题随时问我。** 🚀

---

**最后更新**: 2025-10-26 02:45 AM
**作者**: Claude (AI Assistant)
**版本**: 1.0
