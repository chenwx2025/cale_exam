# 🚀 开始部署 - 最后一步！

**状态**: ✅ 所有准备工作已完成
**Git**: ✅ 已推送到远程仓库

---

## 📊 当前状态

### ✅ 已完成
- ✅ JWT 密钥已生成
- ✅ 数据库配置已迁移到 PostgreSQL
- ✅ amplify.yml 已优化
- ✅ vercel.json 已配置
- ✅ 所有部署文档已创建
- ✅ Git 提交并推送完成

### 🔑 生成的 JWT 密钥

```bash
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
```

⚠️ **重要提醒**: 这些密钥已保存在此文件中，请勿提交到 Git！

---

## 🎯 下一步：选择部署平台

你现在有两个选择：

### 选项 A: AWS Amplify（推荐，免费）

**优势**:
- ✅ 完全免费（因为 ssr: false）
- ✅ 自动 CI/CD
- ✅ 全球 CDN
- ✅ 自动 SSL

**步骤**:
1. 访问 [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. 按照 [AMPLIFY_DEPLOY_CHECKLIST.md](AMPLIFY_DEPLOY_CHECKLIST.md) 操作
3. 预计时间：15 分钟

### 选项 B: Vercel

**优势**:
- ✅ 极简部署流程
- ✅ 优秀的性能
- ✅ 开发者友好

**步骤**:
1. 运行 `npm i -g vercel`
2. 运行 `vercel --prod`
3. 按照 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) 操作
4. 预计时间：10 分钟

---

## 📋 AWS Amplify 部署步骤（推荐）

### 步骤 1: 准备 AWS RDS 信息

你需要你的 AWS RDS PostgreSQL 连接信息：

```bash
# 格式
postgresql://username:password@your-rds-host.region.rds.amazonaws.com:5432/cale_exam?schema=public&sslmode=require

# 示例
postgresql://postgres:mypassword@my-db.abc123.us-east-1.rds.amazonaws.com:5432/cale_exam?schema=public&sslmode=require
```

**获取 RDS 信息**:
1. 打开 [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. 选择你的数据库实例
3. 在 "Connectivity & security" 找到 Endpoint 和 Port

### 步骤 2: 访问 AWS Amplify Console

🔗 https://console.aws.amazon.com/amplify/

### 步骤 3: 创建应用

1. **点击** "New app" → "Host web app"
2. **选择** 你的 Git 提供商（GitHub/GitLab/Bitbucket）
3. **授权** AWS Amplify 访问你的仓库
4. **选择仓库**: `shxld/cale_exam`
5. **选择分支**: `main`

### 步骤 4: 配置构建设置

AWS Amplify 会自动检测到 `amplify.yml`：

- ✅ Build image: Amazon Linux:2023
- ✅ Build specification: amplify.yml detected
- ✅ Output directory: .output/public

**保持默认设置，点击 Next**

### 步骤 5: 添加环境变量

在 "Advanced settings" → "Environment variables" 添加：

| 键 | 值 |
|----|-----|
| `DATABASE_URL` | `你的 AWS RDS PostgreSQL 连接字符串` |
| `JWT_SECRET` | `3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379` |
| `JWT_REFRESH_SECRET` | `8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559` |
| `NODE_ENV` | `production` |

**注意**: `NUXT_PUBLIC_API_BASE` 先不设置，等首次部署后获取 URL

### 步骤 6: 保存并部署

1. **点击** "Save and deploy"
2. **等待** 构建完成（5-10 分钟）
3. **观察** 构建日志

构建阶段：
```
✔ Provision    - 准备构建环境
✔ Build        - 构建应用
✔ Deploy       - 部署到 CDN
✔ Verify       - 验证部署
```

### 步骤 7: 获取 Amplify URL 并更新环境变量

1. **复制** Amplify URL（格式：`https://main.d[app-id].amplifyapp.com`）
2. **前往** App settings → Environment variables
3. **添加** `NUXT_PUBLIC_API_BASE` = 你的 Amplify URL
4. **重新部署**（App settings → Redeploy this version）

---

## ⚠️ 重要：AWS RDS 安全组配置

确保 RDS 允许来自外部的连接：

### 配置入站规则

1. 打开 [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. 左侧菜单 → Network & Security → Security Groups
3. 找到你的 RDS 安全组
4. Inbound rules → Edit inbound rules
5. 添加规则：
   ```
   类型: PostgreSQL
   协议: TCP
   端口: 5432
   来源: 0.0.0.0/0  (测试用)
   描述: Allow Amplify access
   ```

⚠️ **生产环境建议**: 限制为特定 IP 或使用 VPC

---

## ✅ 部署验证清单

部署完成后，测试以下功能：

- [ ] 应用首页能正常访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] API 调用成功
- [ ] 数据库查询正常
- [ ] 无控制台错误

---

## 📚 参考文档

| 文档 | 说明 |
|------|------|
| [AMPLIFY_DEPLOY_CHECKLIST.md](AMPLIFY_DEPLOY_CHECKLIST.md) | AWS Amplify 快速检查清单 |
| [AWS_AMPLIFY_DEPLOY_NOW.md](AWS_AMPLIFY_DEPLOY_NOW.md) | AWS Amplify 详细指南 |
| [DEPLOY_READY.md](DEPLOY_READY.md) | 部署准备状态 |
| [.env.amplify.example](.env.amplify.example) | 环境变量配置示例 |

---

## 🐛 常见问题

### Q: 构建失败 - "Cannot find module"
**A**: 查看构建日志，通常是依赖问题。amplify.yml 已配置 `npm install --legacy-peer-deps`

### Q: 数据库连接失败
**A**:
1. 检查 DATABASE_URL 是否正确
2. 验证 RDS 安全组设置
3. 确认 RDS 状态为 "Available"

### Q: 页面 404 或空白
**A**:
1. 检查 baseDirectory 配置（应为 `.output/public`）
2. 查看浏览器控制台错误
3. 访问 `/index.html` 测试

---

## 💰 成本估算

### AWS Amplify
- **月成本**: $0（免费层）
- 构建时间: 1000 分钟/月
- 存储: 15 GB
- 流量: 15 GB/月

### AWS RDS PostgreSQL
- **月成本**: ~$15-30
- 取决于实例类型（db.t3.micro 或 db.t4g.micro）

**总计**: 约 $15-30/月

---

## 🎉 准备就绪！

你现在可以：

### 方案 A: AWS Amplify（推荐）
```bash
# 1. 准备好 RDS 连接字符串
# 2. 访问 AWS Amplify Console
# 3. 按照上面的步骤操作
```

🔗 **开始部署**: https://console.aws.amazon.com/amplify/

### 方案 B: Vercel
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

---

## 📞 需要帮助？

如遇到问题：
1. 查看对应的部署文档
2. 检查构建/运行时日志
3. 验证环境变量配置
4. 测试数据库连接

**详细文档**: 见上方参考文档表格

---

**准备好了就开始吧！祝部署顺利！** 🚀✨
