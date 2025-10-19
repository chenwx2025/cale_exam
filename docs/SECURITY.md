# 安全性说明

## 依赖安全更新

### Excel/CSV 解析库更新

本项目已从 `xlsx` 库切换到更安全的组合：
- **ExcelJS** (`^4.4.0`) - 用于 Excel 文件解析
- **PapaParse** (`^5.4.1`) - 用于 CSV 文件解析

### 为什么更换？

原来使用的 `xlsx` 库存在已知的安全漏洞：
1. **Prototype Pollution** - 原型污染漏洞
2. **ReDoS** (Regular Expression Denial of Service) - 正则表达式拒绝服务攻击

### 新方案的优势

1. **ExcelJS**
   - 更现代的 API
   - 积极维护
   - 更好的类型支持
   - 支持读写 Excel 文件
   - 无已知安全漏洞

2. **PapaParse**
   - 专注于 CSV 解析
   - 性能优异
   - 安全可靠
   - 广泛使用

## 安全最佳实践

### 1. 文件上传安全

✅ **已实现**：
- 文件类型验证（仅允许 .xlsx, .xls, .csv）
- 文件大小限制（通过 Nuxt 配置）
- 服务器端验证

🔒 **建议添加**：
```typescript
// 在 nuxt.config.ts 中添加
export default defineNuxtConfig({
  nitro: {
    experimental: {
      openAPI: true
    },
    // 限制上传文件大小为 10MB
    maxBodySize: 10 * 1024 * 1024
  }
})
```

### 2. 数据验证

✅ **已实现**：
- 必填字段验证
- 分类代码验证
- 数据类型转换

🔒 **建议添加**：
```typescript
// 添加输入清理
import { sanitize } from 'some-sanitizer-library'

const sanitizedQuestion = sanitize(row.question)
```

### 3. SQL 注入防护

✅ **已实现**：
- 使用 Prisma ORM（自动防护）
- 参数化查询
- 类型安全

### 4. 访问控制

⚠️ **需要实现**：
```typescript
// 添加身份验证中间件
export default defineEventHandler(async (event) => {
  // 验证用户权限
  const session = await getSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      message: '需要管理员权限'
    })
  }

  // 继续处理请求...
})
```

### 5. CSRF 保护

⚠️ **需要实现**：
```bash
npm install h3-csrf
```

```typescript
// server/middleware/csrf.ts
import { csrf } from 'h3-csrf'

export default csrf({
  // CSRF 配置
})
```

### 6. 速率限制

⚠️ **建议实现**：
```bash
npm install @nuxt/rate-limit
```

## 环境变量安全

创建 `.env.example` 文件：
```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT 密钥（生产环境必须更改）
JWT_SECRET="your-secret-key-here"

# API 密钥（如果需要）
API_KEY="your-api-key-here"
```

⚠️ **重要**：
- 永远不要提交 `.env` 文件到版本控制
- 在生产环境使用强密钥
- 定期更换密钥

## 依赖更新

定期检查和更新依赖：

```bash
# 检查过期依赖
npm outdated

# 检查安全漏洞
npm audit

# 自动修复（谨慎使用）
npm audit fix

# 更新依赖
npm update
```

## 生产环境部署清单

- [ ] 使用环境变量管理敏感信息
- [ ] 启用 HTTPS
- [ ] 添加身份验证
- [ ] 实现访问控制
- [ ] 启用 CSRF 保护
- [ ] 添加速率限制
- [ ] 设置适当的 CORS 策略
- [ ] 启用日志记录和监控
- [ ] 定期备份数据库
- [ ] 使用 CDN 加速静态资源

## 报告安全问题

如果您发现安全漏洞，请通过以下方式报告：
- 创建私有 GitHub Issue
- 或发送邮件至项目维护者

**请勿公开披露未修复的安全漏洞**

## 更新日志

### 2025-10-19
- ✅ 将 xlsx 替换为 ExcelJS + PapaParse
- ✅ 修复已知的原型污染和 ReDoS 漏洞
- ✅ 添加文件类型验证

## 推荐的安全工具

1. **依赖检查**
   - `npm audit` - 内置安全审计
   - [Snyk](https://snyk.io/) - 自动化安全扫描

2. **代码扫描**
   - [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
   - [SonarQube](https://www.sonarqube.org/)

3. **运行时保护**
   - [Helmet](https://helmetjs.github.io/) - 设置安全 HTTP 头
   - Rate limiting middleware

## 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Nuxt Security](https://nuxt.com/docs/guide/going-further/security)
