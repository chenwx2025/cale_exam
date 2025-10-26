# AWS Amplify 部署检查清单 ✅

**快速参考** - 部署前逐项检查

---

## 📋 部署前准备（5 分钟）

### 1. 文件配置 ✅
- [x] [amplify.yml](amplify.yml) - 已优化（移除了 migrate）
- [x] [prisma/schema.prisma](prisma/schema.prisma) - PostgreSQL 配置
- [x] [nuxt.config.ts](nuxt.config.ts) - `ssr: false` （可用免费层）
- [x] [package.json](package.json) - 依赖完整

### 2. 准备环境变量 🔑

参考 [.env.amplify.example](.env.amplify.example)，准备以下值：

```bash
# 必需 - 从你的 AWS RDS 获取
DATABASE_URL="postgresql://user:pass@rds-host:5432/cale_exam?schema=public"

# 必需 - 生成两个随机密钥
JWT_SECRET="运行: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
JWT_REFRESH_SECRET="运行: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""

# 必需 - 先部署一次获取 Amplify URL 后再设置
NUXT_PUBLIC_API_BASE="https://main.d[app-id].amplifyapp.com"

# 必需
NODE_ENV="production"
```

**生成 JWT 密钥**：
```bash
# 运行两次
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. AWS RDS 配置 🗄️

- [ ] RDS 实例状态: **Available**
- [ ] 安全组入站规则: **允许端口 5432**
  ```
  类型: PostgreSQL
  端口: 5432
  来源: 0.0.0.0/0  # 或特定 IP
  ```
- [ ] 公开可访问性: **是**（或配置 VPC）
- [ ] 数据库已创建并有数据

---

## 🚀 部署步骤（10 分钟）

### 步骤 1: 访问 AWS Amplify Console

🔗 https://console.aws.amazon.com/amplify/

### 步骤 2: 创建/选择应用

**如果是新应用**:
1. 点击 "New app" → "Host web app"
2. 选择代码仓库（GitHub/GitLab/Bitbucket）
3. 授权 AWS Amplify
4. 选择仓库和分支（`main`）

**如果是现有应用**:
1. 选择你的应用
2. 检查分支配置

### 步骤 3: 配置构建设置

AWS Amplify 会自动检测 `amplify.yml`：

- [x] Build image: **Amazon Linux:2023**
- [x] Build specification: **amplify.yml detected**
- [x] Node.js version: **22**（在 amplify.yml 中配置）

✅ 保持默认设置即可

### 步骤 4: 添加环境变量

**在 "Advanced settings" 部分添加**：

| 键 | 值 | 示例 |
|----|----|----|
| `DATABASE_URL` | 你的 RDS 连接字符串 | `postgresql://...` |
| `JWT_SECRET` | 生成的密钥 1 | `abc123...` |
| `JWT_REFRESH_SECRET` | 生成的密钥 2 | `xyz789...` |
| `NUXT_PUBLIC_API_BASE` | 临时设为空 | （先留空） |
| `NODE_ENV` | `production` | `production` |

**注意**: `NUXT_PUBLIC_API_BASE` 需要 Amplify URL，首次部署后再设置

### 步骤 5: 保存并部署

1. 检查所有设置
2. 点击 "Save and deploy"
3. 等待构建完成（约 5-10 分钟）

### 步骤 6: 更新 NUXT_PUBLIC_API_BASE

1. 部署完成后，复制 Amplify URL
   - 格式：`https://main.d[app-id].amplifyapp.com`
2. App settings → Environment variables
3. 添加/更新 `NUXT_PUBLIC_API_BASE`
4. 保存后重新部署

---

## ✅ 部署验证（5 分钟）

### 1. 检查构建状态

在 Amplify Console 查看：

```
✔ Provision    - 准备环境
✔ Build        - 构建应用
✔ Deploy       - 部署到 CDN
✔ Verify       - 验证部署
```

### 2. 查看构建日志

点击每个阶段查看详细日志：

**关键检查点**:
- ✅ Node.js 22 安装成功
- ✅ `npm install --legacy-peer-deps` 完成
- ✅ `npx prisma generate` 成功
- ✅ `npm run build` 无错误
- ✅ 文件输出到 `.output/public`

### 3. 测试应用功能

访问你的 Amplify URL：

**基础测试**:
- [ ] 首页加载正常
- [ ] CSS 样式正确
- [ ] JavaScript 运行正常
- [ ] 无控制台错误

**功能测试**:
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] API 调用成功
- [ ] 数据库查询正常

### 4. 检查日志（如有错误）

Amplify Console → Monitoring → Logs

---

## 🐛 常见问题快速修复

### ❌ 构建失败: "Cannot find module '@nuxtjs/tailwindcss'"

**原因**: devDependencies 未安装

**解决**: [amplify.yml](amplify.yml:12) 已改为 `npm install --legacy-peer-deps`

✅ 重新部署即可

---

### ❌ 运行时错误: "Database connection failed"

**检查**:
1. [ ] DATABASE_URL 环境变量已设置
2. [ ] RDS 安全组允许入站（0.0.0.0/0:5432）
3. [ ] RDS 实例状态为 "Available"
4. [ ] 连接字符串格式正确

**测试连接**:
```bash
# 本地测试
export DATABASE_URL="你的RDS URL"
npx prisma db pull
```

---

### ❌ 页面 404 或空白

**可能原因**: 输出目录配置

**检查**: [amplify.yml](amplify.yml:20) 的 `baseDirectory: .output/public`

**验证**:
1. 访问 `/index.html`
2. 检查 Amplify 部署的文件列表
3. 查看浏览器控制台错误

---

### ❌ API 路由不工作

**原因**: Amplify 需要配置重定向规则

**解决**:

**方法 1**: 在 Amplify Console 配置
1. App settings → Rewrites and redirects
2. 添加规则：
   - 源: `/api/<*>`
   - 目标: `/api/<*>`
   - 类型: 200 (Rewrite)

**方法 2**: 在 amplify.yml 添加（已包含）
```yaml
customHeaders:
  - pattern: '/api/**'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache'
```

---

## 📊 成本估算

### AWS Amplify Hosting（免费层）

✅ 因为 `ssr: false`，可使用免费层：

| 项目 | 免费额度 | 你的使用量估算 | 成本 |
|------|---------|---------------|------|
| 构建时间 | 1000 分钟/月 | ~100 分钟 | $0 |
| 存储 | 15 GB | ~500 MB | $0 |
| 流量 | 15 GB/月 | ~5 GB | $0 |

**预估月成本**: **$0** ✅

### AWS RDS PostgreSQL

需要单独付费：
- db.t3.micro: ~$15/月
- db.t4g.micro: ~$12/月

**总成本**: **约 $12-15/月**

---

## 🎯 部署后优化

### 1. 设置自定义域名

App settings → Domain management
- 添加域名
- 配置 DNS
- 自动 SSL 证书

### 2. 启用分支部署

- `main` → 生产环境
- `dev` → 开发环境
- PR → 自动预览

### 3. 配置通知

App settings → Notifications
- 构建成功/失败
- Email/Slack 通知

### 4. 性能监控

Monitoring → Analytics
- 流量统计
- 错误追踪
- 性能指标

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| [AWS_AMPLIFY_DEPLOY_NOW.md](AWS_AMPLIFY_DEPLOY_NOW.md) | 详细部署指南 |
| [.env.amplify.example](.env.amplify.example) | 环境变量示例 |
| [amplify.yml](amplify.yml) | 构建配置 |
| [AWS_AMPLIFY_DEPLOYMENT_CHECKLIST.md](AWS_AMPLIFY_DEPLOYMENT_CHECKLIST.md) | 原检查清单 |

---

## 🆘 获取帮助

**构建失败**:
1. 查看 Build logs
2. 检查 amplify.yml 配置
3. 验证环境变量

**运行时错误**:
1. Monitoring → Logs
2. 浏览器控制台
3. RDS 连接测试

**AWS 支持**:
- [AWS Support](https://console.aws.amazon.com/support/)
- [Amplify Docs](https://docs.aws.amazon.com/amplify/)

---

## ✨ 准备好了？

### 快速命令

```bash
# 生成 JWT 密钥（运行两次）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 测试数据库连接
export DATABASE_URL="你的RDS URL"
npx prisma db pull

# 本地构建测试
npm run build
```

### 下一步

1. ✅ 检查清单完成
2. 🔗 访问 [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. 🚀 开始部署！

---

**祝部署顺利！** 🎉
