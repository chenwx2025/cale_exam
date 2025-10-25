# Token自动刷新解决方案

## 问题描述

用户反馈token频繁过期，导致：
1. 需要频繁重新登录
2. 正在操作时突然失效
3. 刷新页面后丢失登录状态

## 解决方案

### 1. 延长Token有效期

**修改文件**: `server/utils/jwt.ts`

```typescript
// 之前
const ACCESS_TOKEN_EXPIRES_IN = '2h'  // 2小时
const REFRESH_TOKEN_EXPIRES_IN = '7d' // 7天

// 现在
const ACCESS_TOKEN_EXPIRES_IN = '24h'  // 24小时
const REFRESH_TOKEN_EXPIRES_IN = '30d' // 30天
```

**改进**:
- Access Token从2小时延长到24小时
- Refresh Token从7天延长到30天
- 大幅减少token过期频率

### 2. 自动刷新机制

**新文件**: `composables/useAutoRefreshToken.ts`

**功能**:
- ✅ Token即将过期前自动刷新（提前5分钟）
- ✅ 页面激活/获得焦点时检查token有效性
- ✅ 每分钟定期检查token状态
- ✅ 智能计划下次刷新时间

**核心逻辑**:
```typescript
const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000 // 提前5分钟刷新
const CHECK_INTERVAL = 60 * 1000 // 每分钟检查一次
```

### 3. 全局自动启动

**新文件**: `plugins/auto-refresh-token.client.ts`

**功能**:
- 应用启动时自动启动token刷新机制
- 无需手动调用，完全自动化

### 4. API请求拦截器

**新文件**: `plugins/api-interceptor.client.ts`

**功能**:
- ✅ 拦截401错误
- ✅ 自动刷新token
- ✅ 重试失败的请求
- ✅ 避免并发刷新
- ✅ 刷新失败自动跳转登录页

**工作流程**:
```
API请求 → 401错误 → 刷新token → 重试请求 → 成功
                      ↓ 失败
                  清除登录 → 跳转登录页
```

## 使用效果

### 用户体验改善

1. **无感刷新**: 用户几乎感觉不到token刷新过程
2. **减少登录**: 30天内无需重新登录
3. **智能检测**: 页面激活时自动检查并刷新
4. **自动重试**: API失败自动刷新并重试，无需手动操作

### 技术优势

1. **提前刷新**: 在过期前5分钟刷新，避免请求失败
2. **避免并发**: 多个请求同时401时，只刷新一次
3. **请求队列**: 刷新期间的请求自动排队等待
4. **失败处理**: 刷新失败自动清理并跳转登录

## 配置说明

### Token有效期配置

在 `server/utils/jwt.ts` 中调整：

```typescript
// 开发环境：短期token方便测试
const ACCESS_TOKEN_EXPIRES_IN = '1h'

// 生产环境：长期token提升体验
const ACCESS_TOKEN_EXPIRES_IN = '24h'
```

### 刷新策略配置

在 `composables/useAutoRefreshToken.ts` 中调整：

```typescript
// 提前刷新时间（毫秒）
const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000 // 5分钟

// 检查间隔（毫秒）
const CHECK_INTERVAL = 60 * 1000 // 1分钟
```

## 监控与调试

### 控制台日志

刷新机制会输出详细日志：

```
[AutoRefresh] 启动自动刷新机制
[AutoRefresh] 将在 115 分钟后刷新token
[AutoRefresh] 开始刷新token...
[AutoRefresh] ✅ Token刷新成功
[API拦截器] 检测到401错误，尝试刷新token
[API拦截器] Token刷新成功，重试请求
```

### 常见日志含义

- `启动自动刷新机制` - 插件已加载
- `将在 X 分钟后刷新token` - 已计划下次刷新
- `Token刷新成功` - 刷新成功
- `检测到401错误` - API请求失败，开始自动处理

## 故障排除

### Token仍然过期

**检查**:
1. 浏览器控制台是否有刷新日志？
2. localStorage中是否有refreshToken？
3. API `/api/auth/refresh` 是否正常工作？

**解决**:
```bash
# 清除浏览器存储并重新登录
localStorage.clear()
```

### 频繁刷新

**原因**: REFRESH_BEFORE_EXPIRY设置过大

**解决**: 调整刷新提前时间
```typescript
const REFRESH_BEFORE_EXPIRY = 2 * 60 * 1000 // 改为2分钟
```

### 刷新失败

**检查**:
1. 网络连接是否正常？
2. Refresh Token是否有效？
3. 服务器是否正常运行？

**日志**:
```
[AutoRefresh] ❌ Token刷新失败
[API拦截器] Token刷新失败，跳转登录
```

## 安全性

### 最佳实践

1. **生产环境必须修改JWT密钥**
   ```bash
   # .env
   JWT_SECRET=your-very-secure-random-secret-key
   JWT_REFRESH_SECRET=your-other-secure-random-secret-key
   ```

2. **HTTPS传输**
   - 生产环境必须使用HTTPS
   - 防止token被拦截

3. **Token版本控制**
   - Refresh Token包含版本号
   - 可以主动失效所有token

## 依赖包

```json
{
  "dependencies": {
    "jwt-decode": "^4.0.0"
  }
}
```

## 文件清单

1. `server/utils/jwt.ts` - Token有效期配置（已修改）
2. `composables/useAutoRefreshToken.ts` - 自动刷新逻辑（新增）
3. `plugins/auto-refresh-token.client.ts` - 自动启动插件（新增）
4. `plugins/api-interceptor.client.ts` - API拦截器（新增）

## 测试建议

### 手动测试

1. **正常刷新测试**
   ```typescript
   // 浏览器控制台
   const { refreshToken } = useAutoRefreshToken()
   await refreshToken()
   ```

2. **过期测试**
   - 修改ACCESS_TOKEN_EXPIRES_IN为'1m'
   - 等待1分钟
   - 观察自动刷新

3. **401重试测试**
   - 删除localStorage中的accessToken
   - 发起API请求
   - 观察自动刷新和重试

### 自动化测试

```typescript
describe('Token Auto Refresh', () => {
  it('应该在token即将过期时自动刷新', async () => {
    // 测试逻辑
  })

  it('应该在401错误时自动刷新并重试', async () => {
    // 测试逻辑
  })
})
```

## 总结

这套解决方案通过以下方式彻底解决token过期问题：

1. ✅ 延长token有效期（24小时）
2. ✅ 自动检测和刷新
3. ✅ 失败自动重试
4. ✅ 用户无感体验

**效果**: 用户30天内无需重新登录，且几乎感觉不到token刷新过程。
