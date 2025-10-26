# 配置检查清单 📋

**检查时间**: 2025-10-25
**项目**: Cale 加州中医考试系统

---

## ✅ 已配置项目

### 1. 数据库配置 ✅

**当前配置**:
```bash
DATABASE_URL=postgresql://postgres:Cwren2016!@database-2.cctouc4g4uv3.us-east-1.rds.amazonaws.com:5432/cale_exam?schema=public
```

**状态**: ✅ 配置完成
- ✅ 已从 SQLite 迁移到 PostgreSQL
- ✅ 连接到 AWS RDS
- ⚠️ 本地无法连接（需要配置 RDS 安全组）
- ✅ Amplify 部署时应该可以连接

---

### 2. JWT 密钥配置 ✅

**已生成密钥**:
```bash
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
```

**状态**: ✅ 配置完成
- ✅ 密钥长度 64 字符（32 字节）
- ✅ 使用强随机生成
- ✅ 两个密钥不同

---

### 3. 应用配置 ⚠️

**当前配置**:
```bash
NODE_ENV="production"
PORT="3000"
NUXT_PUBLIC_API_BASE="https://your-domain.com"  # ⚠️ 需要更新
```

**需要更新**:
- ⚠️ `NUXT_PUBLIC_API_BASE` - 需要改为实际的 Amplify/Vercel URL
- ⚠️ `.env` 中有引号，可能导致问题

**建议**:
```bash
# 移除引号
NODE_ENV=production
PORT=3000
# Amplify 部署后更新
NUXT_PUBLIC_API_BASE=https://main.d[app-id].amplifyapp.com
```

---

## ⚠️ 可选配置（未完成）

### 4. Email 服务配置 ⚠️

**当前配置**:
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"     # ⚠️ 占位符
SMTP_PASS="your-app-password"         # ⚠️ 占位符
SMTP_FROM="your-email@gmail.com"      # ⚠️ 占位符
```

**使用位置**:
- `server/utils/email-service.ts` - 邮件验证、密码重置

**状态**: ⚠️ 未配置实际值
- 功能：用户邮箱验证、密码重置
- 影响：如不配置，相关功能无法使用
- 优先级：中等（可后期配置）

**配置方法（Gmail）**:
1. 启用 Gmail 两步验证
2. 生成应用专用密码：https://myaccount.google.com/apppasswords
3. 更新 `.env`:
   ```bash
   SMTP_USER=your-real-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=your-real-email@gmail.com
   ```

---

### 5. Web Push 通知配置 ⚠️

**当前配置**:
```bash
VAPID_PUBLIC_KEY=""         # ⚠️ 空值
VAPID_PRIVATE_KEY=""        # ⚠️ 空值
VAPID_SUBJECT="mailto:your-email@domain.com"  # ⚠️ 占位符
```

**使用位置**:
- `server/api/notifications/subscribe.post.ts`
- `server/api/notifications/send.post.ts`

**状态**: ⚠️ 未配置
- 功能：浏览器推送通知
- 影响：推送通知功能无法使用
- 优先级：低（可后期配置）

**生成方法**:
```bash
npx web-push generate-vapid-keys
```

然后将输出复制到 `.env`:
```bash
VAPID_PUBLIC_KEY=生成的公钥
VAPID_PRIVATE_KEY=生成的私钥
VAPID_SUBJECT=mailto:your-email@domain.com
```

---

### 6. OpenAI API 配置 ⚠️

**当前配置**:
```bash
OPENAI_API_KEY="sk-your-openai-api-key-here"  # ⚠️ 占位符
```

**检查结果**: ❓ 代码中未发现使用
- 可能是预留的功能
- 或已移除相关代码

**状态**: ⚠️ 未配置，但似乎不需要
- 优先级：极低（可忽略）

---

### 7. 其他环境变量

**代码中发现但 .env 中缺失的变量**:

```bash
# server/utils/email-service.ts 使用
APP_URL=http://localhost:3000        # ⚠️ .env 中缺失
APP_NAME=Cale加州中医考试系统          # ⚠️ .env 中缺失
SMTP_FROM_EMAIL=your@email.com       # ⚠️ 可选
SMTP_FROM_NAME=CALE考试系统           # ⚠️ 可选
SMTP_SECURE=false                    # ⚠️ 可选

# 未发现使用
ADMIN_PASSWORD=?                     # ❓ 代码中引用但未使用
```

**建议添加到 .env**:
```bash
# 应用信息（用于邮件模板）
APP_URL=https://your-amplify-url.amplifyapp.com
APP_NAME=Cale加州中医考试系统
```

---

## 🔧 需要立即配置的项目

### 优先级 1: 必须配置（部署前）

1. **DATABASE_URL** ✅
   - 已配置 AWS RDS
   - 需要修复安全组访问

2. **JWT_SECRET & JWT_REFRESH_SECRET** ✅
   - 已生成并配置

3. **NUXT_PUBLIC_API_BASE** ⚠️
   - 首次部署后更新为实际 URL
   - 格式：`https://main.d[app-id].amplifyapp.com`

4. **NODE_ENV** ✅
   - 已设置为 `production`

5. **APP_URL** ⚠️
   - 添加此变量
   - 与 NUXT_PUBLIC_API_BASE 使用相同值

6. **APP_NAME** ⚠️
   - 添加此变量
   - 推荐：`Cale加州中医考试系统`

### 优先级 2: 建议配置（功能完整性）

7. **SMTP 配置** ⚠️
   - 如需邮件功能（验证、重置密码）
   - 使用 Gmail 应用密码

### 优先级 3: 可选配置（增强功能）

8. **VAPID Keys** ⚠️
   - 如需浏览器推送通知
   - 运行命令生成

---

## 📝 更新后的 .env 模板

```bash
# ============================================
# 必需配置
# ============================================

# 数据库
DATABASE_URL=postgresql://postgres:Cwren2016!@database-2.cctouc4g4uv3.us-east-1.rds.amazonaws.com:5432/cale_exam?schema=public

# JWT 密钥
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559

# 应用配置
NODE_ENV=production
PORT=3000
APP_URL=https://main.d[app-id].amplifyapp.com
APP_NAME=Cale加州中医考试系统
NUXT_PUBLIC_API_BASE=https://main.d[app-id].amplifyapp.com

# ============================================
# Email 配置（如需邮件功能）
# ============================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-real-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-real-email@gmail.com
SMTP_FROM_EMAIL=your-real-email@gmail.com
SMTP_FROM_NAME=Cale加州中医考试系统
SMTP_SECURE=false

# ============================================
# Web Push 配置（如需推送通知）
# ============================================

# 生成方法: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=你的公钥
VAPID_PRIVATE_KEY=你的私钥
VAPID_SUBJECT=mailto:your-email@domain.com

# ============================================
# 其他可选配置
# ============================================

# OpenAI API（如使用 AI 功能）
OPENAI_API_KEY=sk-your-key-here
```

---

## 🎯 立即行动项

### 现在需要做的：

1. **更新 .env 文件，移除不必要的引号**
   ```bash
   # 修改这些行
   NODE_ENV=production              # 移除引号
   PORT=3000                        # 移除引号
   NUXT_PUBLIC_API_BASE=临时占位符   # 部署后更新
   ```

2. **添加缺失的必需变量**
   ```bash
   APP_URL=https://临时占位符         # 部署后更新
   APP_NAME=Cale加州中医考试系统
   ```

3. **（可选）配置 Email 服务**
   - 如需用户邮箱验证和密码重置功能
   - 使用 Gmail 应用专用密码

4. **（可选）生成 Web Push 密钥**
   ```bash
   npx web-push generate-vapid-keys
   ```

---

## 📋 AWS Amplify 环境变量设置

在 AWS Amplify Console 设置这些环境变量：

### 必需变量（首次部署）

```
DATABASE_URL=postgresql://postgres:Cwren2016!@database-2.cctouc4g4uv3.us-east-1.rds.amazonaws.com:5432/cale_exam?schema=public
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559
NODE_ENV=production
APP_NAME=Cale加州中医考试系统
```

### 首次部署后添加

```
APP_URL=https://main.d[你的app-id].amplifyapp.com
NUXT_PUBLIC_API_BASE=https://main.d[你的app-id].amplifyapp.com
```

### 可选变量（如需功能）

```
# Email 服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Web Push
VAPID_PUBLIC_KEY=生成的公钥
VAPID_PRIVATE_KEY=生成的私钥
VAPID_SUBJECT=mailto:your-email@domain.com
```

---

## ✅ 部署准备状态

| 项目 | 状态 | 必需 | 备注 |
|------|------|------|------|
| DATABASE_URL | ✅ | 是 | 已配置 AWS RDS |
| JWT_SECRET | ✅ | 是 | 已生成 |
| JWT_REFRESH_SECRET | ✅ | 是 | 已生成 |
| NODE_ENV | ✅ | 是 | production |
| APP_NAME | ⚠️ | 是 | 需要添加 |
| APP_URL | ⚠️ | 是 | 部署后更新 |
| NUXT_PUBLIC_API_BASE | ⚠️ | 是 | 部署后更新 |
| SMTP 配置 | ❌ | 否 | 可选功能 |
| VAPID Keys | ❌ | 否 | 可选功能 |
| OPENAI_API_KEY | ❌ | 否 | 似乎不需要 |

**部署准备度**: 85% ✅

**可以部署**: 是 ✅
- 核心功能所需变量已配置
- 可选功能可后期添加

---

## 🔧 快速修复脚本

创建并运行此脚本更新 .env：

```bash
# 备份现有 .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 更新 .env（移除引号，添加缺失变量）
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:Cwren2016!@database-2.cctouc4g4uv3.us-east-1.rds.amazonaws.com:5432/cale_exam?schema=public

# JWT Secrets
JWT_SECRET=3e63044708ae9a7229a8b3b442bc6819aa4c4c88462500d19d25cbed2edbc379
JWT_REFRESH_SECRET=8ed6d6f3737a4568640fc105c3824490d446a7673eebf1411b7c8e23ec7df559

# Application
NODE_ENV=production
PORT=3000
APP_NAME=Cale加州中医考试系统
APP_URL=https://placeholder-update-after-deploy.com
NUXT_PUBLIC_API_BASE=https://placeholder-update-after-deploy.com

# Email Service (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Web Push (可选)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:your-email@domain.com
EOF

echo "✅ .env 已更新！"
echo "⚠️ 记得部署后更新 APP_URL 和 NUXT_PUBLIC_API_BASE"
```

---

**总结**:
- ✅ 核心配置已完成 85%
- ⚠️ 需要部署后更新 URL 相关变量
- ✅ 可以开始部署到 AWS Amplify
- ⚠️ Email 和 Push 功能需要额外配置（可选）
