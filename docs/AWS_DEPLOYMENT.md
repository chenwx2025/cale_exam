# AWS 部署指南

本指南提供两种 AWS 部署方案，根据您的需求选择。

## 📋 目录

- [方案一：AWS Amplify（推荐）](#方案一aws-amplify推荐)
- [方案二：AWS EC2 + Docker](#方案二aws-ec2--docker)
- [数据库选择](#数据库选择)
- [成本对比](#成本对比)

---

## 方案一：AWS Amplify（推荐）

### ✨ 特点

- 🚀 最简单，类似 Vercel
- 💰 免费额度充足
- ⚡ 自动部署，全球 CDN
- 🔒 自动 HTTPS
- **无需 Docker，无需服务器管理**

### 📊 免费额度

- 构建时间：1000 分钟/月
- 托管流量：15GB/月（中国区外）
- 存储：15GB

### 🎯 适合场景

- ✅ 个人/小型考试系统
- ✅ 月访问量 < 5000 次
- ✅ 快速上线
- ❌ 不适合需要持久化后台任务（cron）

---

## 🚀 方案一：AWS Amplify 部署步骤

### 第 1 步：准备数据库

#### 选项 A：AWS RDS（推荐用于生产）

```bash
# 1. 访问 AWS RDS 控制台
# 2. 创建数据库
#    - 引擎：PostgreSQL 14
#    - 模板：免费套餐（Free tier）
#    - 实例类型：db.t3.micro 或 db.t4g.micro
#    - 存储：20GB（免费额度）
#    - 公开访问：是（如果 Amplify 需要访问）
#    - VPC 安全组：允许 PostgreSQL (5432) 入站

# 3. 记录连接信息
数据库端点：your-db.xxxxxx.us-east-1.rds.amazonaws.com
端口：5432
用户名：postgres
密码：[您设置的密码]
数据库名：cale_exam
```

**连接字符串格式**：
```
postgresql://postgres:[密码]@[端点]:5432/cale_exam
```

#### 选项 B：Supabase（免费，更简单）

```bash
# 1. 访问 https://supabase.com
# 2. 创建项目
# 3. 获取连接字符串：Settings → Database → Connection string
# 格式：postgresql://postgres:[password]@[host]:5432/postgres
```

---

### 第 2 步：部署到 AWS Amplify

#### 2.1 准备代码

确保代码已推送到 GitHub：

```bash
git add .
git commit -m "准备部署到 AWS"
git push origin main
```

#### 2.2 在 AWS Amplify 创建应用

1. **访问 AWS Amplify 控制台**
   - 登录 AWS 控制台
   - 搜索 "Amplify"
   - 点击 "New app" → "Host web app"

2. **连接 Git 仓库**
   - 选择 "GitHub"
   - 授权访问
   - 选择您的仓库：`cale_exam`
   - 分支：`main`

3. **配置构建设置**

   Amplify 会自动检测 Nuxt 3，但需要自定义构建配置：

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .output/public
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .nuxt/**/*
   ```

4. **添加环境变量**

   在 "Environment variables" 部分添加：

   ```bash
   # 必需变量
   DATABASE_URL=postgresql://postgres:[密码]@[端点]:5432/cale_exam
   JWT_SECRET=生成一个32位随机字符串
   ADMIN_PASSWORD=您的管理员密码
   NODE_ENV=production

   # 可选变量
   APP_URL=https://[您的amplify域名].amplifyapp.com
   PORT=3000
   ```

   **生成 JWT_SECRET**：
   ```bash
   # 在本地终端运行
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **部署**
   - 点击 "Save and deploy"
   - 等待 5-10 分钟（首次部署）
   - 查看构建日志

#### 2.3 数据库迁移

**首次部署后**，需要运行数据库迁移：

```bash
# 方法 1：在本地运行（推荐）
# 临时使用生产数据库 URL
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed

# 方法 2：在 Amplify 控制台添加构建后命令
# 在 amplify.yml 的 preBuild 阶段添加：
- npx prisma migrate deploy
```

#### 2.4 访问应用

部署成功后：
- Amplify 会提供一个域名：`https://main.xxxxxx.amplifyapp.com`
- 访问该域名测试应用
- 登录管理员账号测试功能

---

### 第 3 步：自定义域名（可选）

1. 在 Amplify 控制台点击 "Domain management"
2. 添加您的域名（需要在域名注册商处验证）
3. Amplify 自动配置 SSL 证书

---

### 🔄 后续更新

```bash
# 推送代码到 GitHub
git add .
git commit -m "更新功能"
git push origin main

# Amplify 自动重新部署 ✨
```

---

## ⚠️ AWS Amplify 限制

1. **无法运行持久化后台任务**
   - 您的 `node-cron` 定时任务无法在 Amplify 运行
   - 解决方案：使用 AWS Lambda + EventBridge（见下文）

2. **无法持久化文件存储**
   - 文件上传需要使用 S3
   - 解决方案：集成 AWS S3（见下文）

3. **冷启动**
   - 如果长时间无访问，首次请求可能较慢（1-2秒）

---

## 🔧 AWS Amplify 进阶配置

### 配置定时任务（使用 AWS Lambda）

如果您需要运行 `node-cron` 中的定时任务：

#### 方案：Lambda + EventBridge

1. **创建 Lambda 函数**
   ```bash
   # 在 server/lambda/ 目录创建函数
   mkdir -p server/lambda
   ```

2. **创建定时任务函数**
   ```javascript
   // server/lambda/auto-category.js
   export const handler = async (event) => {
     try {
       // 调用您的 API 端点
       const response = await fetch('https://your-app.amplifyapp.com/api/auto-category', {
         method: 'POST',
         headers: {
           'Authorization': 'Bearer YOUR_INTERNAL_SECRET'
         }
       })

       return {
         statusCode: 200,
         body: JSON.stringify({ message: 'Success' })
       }
     } catch (error) {
       console.error(error)
       return {
         statusCode: 500,
         body: JSON.stringify({ error: error.message })
       }
     }
   }
   ```

3. **在 AWS Lambda 控制台**
   - 创建新函数
   - 运行时：Node.js 18.x
   - 上传代码
   - 配置 EventBridge 触发器（cron 表达式）

4. **EventBridge Cron 表达式**
   ```
   # 每天凌晨 2 点执行
   cron(0 2 * * ? *)

   # 每小时执行
   cron(0 * * * ? *)
   ```

### 配置文件上传（使用 S3）

如果需要文件上传功能：

1. **创建 S3 存储桶**
   - 访问 S3 控制台
   - 创建存储桶（bucket）
   - 配置 CORS 策略

2. **配置 IAM 权限**
   - 创建 IAM 用户
   - 附加 S3 访问策略
   - 获取 Access Key ID 和 Secret Access Key

3. **在应用中集成**
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

4. **添加环境变量**
   ```
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

---

## 方案二：AWS EC2 + Docker

### ✨ 特点

- 🎛️ 完全控制服务器
- ⚙️ 支持持久化任务（cron）
- 🐳 使用 Docker 部署
- 💰 12 个月免费（t2.micro）

### 📊 免费额度（12 个月）

- EC2 实例：750 小时/月（t2.micro 或 t3.micro）
- RDS 数据库：750 小时/月（db.t2.micro）
- 存储：30GB EBS
- 流量：15GB/月

### 🎯 适合场景

- ✅ 需要运行 cron 定时任务
- ✅ 需要完全控制
- ✅ 有 Linux 服务器经验
- ❌ 需要手动管理服务器

---

## 🚀 方案二：EC2 部署步骤

### 第 1 步：启动 EC2 实例

1. **访问 EC2 控制台**
   - 搜索 "EC2"
   - 点击 "Launch instance"

2. **配置实例**
   ```
   名称：cale-exam-server
   AMI：Ubuntu Server 22.04 LTS (Free tier eligible)
   实例类型：t2.micro（免费套餐）
   密钥对：创建新密钥对并下载 .pem 文件
   网络设置：
     - 允许 SSH (22) - 来自您的 IP
     - 允许 HTTP (80) - 来自任何地方
     - 允许 HTTPS (443) - 来自任何地方
   存储：8-30 GB（免费套餐限制）
   ```

3. **启动实例**
   - 点击 "Launch instance"
   - 记录公网 IP 地址

---

### 第 2 步：连接到 EC2 实例

```bash
# 设置密钥文件权限
chmod 400 your-key.pem

# SSH 连接到实例
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# 例如：
ssh -i cale-exam.pem ubuntu@3.123.45.67
```

---

### 第 3 步：安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# 安装 Docker Compose
sudo apt install docker-compose -y

# 安装 Git
sudo apt install git -y

# 重新登录以应用 Docker 权限
exit
# 重新 SSH 连接
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

### 第 4 步：克隆项目

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/cale_exam.git
cd cale_exam

# 创建 .env 文件
cp .env.production.example .env.production

# 编辑环境变量
nano .env.production
```

**配置 `.env.production`**：

```bash
# 数据库配置
DATABASE_URL="postgresql://caleuser:YOUR_PASSWORD@db:5432/cale_exam"

# 安全配置
JWT_SECRET="生成32位随机字符串"
ADMIN_PASSWORD="您的管理员密码"

# 应用配置
NODE_ENV="production"
APP_URL="http://YOUR_EC2_PUBLIC_IP:3001"
PORT=3001

# 数据库密码（用于 docker-compose）
DB_PASSWORD="YOUR_PASSWORD"
```

---

### 第 5 步：启动应用

```bash
# 使用 Docker Compose 启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 等待应用启动（约 1-2 分钟）
# 看到 "Listening on http://[::]:3001" 表示启动成功
```

---

### 第 6 步：配置 Nginx 反向代理（可选但推荐）

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/cale-exam
```

**Nginx 配置内容**：

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**启用配置**：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/cale-exam /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

现在可以通过 `http://YOUR_EC2_PUBLIC_IP` 访问应用（无需端口号）。

---

### 第 7 步：配置 SSL（HTTPS）

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书（需要域名）
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot 会自动配置 Nginx 并设置自动续期
```

---

### 第 8 步：自动更新部署

```bash
# 使项目的部署脚本可执行
chmod +x scripts/deploy.sh

# 运行部署脚本
./scripts/deploy.sh

# 或手动更新
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 🔄 EC2 日常管理

### 查看应用状态

```bash
# 查看运行中的容器
docker-compose ps

# 查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f db

# 查看 Nginx 状态
sudo systemctl status nginx
```

### 重启应用

```bash
# 重启应用容器
docker-compose restart app

# 完全重启所有服务
docker-compose down
docker-compose up -d
```

### 备份数据库

```bash
# 备份数据库
docker-compose exec db pg_dump -U caleuser cale_exam > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
docker-compose exec -T db psql -U caleuser cale_exam < backup_20240101_120000.sql
```

---

## 数据库选择

### AWS RDS PostgreSQL（推荐）

**优势**：
- ✅ 自动备份
- ✅ 高可用性
- ✅ 自动扩展
- ✅ 12 个月免费（db.t2.micro）

**成本**（免费期后）：
- db.t3.micro：约 $15/月
- 20GB 存储：包含在价格内

**设置步骤**：
1. 访问 RDS 控制台
2. 创建数据库 → PostgreSQL 14
3. 选择 "Free tier" 模板
4. 设置主密码
5. 公开访问：根据需要选择
6. 获取端点地址

### Amazon Aurora Serverless（按需付费）

**优势**：
- ✅ 自动扩展
- ✅ 按实际使用付费
- ✅ 无流量时自动暂停

**成本**：
- 按 ACU（Aurora Capacity Unit）计费
- 约 $0.06/ACU-小时

**适合**：流量波动大的应用

### Supabase（第三方，推荐用于开发/小型项目）

**优势**：
- ✅ 完全免费（500MB 数据库）
- ✅ 内置认证和存储
- ✅ 实时数据库功能

**限制**：
- 免费版有请求限制
- 数据在非 AWS 网络（可能增加延迟）

---

## 成本对比

### 方案一：AWS Amplify + Supabase

| 服务 | 免费额度 | 付费后成本 |
|------|---------|-----------|
| **AWS Amplify** | 1000 构建分钟/月<br>15GB 流量/月 | $0.01/构建分钟<br>$0.15/GB 流量 |
| **Supabase** | 500MB 数据库<br>无限 API 请求 | $25/月（Pro 版） |
| **总计** | **$0/月** | 约 $5-30/月 |

**适合**：个人项目、小型应用

---

### 方案二：AWS EC2 + RDS

| 服务 | 免费额度（12 个月） | 付费后成本 |
|------|-------------------|-----------|
| **EC2 t2.micro** | 750 小时/月 | $8-10/月 |
| **RDS db.t3.micro** | 750 小时/月 | $15/月 |
| **EBS 存储** | 30GB | $3/月（30GB） |
| **流量** | 15GB/月出站 | $0.09/GB |
| **总计** | **$0/月**（首年） | 约 $25-35/月 |

**适合**：企业应用、需要完全控制

---

### 方案三：AWS EC2 + Supabase（混合）

| 服务 | 成本 |
|------|------|
| **EC2 t2.micro** | $8-10/月（免费期后） |
| **Supabase** | $0/月（免费版） |
| **总计** | 约 $8-10/月 |

**适合**：需要运行 cron 任务但数据库需求不大

---

## 🎯 选择建议

### 选择 AWS Amplify 如果：
- ✅ 个人/学习项目
- ✅ 月访问量 < 10000 次
- ✅ 不需要持久化后台任务
- ✅ 想要最简单的部署
- ✅ 预算有限（几乎免费）

### 选择 AWS EC2 如果：
- ✅ 需要运行 `node-cron` 定时任务
- ✅ 需要完全控制服务器
- ✅ 有 Linux 服务器管理经验
- ✅ 预算充足（$25-35/月）

### 混合方案（推荐）：
- **初期**：AWS Amplify + Supabase（免费）
- **成长期**：迁移到 EC2 + RDS（完全控制）

---

## 🆘 故障排除

### Amplify 部署失败

**问题**：构建过程中出错

**解决**：
```bash
# 检查构建日志
# 常见问题：
# 1. Prisma 客户端未生成
#    - 在 preBuild 添加：npx prisma generate

# 2. 环境变量缺失
#    - 确认 DATABASE_URL, JWT_SECRET 已设置

# 3. 数据库连接失败
#    - 检查 RDS 安全组是否允许外部访问
#    - 确认连接字符串格式正确
```

### EC2 应用无法访问

**问题**：无法通过浏览器访问

**解决**：
```bash
# 1. 检查 EC2 安全组
#    - 确保端口 80, 443, 3001 已开放

# 2. 检查应用是否运行
docker-compose ps

# 3. 检查 Nginx 状态
sudo systemctl status nginx

# 4. 查看应用日志
docker-compose logs app
```

### 数据库连接失败

**问题**：应用无法连接到数据库

**解决**：
```bash
# RDS 数据库
# 1. 检查安全组规则（端口 5432）
# 2. 确认公开访问已启用（如果从 Amplify 访问）
# 3. 测试连接
psql -h your-db.xxxxx.rds.amazonaws.com -U postgres -d cale_exam

# Supabase
# 1. 确认连接字符串正确
# 2. 检查 Supabase 项目是否暂停（免费版会自动暂停）
# 3. 访问 Supabase 控制台唤醒项目
```

---

## 📚 相关文档

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [QUICK_START.md](./QUICK_START.md) - 快速开始
- [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md) - 部署前检查清单
- [AWS Amplify 官方文档](https://docs.amplify.aws/)
- [AWS EC2 官方文档](https://docs.aws.amazon.com/ec2/)
- [AWS RDS 官方文档](https://docs.aws.amazon.com/rds/)

---

## 🎓 下一步

1. **决定部署方案**：Amplify 或 EC2
2. **准备数据库**：RDS 或 Supabase
3. **按照上述步骤部署**
4. **测试应用功能**
5. **配置域名和 SSL**
6. **设置监控和备份**

需要帮助？请参考故障排除部分或查看相关文档。
