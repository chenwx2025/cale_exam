# 管理员账号信息

## 🔐 管理员账号

### 账号详情

```
邮箱：chenwx2012@yahoo.com
密码：admin123
姓名：Chen Wenxiang
角色：admin
状态：active
```

### 登录地址

**本地开发环境**：
```
http://localhost:3001/auth/login
```

**生产环境**：
```
https://your-domain.com/auth/login
```

---

## ✨ 功能特性

### 1. 自动角色检测

系统会在登录时自动检测用户角色：

- ✅ **管理员用户** (`role: admin`) → 自动跳转到 `/admin` 管理后台
- ✅ **普通用户** (`role: user`) → 跳转到 `/` 首页

### 2. 管理后台访问

登录后管理员可以访问：

- 📊 `/admin` - 管理员仪表盘
- 📝 `/admin/questions` - 题目管理
- 📂 `/admin/categories` - 分类管理
- 👥 `/admin/users` - 用户管理
- 📈 `/admin/analytics` - 数据分析
- ⚙️ `/admin/settings` - 系统设置

### 3. 权限保护

所有管理员页面都受到中间件保护：
- 未登录用户会被重定向到登录页面
- 非管理员用户无法访问管理页面

---

## 🚀 快速测试

### 步骤 1：启动开发服务器

```bash
npm run dev
```

### 步骤 2：访问登录页面

打开浏览器访问：
```
http://localhost:3001/auth/login
```

### 步骤 3：使用管理员账号登录

在登录页面输入：
- **邮箱**：`chenwx2012@yahoo.com`
- **密码**：`admin123`

### 步骤 4：验证自动跳转

✅ 登录成功后应该自动跳转到 `/admin` 管理后台

---

## 🔧 管理命令

### 重新创建管理员账号

如果需要重新创建管理员账号（例如重置密码）：

```bash
npx tsx scripts/create-admin.ts
```

**脚本功能**：
- 如果账号不存在，创建新的管理员账号
- 如果账号已存在但不是管理员，升级为管理员角色
- 如果账号已存在且是管理员，显示账号信息

### 手动修改用户角色

使用 Prisma Studio：

```bash
npm run db:studio
```

然后在浏览器中：
1. 打开 `User` 表
2. 找到目标用户
3. 修改 `role` 字段为 `admin`
4. 保存更改

---

## 🔒 安全建议

### 开发环境

- ✅ 使用默认密码 `admin123` 可以接受
- ✅ 账号仅在本地可访问

### 生产环境

**部署前必须修改：**

1. **修改密码**
   ```bash
   # 编辑脚本
   nano scripts/create-admin.ts

   # 修改这一行
   const password = 'your-strong-password-here'

   # 重新运行脚本
   npx tsx scripts/create-admin.ts
   ```

2. **使用强密码**
   - 最少 12 位字符
   - 包含大小写字母、数字、特殊字符
   - 不使用常见词汇
   - 示例：`MyS3cur3P@ssw0rd2024!`

3. **定期更换密码**
   - 建议每 90 天更换一次
   - 不要与其他系统使用相同密码

4. **启用多因素认证（可选）**
   - 可以集成 2FA/MFA 增强安全性

5. **限制登录尝试次数**
   - 防止暴力破解
   - 可以在登录 API 中添加速率限制

---

## 📝 数据库结构

### User 表字段

```typescript
{
  id: string                // 用户ID
  email: string             // 邮箱（唯一）
  password: string          // 加密密码（bcrypt）
  name: string              // 姓名
  nickname: string?         // 昵称
  avatar: string?           // 头像URL
  role: string              // 角色：'user' | 'admin'
  emailVerified: boolean    // 邮箱验证状态
  status: string            // 状态：'active' | 'suspended' | 'deleted'
  lastLoginAt: DateTime?    // 最后登录时间
  loginCount: number        // 登录次数
  tokenVersion: number      // Token版本（用于撤销）
  createdAt: DateTime       // 创建时间
  updatedAt: DateTime       // 更新时间
}
```

---

## 🎯 测试清单

使用以下清单验证管理员功能：

### 登录测试
- [ ] 访问登录页面显示正常
- [ ] 输入管理员邮箱和密码
- [ ] 点击登录按钮
- [ ] 检查是否自动跳转到 `/admin`
- [ ] 浏览器控制台显示 "✅ 检测到管理员身份，跳转到管理后台..."

### 权限测试
- [ ] 已登录管理员可以访问 `/admin`
- [ ] 已登录管理员可以访问 `/admin/questions`
- [ ] 已登录管理员可以访问 `/admin/users`
- [ ] 未登录用户访问 `/admin` 会被重定向到登录页
- [ ] 普通用户无法访问管理页面

### 数据持久化测试
- [ ] 登录后刷新页面，仍保持登录状态
- [ ] 关闭浏览器重新打开，仍保持登录状态（如果选择"记住我"）
- [ ] 登出后清除所有认证数据
- [ ] 登出后访问 `/admin` 会被重定向

### UI 测试
- [ ] 登录页面显示管理员账号提示
- [ ] 错误消息正确显示（密码错误、网络错误等）
- [ ] 加载状态正确显示
- [ ] 管理后台界面正常显示

---

## 🐛 常见问题

### Q1: 登录后没有跳转到管理后台

**可能原因**：
- 用户角色不是 `admin`
- 前端路由配置问题

**解决方法**：
```bash
# 1. 检查用户角色
npx prisma studio
# 查看 User 表，确认 role 字段为 'admin'

# 2. 检查浏览器控制台
# 应该看到 "✅ 检测到管理员身份，跳转到管理后台..."

# 3. 重新运行创建脚本
npx tsx scripts/create-admin.ts
```

### Q2: 提示"邮箱或密码错误"

**解决方法**：
```bash
# 确认邮箱和密码正确
# 邮箱：chenwx2012@yahoo.com
# 密码：admin123

# 如果忘记密码，重新创建
npx tsx scripts/create-admin.ts
```

### Q3: 访问 /admin 显示 403 或重定向

**可能原因**：
- 未登录
- 不是管理员角色
- Token 过期

**解决方法**：
```bash
# 1. 重新登录
# 2. 清除浏览器缓存和 localStorage
# 3. 检查用户角色
```

### Q4: 管理后台页面空白或报错

**解决方法**：
```bash
# 1. 检查浏览器控制台错误
# 2. 确认 API 端点正常
# 3. 检查 authStore 状态
```

---

## 📚 相关文件

### 核心文件

- **账号创建脚本**：`scripts/create-admin.ts`
- **登录页面**：`pages/auth/login.vue`
- **登录 API**：`server/api/auth/login.post.ts`
- **Auth Store**：`stores/auth.ts`
- **管理后台首页**：`pages/admin/index.vue`
- **管理员中间件**：`middleware/admin.ts`

### 配置文件

- **数据库模型**：`prisma/schema.prisma`
- **密码工具**：`server/utils/password.ts`
- **JWT 工具**：`server/utils/jwt.ts`

---

## 📞 支持

如果遇到问题：

1. 查看浏览器控制台错误
2. 查看服务器日志
3. 检查数据库数据
4. 参考本文档的常见问题部分

---

**最后更新**：2024年（根据实际日期）
**维护者**：System Administrator
