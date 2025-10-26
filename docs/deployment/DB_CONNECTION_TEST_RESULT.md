# 数据库连接测试结果

**测试时间**: 2025-10-25
**数据库类型**: AWS RDS PostgreSQL

---

## 📊 测试结果

### ✅ 配置验证
- ✅ Prisma schema 有效
- ✅ DATABASE_URL 配置正确
- ✅ Prisma Client 生成成功

### ⚠️ 连接测试
- ❌ **无法连接到 AWS RDS PostgreSQL**

---

## 🔍 测试详情

### 数据库配置
```
主机: database-2.cctouc4g4uv3.us-east-1.rds.amazonaws.com
端口: 5432
数据库: cale_exam
用户: postgres
区域: us-east-1
```

### 错误信息
```
Can't reach database server at `database-2.cctouc4g4uv3.us-east-1.rds.amazonaws.com:5432`
```

---

## 🔧 可能的原因

### 1. AWS RDS 安全组配置（最可能）

RDS 安全组可能没有允许你当前的 IP 地址访问。

**解决方案**:
1. 打开 [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. 左侧菜单 → Network & Security → Security Groups
3. 找到 RDS 实例的安全组
4. Inbound rules → Edit inbound rules
5. 添加规则：
   ```
   类型: PostgreSQL
   协议: TCP
   端口范围: 5432
   来源: My IP (自动检测) 或 0.0.0.0/0 (所有IP，测试用)
   描述: Allow PostgreSQL access
   ```

### 2. RDS 实例状态

RDS 实例可能未运行或正在维护。

**检查方法**:
1. 打开 [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. 选择 Databases
3. 找到 `database-2`
4. 检查状态是否为 "Available"

### 3. 公开可访问性设置

RDS 实例可能未设置为公开可访问。

**检查方法**:
1. 在 RDS Console 选择你的数据库
2. Connectivity & security 标签页
3. 检查 "Publicly accessible" 是否为 "Yes"

### 4. VPC 和子网配置

数据库可能在私有子网中，无法从公网访问。

**解决方案**:
- 使用 VPC 内的 EC2 实例测试连接
- 或配置 VPN/Direct Connect
- 或修改 RDS 到公有子网（需要重新创建）

---

## ✅ 下一步行动

### 方案 A: 修复 AWS RDS 连接（推荐）

1. **检查 RDS 状态**
   - 确认实例状态为 "Available"
   - 确认端点地址正确

2. **配置安全组**
   - 允许入站 PostgreSQL 连接（端口 5432）
   - 临时使用 0.0.0.0/0 测试

3. **测试连接**
   - 使用本地测试脚本
   - 或使用 pgAdmin/DBeaver 等工具

4. **部署到 Amplify**
   - 连接成功后即可部署
   - Amplify 会从美国区域连接 RDS

### 方案 B: 使用本地 PostgreSQL（临时测试）

如果你想先测试部署流程：

1. **安装本地 PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **创建数据库**
   ```bash
   createdb cale_exam
   ```

3. **更新 .env**
   ```bash
   DATABASE_URL=postgresql://postgres@localhost:5432/cale_exam?schema=public
   ```

4. **推送 schema**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### 方案 C: 直接部署到 Amplify（使用 RDS）

即使本地无法连接，Amplify 部署后可能可以连接（因为在同一 AWS 区域）：

1. **配置环境变量**
   - DATABASE_URL 使用 AWS RDS 地址
   - 其他必需变量（JWT_SECRET 等）

2. **部署到 Amplify**
   - 按照 [START_DEPLOY.md](START_DEPLOY.md) 操作
   - 观察构建日志

3. **如果构建失败**
   - 检查 Amplify 构建日志中的数据库错误
   - 可能需要配置 VPC 或安全组

---

## 🔗 AWS RDS 安全组配置步骤

### 快速配置（测试用）

1. **找到安全组ID**
   ```bash
   # 在 RDS Console 中复制安全组 ID
   # 格式: sg-xxxxxxxxxx
   ```

2. **添加入站规则**
   ```
   类型: PostgreSQL
   端口: 5432
   来源: 0.0.0.0/0
   描述: Temporary test access
   ```

3. **保存并测试**
   ```bash
   # 等待几秒让规则生效
   npm run test:db  # 如果有这个脚本
   # 或
   node test-db-connection.js
   ```

### 生产环境配置

```
来源: Amplify IP 范围 或特定 CIDR
描述: Amplify access only
```

---

## 📞 获取帮助

### AWS RDS 文档
- [配置安全组](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.RDSSecurityGroups.html)
- [连接到 PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToPostgreSQLInstance.html)

### 测试工具
- pgAdmin: https://www.pgadmin.org/
- DBeaver: https://dbeaver.io/
- TablePlus: https://tableplus.com/

---

## 💡 建议

1. **优先修复 RDS 连接**
   - 这是生产环境必需的
   - 修复后本地和 Amplify 都能使用

2. **临时使用本地数据库**
   - 如果急于测试部署流程
   - 稍后再迁移到 RDS

3. **直接部署测试**
   - Amplify 在 AWS 内网
   - 可能即使本地连不上，Amplify 也能连

---

**建议**: 先检查 AWS RDS 安全组配置，这是最常见的问题！
