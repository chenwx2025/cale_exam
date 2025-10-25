# 安全性评估与改进方案

**评估日期**: 2025-10-24
**当前评分**: 8/10
**目标评分**: 9/10 或 10/10

---

## 📊 当前安全状况分析

### ✅ 已实现的安全措施 (8/10)

1. **JWT 认证系统** ✅
   - Token 生成和验证
   - 刷新 Token 机制
   - Token 过期时间设置

2. **密码安全** ✅
   - bcrypt 密码哈希 (10 rounds)
   - 密码比较验证
   - 100% 测试覆盖

3. **基础权限控制** ✅
   - `requireAuth()` - 用户认证检查
   - `requireAdmin()` - 管理员权限检查
   - `requireExamSubscription()` - 订阅验证

4. **输入序列化** ✅
   - 日期、布尔值、数字的安全处理
   - JSON 对象序列化

---

## ⚠️ 安全漏洞和缺失 (为什么只有 8/10)

### 🔴 高优先级（必须修复以达到 9/10）

#### 1. **Rate Limiting (速率限制)** - 缺失 ❌
**风险**: 暴力破解、DDoS 攻击、API 滥用

**影响范围**:
- `/api/auth/login` - 可被暴力破解
- `/api/auth/register` - 可被滥用注册
- `/api/auth/refresh-token` - 可被无限请求
- 所有 POST/PUT/DELETE 端点

**现状**: 无任何速率限制

**推荐方案**:
```typescript
// server/middleware/rate-limit.ts
import { defineEventHandler } from 'h3'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export default defineEventHandler((event) => {
  const ip = getRequestIP(event)
  const path = event.path

  // 不同端点不同限制
  const limits = {
    '/api/auth/login': { max: 5, window: 15 * 60 * 1000 }, // 5次/15分钟
    '/api/auth/register': { max: 3, window: 60 * 60 * 1000 }, // 3次/小时
    'default': { max: 100, window: 60 * 1000 } // 100次/分钟
  }

  // 检查和更新速率限制
  // ...实现逻辑
})
```

**预期评分提升**: +0.5

---

#### 2. **CSRF 保护** - 缺失 ❌
**风险**: 跨站请求伪造攻击

**影响范围**:
- 所有状态修改操作（POST/PUT/DELETE）
- 表单提交
- 重要操作（删除账户、修改密码等）

**现状**: 无 CSRF token 验证

**推荐方案**:
```typescript
// server/middleware/csrf.ts
import { defineEventHandler, getCookie, getHeader } from 'h3'

export default defineEventHandler((event) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(event.method)) {
    const csrfToken = getHeader(event, 'x-csrf-token')
    const csrfCookie = getCookie(event, 'csrf-token')

    if (csrfToken !== csrfCookie) {
      throw createError({
        statusCode: 403,
        message: 'Invalid CSRF token'
      })
    }
  }
})
```

**预期评分提升**: +0.3

---

#### 3. **输入验证和清理** - 部分缺失 ⚠️
**风险**: XSS、SQL 注入、数据污染

**影响范围**:
- 用户输入（帖子、评论、笔记）
- 文件上传
- URL 参数

**现状**: 基础序列化，但缺少 HTML 清理

**推荐方案**:
```typescript
// server/utils/input-sanitizer.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  })
}

export function sanitizeMarkdown(markdown: string): string {
  // 移除潜在危险的 markdown
  return markdown
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
}
```

**预期评分提升**: +0.2

---

### 🟡 中优先级（改进以达到 10/10）

#### 4. **JWT Secret 强度** - 需要改进 ⚠️
**风险**: Token 被暴力破解

**现状**:
```
.env: JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

**问题**:
- 示例密钥可能未在生产环境更改
- 密钥强度不足

**推荐方案**:
```typescript
// server/utils/security-check.ts
export function validateJWTSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters')
  }

  if (secret.includes('example') || secret.includes('your-')) {
    throw new Error('JWT_SECRET must be changed from default')
  }
}

// 在启动时验证
validateJWTSecret()
```

**生成强密钥**:
```bash
# 使用 Node.js 生成
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**预期评分提升**: +0.3

---

#### 5. **密码策略** - 缺失 ❌
**风险**: 弱密码被轻易破解

**现状**: 无密码强度要求

**推荐方案**:
```typescript
// server/utils/password-policy.ts
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('密码至少 8 个字符')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含数字')
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('密码必须包含特殊字符')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

**预期评分提升**: +0.2

---

#### 6. **Session 管理** - 缺失 ❌
**风险**: 无法追踪活跃会话、无法远程登出

**现状**: 仅依赖 JWT，无会话表

**推荐方案**:
```prisma
// prisma/schema.prisma
model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  refreshToken String?  @unique
  ipAddress    String?
  userAgent    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  lastActiveAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}
```

**功能**:
- 追踪所有活跃会话
- 远程登出所有设备
- 检测可疑登录
- 会话过期管理

**预期评分提升**: +0.3

---

#### 7. **HTTP 安全头** - 缺失 ❌
**风险**: XSS、点击劫持、MIME 类型嗅探

**现状**: 无安全头设置

**推荐方案**:
```typescript
// server/middleware/security-headers.ts
export default defineEventHandler((event) => {
  setHeaders(event, {
    // XSS 保护
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',

    // CSP
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join('; '),

    // HTTPS 强制
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

    // 引用策略
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // 权限策略
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  })
})
```

**预期评分提升**: +0.2

---

#### 8. **SQL 注入防护** - 部分缺失 ⚠️
**风险**: 数据库被攻击

**现状**: 使用 Prisma ORM（天然防护），但部分原始查询可能有风险

**推荐方案**:
```typescript
// 审计所有使用 $queryRaw 的地方
// 确保参数化查询

// ❌ 不安全
const result = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`

// ✅ 安全
const result = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${Prisma.sql([userInput])}`

// 或者使用 Prisma 的类型安全 API
const result = await prisma.user.findUnique({ where: { email: userInput } })
```

**预期评分提升**: +0.1

---

#### 9. **文件上传安全** - 需要验证 ⚠️
**风险**: 恶意文件上传、服务器被攻击

**推荐方案**:
```typescript
// server/utils/file-upload-security.ts
export function validateFileUpload(file: File) {
  // 文件类型白名单
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4'
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error('不支持的文件类型')
  }

  // 文件大小限制
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    throw new Error('文件过大')
  }

  // 文件名清理
  const safeName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')

  return safeName
}

// 病毒扫描（可选）
export async function scanFileForVirus(filePath: string) {
  // 集成 ClamAV 或其他病毒扫描工具
}
```

**预期评分提升**: +0.2

---

#### 10. **敏感数据加密** - 缺失 ❌
**风险**: 数据库泄露时敏感信息暴露

**推荐方案**:
```typescript
// server/utils/encryption.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // 32 字节密钥
const IV_LENGTH = 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY!), iv)

  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])

  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string): string {
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY!), iv)

  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}
```

**加密字段**:
- 邮箱（可选）
- 电话号码
- 敏感个人信息

**预期评分提升**: +0.2

---

## 📈 安全评分提升路径

### 方案 A: 快速提升至 9/10 (推荐，约 2-3 小时)

**必做项目**:
1. ✅ **Rate Limiting** (+0.5) - 1 小时
2. ✅ **CSRF 保护** (+0.3) - 30 分钟
3. ✅ **输入验证和清理** (+0.2) - 45 分钟
4. ✅ **HTTP 安全头** (+0.2) - 15 分钟

**总提升**: +1.2 → **9.2/10**
**时间**: 2.5 小时

---

### 方案 B: 全面提升至 10/10 (完整方案，约 6-8 小时)

**包含方案 A 所有项目 +**:
5. ✅ **JWT Secret 强度验证** (+0.3) - 30 分钟
6. ✅ **密码策略** (+0.2) - 45 分钟
7. ✅ **Session 管理** (+0.3) - 2 小时
8. ✅ **SQL 注入审计** (+0.1) - 30 分钟
9. ✅ **文件上传安全** (+0.2) - 1 小时
10. ✅ **敏感数据加密** (+0.2) - 1 小时

**总提升**: +2.0 → **10/10**
**时间**: 7-8 小时

---

## 🔍 安全审计清单

### 代码审计
- [ ] 检查所有 API 端点的认证
- [ ] 审计所有数据库查询（SQL 注入）
- [ ] 检查所有用户输入处理（XSS）
- [ ] 验证文件上传逻辑
- [ ] 检查环境变量和密钥

### 配置审计
- [ ] .env 文件不在 git 中
- [ ] .gitignore 包含敏感文件
- [ ] 生产环境密钥足够强
- [ ] 数据库连接使用 SSL

### 依赖审计
```bash
# 检查依赖漏洞
npm audit

# 修复可修复的漏洞
npm audit fix

# 查看详细报告
npm audit --json
```

### 运行时审计
- [ ] 启用日志记录
- [ ] 监控异常登录
- [ ] 追踪失败的认证尝试
- [ ] 设置告警机制

---

## 📦 推荐的安全包

```json
{
  "dependencies": {
    "helmet": "^7.0.0",           // HTTP 安全头
    "express-rate-limit": "^7.0.0", // Rate limiting
    "csrf": "^3.1.0",              // CSRF 保护
    "isomorphic-dompurify": "^2.0.0", // HTML 清理
    "validator": "^13.11.0"        // 输入验证
  },
  "devDependencies": {
    "eslint-plugin-security": "^1.7.1" // 安全 lint
  }
}
```

---

## 🎯 实施优先级

### 立即实施（达到 9/10）
1. Rate Limiting
2. CSRF 保护
3. 输入验证和清理
4. HTTP 安全头

### 短期实施（1-2 周内）
5. JWT Secret 验证
6. 密码策略
7. SQL 注入审计

### 中期实施（1 个月内）
8. Session 管理
9. 文件上传安全
10. 敏感数据加密

---

## 🚨 紧急安全检查清单（发布前必做）

- [ ] 所有密钥已更换为生产密钥
- [ ] .env.example 不包含真实密钥
- [ ] 数据库备份策略已设置
- [ ] HTTPS 已启用
- [ ] CORS 已正确配置
- [ ] 错误消息不泄露敏感信息
- [ ] 日志记录已启用
- [ ] 依赖漏洞已修复 (`npm audit`)

---

## 📊 预期最终评分

| 措施 | 提升 | 累计评分 |
|------|------|----------|
| 当前状态 | - | 8.0/10 |
| + Rate Limiting | +0.5 | 8.5/10 |
| + CSRF 保护 | +0.3 | 8.8/10 |
| + 输入清理 | +0.2 | 9.0/10 |
| + HTTP 安全头 | +0.2 | 9.2/10 |
| + JWT Secret 验证 | +0.3 | 9.5/10 |
| + 密码策略 | +0.2 | 9.7/10 |
| + Session 管理 | +0.3 | 10.0/10 |

---

**评估人**: 开发团队
**下次评估**: 实施改进后
**优先级**: 高（方案 A）/ 中（方案 B）
