# Vercel 环境变量配置

**更新时间**: 2025-10-26
**用途**: 复制这些环境变量到 Vercel 部署配置

---

## 🔑 必需环境变量（7 个）

部署到 Vercel 时，在 "Environment Variables" 部分添加以下变量：

### 1. DATABASE_URL
**值**:
```
你的 Supabase 连接字符串（包含 ?pgbouncer=true&schema=public）
```

**格式示例**:
```
postgresql://postgres.abcdefghij:你的密码@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```

**注意**:
- 必须包含 `?pgbouncer=true&schema=public`
- 从 Supabase 控制台获取
- 不要用引号包裹

---

### 2. JWT_SECRET
**值**:
```
3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
```

**用途**: JWT 访问令牌签名密钥

---

### 3. JWT_REFRESH_SECRET
**值**:
```
8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
```

**用途**: JWT 刷新令牌签名密钥

---

### 4. NODE_ENV
**值**:
```
production
```

**用途**: 设置为生产环境模式

---

### 5. APP_NAME
**值**:
```
Cale加州中医考试系统
```

**用途**: 应用名称（显示在页面标题等地方）

---

### 6. APP_URL
**初始值**:
```
https://placeholder.vercel.app
```

**部署后更新为**:
```
https://你的项目名.vercel.app
```

**用途**: 应用的完整 URL（用于邮件链接等）

**重要**: 首次部署后必须更新为实际 URL，然后重新部署！

---

### 7. NUXT_PUBLIC_API_BASE
**初始值**:
```
https://placeholder.vercel.app
```

**部署后更新为**:
```
https://你的项目名.vercel.app
```

**用途**: API 基础 URL（前端调用 API 时使用）

**重要**: 首次部署后必须更新为实际 URL，然后重新部署！

---

## 📋 Vercel 部署步骤

### 第 1 步：访问 Vercel

打开: https://vercel.com/new

### 第 2 步：导入仓库

1. 点击 "Import Git Repository"
2. 选择 `shxld/cale_exam`
3. 点击 "Import"

### 第 3 步：配置构建设置

**Framework Preset**: `Nuxt.js` (应该自动检测)

**Root Directory**: `.` (保持默认)

**Build Command**:
```
npx prisma generate && npm run build
```

**Install Command**:
```
npm install --legacy-peer-deps
```

### 第 4 步：添加环境变量

点击 "Environment Variables"，逐个添加上面的 7 个变量：

#### 快速复制粘贴格式

```
DATABASE_URL=你的Supabase连接字符串
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
NODE_ENV=production
APP_NAME=Cale加州中医考试系统
APP_URL=https://placeholder.vercel.app
NUXT_PUBLIC_API_BASE=https://placeholder.vercel.app
```

**重要**: Vercel 界面是一个个添加的，不能直接粘贴所有变量。

#### 添加方法：
1. 在 "Key" 输入框输入变量名（如 `DATABASE_URL`）
2. 在 "Value" 输入框输入变量值
3. 点击 "Add" 按钮
4. 重复步骤 1-3，直到添加完所有 7 个变量

### 第 5 步：部署

点击 "Deploy" 按钮，等待 3-5 分钟。

### 第 6 步：更新 URL 变量（重要！）

部署成功后：

1. **复制你的 Vercel URL**
   - 例如: `https://cale-exam-abc123.vercel.app`

2. **更新环境变量**:
   - 进入项目 → Settings → Environment Variables
   - 找到 `APP_URL`，点击右侧的 "⋯" → Edit
   - 更新为你的实际 URL: `https://cale-exam-abc123.vercel.app`
   - 保存

3. **更新 NUXT_PUBLIC_API_BASE**:
   - 同样的操作
   - 更新为你的实际 URL: `https://cale-exam-abc123.vercel.app`
   - 保存

4. **重新部署**:
   - 返回 "Deployments" 标签
   - 点击最新部署右侧的 "⋯" → Redeploy
   - 确认

等待 2-3 分钟重新部署完成。

---

## ✅ 部署完成检查

访问你的 Vercel URL，测试：

- [ ] 首页加载正常
- [ ] 可以注册新用户
- [ ] 可以登录
- [ ] 可以浏览题目
- [ ] API 请求正常工作

---

## 🐛 常见问题

### 问题 1: 构建失败 - "@nuxtjs/tailwindcss" 错误

**说明**: 这是本地依赖问题，Vercel 会重新安装，不会有这个问题。

### 问题 2: 部署成功但 API 调用失败

**检查**:
1. 确认 `DATABASE_URL` 正确
2. 确认 `APP_URL` 和 `NUXT_PUBLIC_API_BASE` 已更新为实际 URL
3. 重新部署

### 问题 3: 数据库连接错误

**检查 DATABASE_URL 格式**:
- ✅ 必须包含 `?pgbouncer=true&schema=public`
- ✅ 密码正确
- ✅ 没有多余的空格

### 问题 4: 页面 404

**解决**:
1. 等待 2-3 分钟
2. 检查 `vercel.json` 是否存在
3. 查看 Vercel 构建日志

---

## 📊 部署信息

### 预计部署时间
- 首次部署: 3-5 分钟
- 重新部署: 2-3 分钟

### 免费层限制
- ✅ 带宽: 100 GB/月
- ✅ 执行时间: 100 小时/月
- ✅ 你的预计使用: < 10%

### 成本
💰 **$0/月** (免费层)

---

## 🔗 重要链接

- **Vercel 控制台**: https://vercel.com/dashboard
- **Supabase 控制台**: https://supabase.com/dashboard
- **项目仓库**: https://github.com/shxld/cale_exam

---

## 📝 环境变量对照表

| 变量名 | 当前值 | 部署后需要更新 |
|--------|--------|----------------|
| DATABASE_URL | 你的 Supabase 连接 | ❌ 不需要 |
| JWT_SECRET | 3e630447... | ❌ 不需要 |
| JWT_REFRESH_SECRET | 8ed6d6f3... | ❌ 不需要 |
| NODE_ENV | production | ❌ 不需要 |
| APP_NAME | Cale加州中医考试系统 | ❌ 不需要 |
| APP_URL | placeholder.vercel.app | ✅ **必须更新** |
| NUXT_PUBLIC_API_BASE | placeholder.vercel.app | ✅ **必须更新** |

---

## 🎯 下一步

现在可以开始部署了！

1. 打开 https://vercel.com/new
2. 按照上面的步骤操作
3. 有问题随时问我

**祝部署顺利！** 🚀

---

**最后更新**: 2025-10-26
