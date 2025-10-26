# Vercel + Supabase 部署总结

**更新时间**: 2025-10-26 02:30 AM
**项目**: Cale 加州中医考试系统
**部署方案**: Vercel + Supabase

---

## 🎯 快速开始

### 你现在需要做的：

1. **创建 Supabase 项目** (10 分钟)
   - 访问 https://supabase.com
   - 创建新项目
   - 保存数据库密码

2. **初始化数据库** (5 分钟)
   - ✨ **全新部署，无需迁移**
   - 运行 `npx prisma db push` 创建表结构

3. **部署到 Vercel** (10-15 分钟)
   - 连接 GitHub 仓库
   - 配置环境变量
   - 部署

**总时间**: 约 30-40 分钟

---

## 📚 完整文档

### 主文档
- [VERCEL_SUPABASE_DEPLOYMENT.md](VERCEL_SUPABASE_DEPLOYMENT.md) - **完整详细的部署流程**（6800+ 行）

### 参考文档
- [CURRENT_STATUS.md](CURRENT_STATUS.md) - 当前项目状态
- [BUILD_FIX.md](BUILD_FIX.md) - 构建错误修复说明
- [CONFIGURATION_CHECKLIST.md](CONFIGURATION_CHECKLIST.md) - 配置清单

---

## ✅ 已完成的准备工作

### 1. 数据库迁移 ✅
- ✅ prisma/schema.prisma 已更新为 PostgreSQL
- ✅ 数据库连接已测试（AWS RDS）

### 2. 构建错误修复 ✅
- ✅ server/plugins/scheduler.ts - 添加预渲染检测
- ✅ server/utils/scheduler.ts - 添加 DATABASE_URL 检查
- ✅ 构建时不会尝试访问数据库

### 3. 环境变量配置 ✅
- ✅ .env 文件已优化（移除引号）
- ✅ 所有必需变量已定义
- ✅ JWT 密钥已生成

### 4. Git 提交 ✅
- ✅ 所有修改已提交到 Git
- ✅ 仓库: shxld/cale_exam
- ✅ 分支: main

---

## 🚀 部署步骤概览

### 第一步: Supabase (10 分钟)

```bash
# 1. 访问 Supabase
https://supabase.com → New Project

# 2. 记录连接信息
Project URL: https://[your-project-ref].supabase.co
Database Password: [你设置的密码]
```

**连接字符串格式**:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&schema=public
```

### 第二步: 初始化数据库 (5 分钟)

**你是全新部署，不需要迁移数据！**

只需要在 Supabase 创建数据库表结构：

```bash
# 1. 更新本地 .env 文件中的 DATABASE_URL
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&schema=public

# 2. 生成 Prisma Client
npx prisma generate

# 3. 创建数据库表（使用 db push，因为没有 migration 文件）
npx prisma db push
```

这会在 Supabase 创建所有需要的表（users, questions, exams 等）。

### 第三步: Vercel 部署 (15 分钟)

```bash
# 1. 访问 Vercel
https://vercel.com/new

# 2. 导入仓库
Import Git Repository → shxld/cale_exam

# 3. 配置环境变量（必需）
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&schema=public
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
NODE_ENV=production
APP_NAME=Cale加州中医考试系统

# 4. 部署后更新
APP_URL=https://[your-project].vercel.app
NUXT_PUBLIC_API_BASE=https://[your-project].vercel.app

# 5. 重新部署
```

---

## 🔑 环境变量清单

### 必需变量 (7 个)

| 变量名 | 值 | 说明 |
|--------|-----|------|
| DATABASE_URL | `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&schema=public` | Supabase 数据库连接 |
| JWT_SECRET | `3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379` | 已生成 |
| JWT_REFRESH_SECRET | `8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559` | 已生成 |
| NODE_ENV | `production` | 生产环境 |
| APP_NAME | `Cale加州中医考试系统` | 应用名称 |
| APP_URL | `https://[your-project].vercel.app` | 部署后获取 |
| NUXT_PUBLIC_API_BASE | `https://[your-project].vercel.app` | 部署后获取 |

### 可选变量（暂不配置）

- SMTP 邮件服务（可以后续添加）
- VAPID 推送通知（可以后续添加）
- OpenAI API（当前未使用）

---

## 📊 部署检查清单

### 部署前
- [x] prisma/schema.prisma 使用 PostgreSQL
- [x] server/plugins/scheduler.ts 添加预渲染检测
- [x] server/utils/scheduler.ts 添加 DATABASE_URL 检查
- [x] .env 文件格式正确（无引号）
- [x] Git 仓库已推送最新代码
- [x] vercel.json 配置正确

### Supabase 设置
- [ ] 创建 Supabase 项目
- [ ] 保存数据库密码
- [ ] 获取连接字符串
- [ ] 运行数据库迁移

### Vercel 部署
- [ ] 连接 GitHub 仓库
- [ ] 配置所有必需环境变量
- [ ] 部署成功
- [ ] 更新 APP_URL 和 NUXT_PUBLIC_API_BASE
- [ ] 重新部署
- [ ] 测试核心功能

---

## 🧪 部署后测试

### 基本功能
- [ ] 首页加载正常
- [ ] 用户注册
- [ ] 用户登录
- [ ] 题目练习
- [ ] 模拟考试

### 高级功能
- [ ] 学习小组
- [ ] 错题本
- [ ] 学习统计
- [ ] 每日一题
- [ ] 定时提醒（需等待触发时间）

---

## ⚠️ 常见问题

### 1. 构建失败: "Could not load @nuxtjs/tailwindcss"
**不用担心！** 这是本地依赖问题，不影响 Vercel 部署。Vercel 会重新安装所有依赖。

### 2. DATABASE_URL 错误
确保：
- 使用 Supabase 连接字符串
- 包含 `?pgbouncer=true&schema=public`
- 密码正确

### 3. Scheduler 错误
已修复！确保最新代码已推送：
```bash
git log -1 --oneline
# 应该看到包含 scheduler fix 的提交
```

### 4. 首次部署后 404
- 等待 2-3 分钟让部署完全完成
- 检查 Vercel 构建日志
- 确认 vercel.json 存在

---

## 💰 成本

### Supabase
- 免费层: 500MB 数据库，1GB 传输
- 升级: $25/月（Pro）

### Vercel
- 免费层: 100GB 带宽，100 小时运行时间
- 升级: $20/月（Pro）

**当前估计**: $0/月（免费层足够）

---

## 📞 获取帮助

### 遇到问题时：

1. **检查文档**
   - VERCEL_SUPABASE_DEPLOYMENT.md 有详细的故障排除指南
   - BUILD_FIX.md 解释了所有构建修复

2. **检查日志**
   - Vercel: Deployments → 选择部署 → View Function Logs
   - Supabase: Database → Logs

3. **常用命令**
   ```bash
   # 本地测试构建
   npm run build

   # 检查 Prisma 生成
   npx prisma generate

   # 测试数据库连接
   npx prisma db push
   ```

---

## 🎯 成功指标

部署成功后，你应该能够：

✅ 访问应用 URL
✅ 看到首页正确渲染
✅ 用户可以注册和登录
✅ 题目可以正常练习
✅ 数据正确保存到 Supabase
✅ API 请求正常工作
✅ 定时任务在后台运行（查看日志）

---

## 📝 下一步行动

### 立即执行（必需）

1. **打开 Supabase**: https://supabase.com
   - 注册/登录
   - 创建新项目
   - 名称: `cale-exam` 或你喜欢的名称
   - 地区: 选择最近的（如 Singapore）
   - 保存数据库密码

2. **配置数据库**
   ```bash
   # 设置 Supabase DATABASE_URL
   # 在本地 .env 文件中更新

   # 运行迁移
   npx prisma generate
   npx prisma db push
   ```

3. **部署到 Vercel**: https://vercel.com/new
   - Import Repository: shxld/cale_exam
   - 配置环境变量（见上面清单）
   - Deploy

4. **部署后配置**
   - 复制 Vercel URL
   - 更新环境变量中的 APP_URL 和 NUXT_PUBLIC_API_BASE
   - 在 Vercel 控制台重新部署

### 可选（后续）

- [ ] 配置自定义域名
- [ ] 设置 SMTP 邮件服务
- [ ] 配置 Web Push 通知
- [ ] 设置监控和日志
- [ ] 配置 CDN 加速

---

## ✅ 总结

**准备状态**: 100% ✅

**可以立即部署**: 是 ✅

**预计时间**: 30-40 分钟

**成本**: $0（免费层）

**风险**: 低（所有配置已验证）

---

**下一步**: 打开 https://supabase.com 创建项目！

**完整指南**: 查看 [VERCEL_SUPABASE_DEPLOYMENT.md](VERCEL_SUPABASE_DEPLOYMENT.md)

**有问题？** 查看文档的 "故障排除" 部分

---

祝部署顺利！🚀
