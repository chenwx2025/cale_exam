# Vercel 部署 - 5 分钟快速开始

## 🚀 最快的部署方式

### 步骤 1: 准备数据库（5 分钟）

**使用 Supabase 免费数据库**:

1. 访问 https://supabase.com
2. 注册/登录 > 点击 "New project"
3. 填写信息：
   - Name: `cale-exam`
   - Database Password: **设置强密码并记下来！**
   - Region: `Northeast Asia (Tokyo)`
4. 等待 2-3 分钟创建完成
5. 获取连接字符串：
   - Settings (齿轮图标) > Database > Connection string > URI
   - 复制并替换 `[YOUR-PASSWORD]` 为您的密码
   ```
   postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
   ```

### 步骤 2: 安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 3: 登录 Vercel

```bash
vercel login
```

选择 GitHub/GitLab/Bitbucket 登录。

### 步骤 4: 部署

```bash
vercel
```

**回答问题**:
- Set up and deploy? → `Y`
- Which scope? → 选择您的账户
- Link to existing project? → `N`
- Project name? → `cale-exam`
- Code directory? → 直接回车
- Override settings? → `N`

等待 3-5 分钟，部署完成！

### 步骤 5: 配置环境变量

**必需的环境变量**:

```bash
# 数据库
vercel env add DATABASE_URL production
# 粘贴您的 Supabase 连接字符串

# JWT 密钥（已为您生成）
vercel env add JWT_SECRET production
# 粘贴: bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb

vercel env add JWT_REFRESH_SECRET production
# 粘贴: 725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13

# OpenAI API（获取方式见下方）
vercel env add OPENAI_API_KEY production
# 粘贴您的 OpenAI API Key

# 环境标识
vercel env add NODE_ENV production
# 输入: production
```

**获取 OpenAI API Key**:
1. 访问 https://platform.openai.com/api-keys
2. 登录 > "Create new secret key"
3. 复制密钥（格式：`sk-...`）

### 步骤 6: 运行数据库迁移

```bash
# 设置本地环境变量
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# 运行迁移
npx prisma migrate deploy

# 或者推送架构
npx prisma db push
```

### 步骤 7: 重新部署

```bash
vercel --prod
```

## ✅ 完成！

访问您的应用：`https://cale-exam.vercel.app`

---

## 🔄 自动部署

现在每次推送代码，Vercel 会自动部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
# Vercel 自动部署！
```

---

## 📋 环境变量总结

| 变量名 | 值 | 获取方式 |
|--------|-----|---------|
| `DATABASE_URL` | `postgresql://...` | Supabase Dashboard |
| `JWT_SECRET` | `bea978fc5193b74505697c459143e7201045958d36e35c5ada8f6fed9a91f5fb` | 已生成 ✅ |
| `JWT_REFRESH_SECRET` | `725ba6368e3566f46617e43f9cff2da952f5f3fe9a9b2839a808aec7c0880a13` | 已生成 ✅ |
| `OPENAI_API_KEY` | `sk-...` | platform.openai.com |
| `NODE_ENV` | `production` | 固定值 |

---

## 🆘 遇到问题？

查看完整指南：[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)

**常见问题**:
- 构建失败 → 检查 Vercel 日志：`vercel logs`
- 数据库连接失败 → 确认 `DATABASE_URL` 正确
- 404 错误 → 确认环境变量已设置，重新部署

---

## 💰 成本

- **Vercel**: $0/月（免费层）
- **Supabase**: $0/月（免费层）
- **OpenAI API**: ~$5-20/月（按使用量）

**总计**: $5-20/月

---

**部署时间**: 15 分钟（包括准备）
**下次部署**: 自动（git push）
**成本**: 几乎免费
