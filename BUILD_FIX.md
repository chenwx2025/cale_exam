# 构建错误修复说明

**问题时间**: 2025-10-26
**错误类型**: DATABASE_URL 环境变量在构建时未找到

---

## 🐛 问题描述

### 错误信息
```
[WARNING]: [error] [Scheduler] Study reminder task failed:
Invalid `prisma.notificationSettings.findMany()` invocation:
error: Environment variable not found: DATABASE_URL.
-->  schema.prisma:10
|
9 |   provider = "postgresql"
10 |   url      = env("DATABASE_URL")
```

### 问题原因

1. **定时任务在构建时执行**
   - `server/plugins/scheduler.ts` 在构建（预渲染）阶段就被加载
   - Nitro 插件在构建时也会初始化
   - 定时任务立即尝试连接数据库

2. **构建环境缺少 DATABASE_URL**
   - 本地构建时 .env 可能未加载
   - Amplify 构建环境中，在 build 阶段还没有运行时环境变量

3. **预渲染路由触发数据库查询**
   - Nuxt 配置了预渲染路由：`['/', '/outline']`
   - 预渲染时触发了定时任务

---

## ✅ 解决方案

### 修改 1: `server/plugins/scheduler.ts`

添加了预渲染检测和环境变量检查：

```typescript
export default defineNitroPlugin((nitroApp) => {
  // 只在运行时初始化定时任务，不在构建/预渲染时初始化
  const isPrerendering = import.meta.prerender || process.env.NITRO_PRESET === 'cloudflare-pages'

  if (!isPrerendering && process.env.DATABASE_URL) {
    initScheduler()
    console.log('[Plugin] Scheduler plugin loaded and started')
  } else {
    console.log('[Plugin] Scheduler plugin skipped (prerendering or no DATABASE_URL)')
  }
})
```

**改动**:
- ✅ 检查是否在预渲染阶段
- ✅ 检查 DATABASE_URL 是否存在
- ✅ 只在运行时启动定时任务

### 修改 2: `server/utils/scheduler.ts`

添加了双重保护：

```typescript
export function initScheduler() {
  // 确保有数据库连接
  if (!process.env.DATABASE_URL) {
    console.warn('[Scheduler] DATABASE_URL not found, scheduler will not start')
    return
  }

  console.log('[Scheduler] Initializing notification scheduler...')
  // ... 其他代码
}
```

**改动**:
- ✅ 在函数入口处检查 DATABASE_URL
- ✅ 如果没有数据库，直接返回不启动任何定时任务

---

## 📊 修复后的行为

### 本地开发
- ✅ `.env` 存在时，定时任务正常启动
- ✅ 定时任务每分钟检查学习提醒
- ✅ 可以正常开发和测试

### 构建阶段
- ✅ 预渲染时跳过定时任务
- ✅ 不会尝试连接数据库
- ✅ 构建成功完成

### AWS Amplify 部署
- ✅ 构建阶段：定时任务被跳过
- ✅ 部署后运行时：定时任务正常启动（有 DATABASE_URL）
- ✅ 功能完整

---

## 🧪 验证

### 测试本地构建
```bash
npm run build
# 应该看到：[Plugin] Scheduler plugin skipped (prerendering or no DATABASE_URL)
# 构建应该成功
```

### 测试本地运行
```bash
npm run dev
# 应该看到：[Plugin] Scheduler plugin loaded and started
# [Scheduler] ✅ Notification scheduler started successfully
```

### 测试 Amplify 部署
1. 构建日志应该显示 "Scheduler plugin skipped"
2. 运行时日志应该显示 "Scheduler plugin loaded and started"

---

## 🔧 相关修改

### 文件清单
- ✅ `server/plugins/scheduler.ts` - 添加预渲染检测
- ✅ `server/utils/scheduler.ts` - 添加环境变量检查

### 依赖修复
- ✅ 重新安装 `@nuxtjs/tailwindcss`

---

## 💡 最佳实践

### 1. Nitro 插件中的数据库访问

**问题**: 插件在构建时也会加载

**解决**:
```typescript
export default defineNitroPlugin((nitroApp) => {
  // ❌ 不好 - 直接访问数据库
  const prisma = new PrismaClient()

  // ✅ 好 - 检查环境
  if (!import.meta.prerender && process.env.DATABASE_URL) {
    const prisma = new PrismaClient()
  }
})
```

### 2. 定时任务初始化

**问题**: 在构建时启动定时任务没有意义

**解决**:
```typescript
export function initScheduler() {
  // ✅ 检查运行时环境
  if (!process.env.DATABASE_URL) {
    return
  }

  // 启动定时任务
  cron.schedule(...)
}
```

### 3. 预渲染配置

**当前配置** (nuxt.config.ts):
```typescript
nitro: {
  prerender: {
    crawlLinks: true,
    routes: ['/', '/outline']
  }
}
```

**建议**:
- ✅ 只预渲染真正的静态页面
- ✅ 避免预渲染需要数据库的页面

---

## 🚀 部署建议

### AWS Amplify

1. **环境变量设置**
   - 在 Amplify Console 设置所有必需变量
   - 包括 DATABASE_URL

2. **构建命令** (amplify.yml)
   ```yaml
   build:
     commands:
       - npm run build  # 会跳过定时任务
   ```

3. **验证步骤**
   - 检查构建日志：确认 "Scheduler plugin skipped"
   - 检查运行时日志：确认 "Scheduler plugin loaded"

---

## ✅ 总结

### 问题
- ❌ 定时任务在构建时尝试访问数据库
- ❌ DATABASE_URL 在构建环境不可用

### 解决
- ✅ 添加预渲染检测
- ✅ 添加环境变量检查
- ✅ 只在运行时启动定时任务

### 影响
- ✅ 不影响功能
- ✅ 构建可以成功
- ✅ 部署后定时任务正常工作

---

**状态**: ✅ 已修复
**测试**: 待验证构建
**部署**: 可以继续部署
