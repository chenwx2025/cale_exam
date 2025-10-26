# Vercel 部署指南（使用现有 AWS PostgreSQL）

## 📌 你的情况

✅ 你已经在 AWS 上有 PostgreSQL 数据库
✅ Schema 已更新为 PostgreSQL
✅ Vercel 配置已优化完成

现在只需要在 Vercel 上配置环境变量即可！

---

## 🚀 快速部署步骤

### 步骤 1: 准备 AWS PostgreSQL 连接信息

确保你有以下信息：
- 数据库主机地址（Host）
- 端口（Port，通常是 5432）
- 数据库名称（Database）
- 用户名（Username）
- 密码（Password）

**连接字符串格式：**
```
postgresql://username:password@host:5432/database?schema=public
```

**示例：**
```
postgresql://postgres:mypassword@my-db.abc123.us-east-1.rds.amazonaws.com:5432/cale_exam?schema=public
```

### 步骤 2: 检查 AWS 安全组设置

确保你的 AWS RDS 安全组允许来自 Vercel 的连接：

1. **选项 A: 允许所有 IP（简单但不太安全）**
   - 在 RDS 安全组添加入站规则：`0.0.0.0/0` 端口 `5432`

2. **选项 B: 只允许 Vercel IP（更安全）**
   - 参考 [Vercel IP 地址列表](https://vercel.com/docs/concepts/edge-network/overview#ip-addresses)
   - 或使用 Vercel 的 Edge Config

### 步骤 3: 安装 Vercel CLI 并登录

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login
```

### 步骤 4: 设置环境变量

你可以选择以下两种方式之一：

#### 方式 A: 在部署时设置（推荐）

```bash
# 第一次部署时，Vercel 会询问环境变量
vercel

# 或者先添加环境变量
vercel env add DATABASE_URL production
# 然后粘贴你的 AWS PostgreSQL 连接字符串
```

#### 方式 B: 在 Vercel Dashboard 设置

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. Settings → Environment Variables
4. 添加以下变量：

```bash
# 必需的环境变量
DATABASE_URL="postgresql://user:pass@aws-host:5432/cale_exam?schema=public"
JWT_SECRET="生成一个至少32位的随机字符串"
JWT_REFRESH_SECRET="生成另一个至少32位的随机字符串"
NUXT_PUBLIC_API_BASE="https://your-app.vercel.app"
NODE_ENV="production"

# 可选的环境变量
OPENAI_API_KEY="sk-..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your@email.com"
```

**生成 JWT 密钥：**
```bash
# 生成两个不同的密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 5: 部署到 Vercel

```bash
# 预览部署（测试环境）
vercel

# 生产部署
vercel --prod
```

---

## ⚡ 重要提示

### 1. 数据库已存在数据

如果你的 AWS PostgreSQL 数据库已经有数据：

```bash
# 不需要运行 db:push 或 migrate
# 只需要确保 schema 和数据库结构一致

# 如果需要同步 schema（谨慎！）
# DATABASE_URL="你的AWS数据库URL" npx prisma db push
```

### 2. 如果需要运行迁移

```bash
# 在部署前，先在本地测试迁移
export DATABASE_URL="你的AWS PostgreSQL URL"

# 生成 Prisma Client
npx prisma generate

# 推送 schema（或运行迁移）
npx prisma db push

# 或者使用迁移
npx prisma migrate deploy
```

### 3. Vercel 构建配置

vercel.json 已配置：
```json
{
  "buildCommand": "npx prisma generate && npm run build"
}
```

这会在每次部署时自动生成 Prisma Client。

---

## ✅ 部署后验证

### 1. 检查构建日志

```bash
# 查看部署日志
vercel logs
```

在 Vercel Dashboard 查看：
- Deployments → 选择最新部署 → Build Logs

### 2. 检查运行时日志

```bash
# 实时查看日志
vercel logs --follow
```

或在 Dashboard:
- Deployments → Runtime Logs

### 3. 测试数据库连接

访问你的应用并测试：
- [ ] 用户注册/登录
- [ ] 数据查询
- [ ] 数据创建

### 4. 测试 API 端点

```bash
# 测试健康检查（如果有的话）
curl https://your-app.vercel.app/api/health

# 测试认证
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🐛 常见问题

### 1. 数据库连接超时

**原因**: AWS 安全组没有允许 Vercel IP

**解决**:
- 检查 RDS 安全组设置
- 暂时允许所有 IP 测试：`0.0.0.0/0`
- 确认数据库是公开可访问的（Public accessibility: Yes）

### 2. SSL 连接错误

**解决**: 在连接字符串添加 SSL 参数

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&sslmode=require"
```

### 3. Prisma Client 生成失败

**解决**: 确保 vercel.json 包含：
```json
{
  "buildCommand": "npx prisma generate && npm run build"
}
```

### 4. 环境变量未生效

**解决**:
- 重新部署：`vercel --prod --force`
- 检查变量名拼写
- 确认变量设置在正确的环境（Production/Preview/Development）

---

## 📊 性能优化建议

### 1. 数据库连接池

如果遇到连接数限制，考虑使用连接池：

**选项 A: Prisma Accelerate**
- 付费服务，提供连接池和缓存
- https://www.prisma.io/data-platform/accelerate

**选项 B: PgBouncer**
- 在 AWS 上自行部署 PgBouncer
- 免费但需要维护

### 2. 边缘缓存

利用 Vercel 的边缘缓存：
```typescript
// 在 API 路由中设置缓存头
export default defineEventHandler((event) => {
  setHeader(event, 'Cache-Control', 's-maxage=60, stale-while-revalidate')
  // ...
})
```

### 3. 使用 CDN

静态资源已通过 Vercel CDN 加速，无需额外配置。

---

## 🔒 安全建议

1. ✅ **使用强密码** - 为数据库和 JWT 使用强密码
2. ✅ **限制数据库访问** - 只允许必要的 IP 访问
3. ✅ **启用 SSL** - 数据库连接使用 SSL
4. ✅ **定期备份** - 配置 AWS RDS 自动备份
5. ✅ **监控日志** - 定期检查 Vercel 和 AWS 日志

---

## 📞 获取帮助

- **Vercel 支持**: https://vercel.com/support
- **Vercel 社区**: https://github.com/vercel/vercel/discussions
- **查看日志**: `vercel logs --follow`
- **检查状态**: https://www.vercel-status.com/

---

## 🎉 下一步

部署成功后：

1. [ ] 设置自定义域名
2. [ ] 配置 HTTPS（Vercel 自动提供）
3. [ ] 设置环境变量保护
4. [ ] 配置团队访问权限
5. [ ] 设置部署钩子（如有需要）
6. [ ] 配置监控和告警

**祝部署顺利！** 🚀
