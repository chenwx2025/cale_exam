# ✅ 准备部署到 Vercel

**状态**: 🟢 **已就绪，可以立即部署！**
**更新时间**: 2025-10-26 02:50 AM

---

## 🎉 你已经完成的工作

### ✅ 数据库设置
- ✅ Supabase 项目已创建
- ✅ 数据库连接已配置: `db.fhjuxlhdyaqpgrkmfxik.supabase.co`
- ✅ DATABASE_URL 已更新（包含 pgbouncer 参数）
- ✅ 数据库表已创建（通过 `npx prisma db push`）

### ✅ 代码准备
- ✅ Prisma schema 使用 PostgreSQL
- ✅ Scheduler 插件已修复（不会在构建时访问数据库）
- ✅ vercel.json 配置正确
- ✅ 所有环境变量已定义

### ✅ Git 仓库
- ✅ 仓库: `shxld/cale_exam`
- ✅ 分支: `main`
- ✅ 最新代码已推送

---

## 🚀 现在就开始部署！

### 第 1 步：打开 Vercel

访问: **https://vercel.com/new**

### 第 2 步：导入仓库

1. 点击 "Import Git Repository"
2. 如果没有连接 GitHub，点击 "Continue with GitHub"
3. 找到并选择仓库: **shxld/cale_exam**
4. 点击 **"Import"**

### 第 3 步：配置项目

Vercel 会自动检测到这是 Nuxt.js 项目。

#### 构建设置（确认以下配置）

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Nuxt.js |
| Root Directory | . |
| Build Command | `npx prisma generate && npm run build` |
| Install Command | `npm install --legacy-peer-deps` |

**注意**: 如果 Build Command 显示的是默认值，需要手动改为 `npx prisma generate && npm run build`

### 第 4 步：添加环境变量 ⭐ **最重要！**

点击 **"Environment Variables"** 展开，逐个添加以下 7 个变量：

#### 变量 1: DATABASE_URL
```
Key:   DATABASE_URL
Value: postgresql://postgres:Cwren2016!@db.fhjuxlhdyaqpgrkmfxik.supabase.co:5432/postgres?pgbouncer=true&schema=public
```
点击 "Add"

#### 变量 2: JWT_SECRET
```
Key:   JWT_SECRET
Value: 3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
```
点击 "Add"

#### 变量 3: JWT_REFRESH_SECRET
```
Key:   JWT_REFRESH_SECRET
Value: 8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
```
点击 "Add"

#### 变量 4: NODE_ENV
```
Key:   NODE_ENV
Value: production
```
点击 "Add"

#### 变量 5: APP_NAME
```
Key:   APP_NAME
Value: Cale加州中医考试系统
```
点击 "Add"

#### 变量 6: APP_URL (临时占位符)
```
Key:   APP_URL
Value: https://placeholder.vercel.app
```
点击 "Add"

**注意**: 这是临时值，部署成功后需要更新！

#### 变量 7: NUXT_PUBLIC_API_BASE (临时占位符)
```
Key:   NUXT_PUBLIC_API_BASE
Value: https://placeholder.vercel.app
```
点击 "Add"

**注意**: 这是临时值，部署成功后需要更新！

---

### 第 5 步：开始部署

确认所有配置正确后，点击 **"Deploy"** 按钮。

#### 部署过程（3-5 分钟）

你会看到以下阶段：
1. ⏳ Cloning repository...
2. ⏳ Installing dependencies...
3. ⏳ Building application...
4. ⏳ Uploading build outputs...
5. ✅ Deployment ready!

**不用担心 Tailwind 警告** - 这是本地依赖问题，Vercel 会正确处理。

---

### 第 6 步：更新 URL 环境变量 ⭐ **必须执行！**

部署成功后，你会看到类似这样的 URL：
```
https://cale-exam-abc123.vercel.app
```

#### 6.1 复制你的实际 URL
点击 "Visit" 或复制顶部显示的 URL。

#### 6.2 更新环境变量

1. 在 Vercel 项目页面，点击顶部的 **"Settings"**

2. 点击左侧的 **"Environment Variables"**

3. 找到 `APP_URL` 变量：
   - 点击右侧的 **"⋯"** (三个点)
   - 选择 **"Edit"**
   - 将值改为你的实际 URL（如 `https://cale-exam-abc123.vercel.app`）
   - 点击 **"Save"**

4. 找到 `NUXT_PUBLIC_API_BASE` 变量：
   - 同样的操作
   - 将值改为你的实际 URL（如 `https://cale-exam-abc123.vercel.app`）
   - 点击 **"Save"**

#### 6.3 重新部署

1. 点击顶部的 **"Deployments"**

2. 找到最新的部署（第一行）

3. 点击右侧的 **"⋯"** → 选择 **"Redeploy"**

4. 点击 **"Redeploy"** 确认

5. 等待 2-3 分钟重新部署完成

---

## ✅ 部署成功检查

### 1. 访问你的应用

打开你的 Vercel URL: `https://你的项目名.vercel.app`

### 2. 测试基本功能

#### 首页测试
- [ ] 首页正确加载
- [ ] 可以看到应用标题 "Cale加州中医考试系统"
- [ ] 导航菜单正常显示

#### 用户功能测试
- [ ] 点击 "注册" 按钮
- [ ] 填写注册信息：
  - 用户名: `testuser`
  - 邮箱: `test@example.com`
  - 密码: `Test123456!`
- [ ] 提交注册
- [ ] 看到注册成功消息
- [ ] 使用注册的账号登录

#### 核心功能测试
- [ ] 可以浏览题库
- [ ] 可以查看题目详情
- [ ] 可以答题（如果有题目数据）
- [ ] API 请求正常工作（检查浏览器控制台，没有 404 或 500 错误）

### 3. 检查 Vercel 日志

1. 在 Vercel 项目页面，点击 **"Deployments"**
2. 点击最新的部署
3. 点击 **"View Function Logs"**
4. 查看是否有错误（应该看到 Scheduler 正常启动的日志）

---

## 🎉 部署成功！

如果上面的测试都通过了，**恭喜你，部署成功！** 🚀

### 你现在有了：

✅ **全球访问的应用** - Vercel 的全球 CDN
✅ **生产级数据库** - Supabase PostgreSQL
✅ **自动扩展** - Serverless 架构
✅ **HTTPS 安全** - 自动 SSL 证书
✅ **零成本** - 完全在免费层运行

---

## 📊 部署信息总结

| 项目 | 信息 |
|------|------|
| **应用 URL** | `https://你的项目名.vercel.app` |
| **数据库** | Supabase PostgreSQL |
| **数据库地址** | `db.fhjuxlhdyaqpgrkmfxik.supabase.co` |
| **部署平台** | Vercel |
| **Git 仓库** | `shxld/cale_exam` |
| **框架** | Nuxt 3 |
| **成本** | $0/月（免费层） |

---

## 🔗 管理链接

保存这些链接以便后续管理：

- **应用地址**: `https://你的项目名.vercel.app`
- **Vercel 控制台**: https://vercel.com/dashboard
- **Supabase 控制台**: https://supabase.com/dashboard/project/fhjuxlhdyaqpgrkmfxik
- **GitHub 仓库**: https://github.com/shxld/cale_exam

---

## 🐛 常见问题

### 问题 1: 页面显示但 API 返回 500 错误

**可能原因**: DATABASE_URL 不正确

**解决方法**:
1. 进入 Vercel → Settings → Environment Variables
2. 检查 `DATABASE_URL` 是否包含 `?pgbouncer=true&schema=public`
3. 确认密码正确（`Cwren2016!`）
4. 保存后重新部署

### 问题 2: 注册/登录失败

**可能原因**: JWT_SECRET 未配置

**解决方法**:
1. 检查环境变量中 `JWT_SECRET` 和 `JWT_REFRESH_SECRET` 已添加
2. 值正确无误
3. 重新部署

### 问题 3: 样式显示不正常

**可能原因**: 构建缓存问题

**解决方法**:
1. Vercel → Deployments → 最新部署 → ⋯ → Redeploy
2. 清除浏览器缓存
3. 强制刷新页面（Ctrl+F5 或 Cmd+Shift+R）

### 问题 4: 定时任务不工作

**说明**:
- Vercel Serverless Functions 需要首次 API 调用才会初始化 Scheduler
- 首次访问后，定时任务会在后台运行
- 免费层有 10 秒超时限制

**检查方法**:
- 查看 Function Logs 是否有 `[Scheduler] Initializing` 日志

---

## 📈 下一步（可选）

### 立即可做
- [ ] 分享应用 URL 给测试用户
- [ ] 添加测试题目数据
- [ ] 设置自定义域名（如 `exam.yourdomain.com`）

### 1-2 周内
- [ ] 配置邮件服务（用于密码重置）
- [ ] 添加 Google Analytics
- [ ] 设置监控和告警

### 1 个月内
- [ ] 收集用户反馈
- [ ] 优化性能
- [ ] 考虑是否需要升级到付费层

---

## 💡 优化建议

### 性能优化
1. **启用图片优化**: Vercel 自动处理
2. **配置缓存**: 静态资源自动缓存
3. **数据库索引**: 在 Supabase 控制台添加常用查询索引

### 安全建议
1. **定期轮换密钥**: 每 3-6 个月更换 JWT_SECRET
2. **监控日志**: 定期检查是否有异常访问
3. **数据备份**: Supabase 自动备份，但建议定期手动导出

---

## 📞 获取帮助

如果遇到问题：

1. **检查 Vercel 日志**
   - Deployments → 选择部署 → View Function Logs

2. **检查 Supabase 日志**
   - Supabase 控制台 → Logs → Database

3. **查看文档**
   - [QUICK_START.md](QUICK_START.md) - 快速开始
   - [VERCEL_ENV_VARIABLES.md](VERCEL_ENV_VARIABLES.md) - 环境变量详解
   - [VERCEL_SUPABASE_DEPLOYMENT.md](VERCEL_SUPABASE_DEPLOYMENT.md) - 完整文档

---

## 🎯 最终检查清单

部署前确认：
- [x] Supabase 数据库已创建
- [x] DATABASE_URL 包含 `?pgbouncer=true&schema=public`
- [x] 所有 7 个环境变量已准备好
- [x] Git 仓库最新代码已推送
- [x] 了解部署后需要更新 APP_URL

部署后确认：
- [ ] 应用可以访问
- [ ] 可以注册用户
- [ ] 可以登录
- [ ] API 请求正常
- [ ] APP_URL 已更新
- [ ] 已重新部署

---

**准备好了吗？现在就打开 https://vercel.com/new 开始部署！** 🚀

---

**最后更新**: 2025-10-26 02:50 AM
**下一步**: 访问 https://vercel.com/new 开始部署
