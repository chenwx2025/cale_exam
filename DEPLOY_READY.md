# 🚀 部署准备完成

**生成时间**: 2025-10-25

---

## ✅ 配置已完成

### 1. JWT 密钥已生成

```bash
# 复制以下密钥到 AWS Amplify 环境变量
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
```

⚠️ **这些密钥仅供测试使用！生产环境请重新生成并妥善保管！**

### 2. 配置文件已优化

- ✅ [amplify.yml](amplify.yml) - AWS Amplify 构建配置
- ✅ [vercel.json](vercel.json) - Vercel 部署配置
- ✅ [prisma/schema.prisma](prisma/schema.prisma) - PostgreSQL 配置
- ✅ [package.json](package.json) - 新增部署脚本

### 3. 部署文档已创建

**AWS Amplify**:
- [AMPLIFY_DEPLOY_CHECKLIST.md](AMPLIFY_DEPLOY_CHECKLIST.md) - 快速检查清单
- [AWS_AMPLIFY_DEPLOY_NOW.md](AWS_AMPLIFY_DEPLOY_NOW.md) - 详细部署指南
- [.env.amplify.example](.env.amplify.example) - 环境变量配置

**Vercel**:
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - 部署检查清单
- [VERCEL_QUICKSTART.md](VERCEL_QUICKSTART.md) - 快速开始
- [VERCEL_AWS_DEPLOYMENT.md](VERCEL_AWS_DEPLOYMENT.md) - AWS PostgreSQL 指南
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - 详细文档

---

## 🎯 AWS Amplify 部署步骤

### 准备环境变量

在 AWS Amplify Console 添加以下环境变量：

```bash
# 必需变量
DATABASE_URL=postgresql://你的用户名:你的密码@你的RDS地址:5432/cale_exam?schema=public&sslmode=require
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
NODE_ENV=production
NUXT_PUBLIC_API_BASE=https://main.d[你的app-id].amplifyapp.com
```

⚠️ **注意**:
1. `DATABASE_URL` - 需要替换为你的 AWS RDS PostgreSQL 实际连接信息
2. `NUXT_PUBLIC_API_BASE` - 首次部署后获取 Amplify URL，然后更新此变量并重新部署

### 部署流程

1. **提交代码到 Git**
   ```bash
   git add .
   git commit -m "配置 AWS Amplify 和 Vercel 部署"
   git push origin main
   ```

2. **访问 AWS Amplify Console**
   - 🔗 https://console.aws.amazon.com/amplify/

3. **创建新应用（或选择现有应用）**
   - New app → Host web app
   - 连接你的 Git 仓库
   - 选择 `main` 分支

4. **配置环境变量**
   - 在 Advanced settings 添加上面的环境变量
   - DATABASE_URL 使用你的 AWS RDS 连接信息

5. **保存并部署**
   - Save and deploy
   - 等待构建完成（约 5-10 分钟）

6. **更新 NUXT_PUBLIC_API_BASE**
   - 复制 Amplify URL
   - App settings → Environment variables
   - 更新 NUXT_PUBLIC_API_BASE
   - 重新部署

---

## 🎯 Vercel 部署步骤（备选）

### 安装 Vercel CLI

```bash
npm i -g vercel
vercel login
```

### 部署

```bash
# 预览部署
vercel

# 生产部署
vercel --prod
```

在部署过程中设置环境变量（同上）

---

## 📋 部署前检查清单

### AWS RDS PostgreSQL

- [ ] RDS 实例正在运行（状态: Available）
- [ ] 安全组允许入站连接（端口 5432）
- [ ] 有正确的数据库连接信息
- [ ] 数据库中有必要的表和数据

### Git 仓库

- [ ] 所有更改已提交
- [ ] 已推送到远程仓库
- [ ] 使用 `main` 分支

### 环境变量

- [ ] 已准备 DATABASE_URL
- [ ] 已生成 JWT 密钥（见上方）
- [ ] 已准备其他可选变量（SMTP 等）

---

## 🐛 故障排查

### 如果构建失败

1. 查看 Amplify Console 的构建日志
2. 检查环境变量是否正确设置
3. 验证 [amplify.yml](amplify.yml) 配置

### 如果数据库连接失败

1. 检查 DATABASE_URL 格式
2. 验证 RDS 安全组设置
3. 确认 RDS 公开可访问性
4. 测试本地连接：
   ```bash
   export DATABASE_URL="你的RDS URL"
   npx prisma db pull
   ```

---

## 📞 需要帮助？

- **AWS Amplify**: [AMPLIFY_DEPLOY_CHECKLIST.md](AMPLIFY_DEPLOY_CHECKLIST.md)
- **Vercel**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **环境变量**: [.env.amplify.example](.env.amplify.example)

---

## 🎉 准备就绪！

现在可以：
1. 提交代码到 Git
2. 访问 AWS Amplify Console 开始部署
3. 或使用 Vercel CLI 部署

**祝部署顺利！** 🚀
