# 打卡功能修复 - 扁平路由解决方案

## 日期
2025-10-24

## 问题总结

打卡按钮点击后返回 HTML 错误页面，而不是预期的 JSON 响应。

### 关键症状
- ❌ POST 请求到 `/api/study-groups/[id]/check-in` 返回 HTML
- ✅ GET 请求到同一路径正常工作
- ✅ Token 认证有效（其他功能正常）
- ❌ 服务器日志中完全没有 POST 处理器的调试输出
- 证明：POST 请求从未到达 API 处理器

## 根本原因

Nuxt 3 的 SSR 或 Nitro 路由系统在处理嵌套动态路由的 POST 请求时存在问题：
- 路径：`/api/study-groups/[id]/check-in`
- GET 请求正常，但 POST 请求被拦截
- 请求在到达 API 处理器之前被路由系统处理为页面请求

## 解决方案

### 采用扁平路由替代嵌套动态路由

创建了新的扁平 API 端点，使用查询参数而不是路径参数：

**新路径**: `/api/study-group-check-in?groupId={id}`

### 实施的更改

#### 1. 创建扁平路由 API
文件：[server/api/study-group-check-in.post.ts](server/api/study-group-check-in.post.ts)

```javascript
export default defineEventHandler(async (event) => {
  console.log('[FLAT CHECK-IN POST] ========== 请求到达 ==========')

  const user = requireAuth(event)

  // 从 query 参数或 body 获取 groupId
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))
  const groupId = query.groupId || body.groupId

  if (!groupId) {
    throw createError({ statusCode: 400, message: '缺少小组ID' })
  }

  // 检查成员资格
  const membership = await prisma.studyGroupMember.findFirst({
    where: { groupId: String(groupId), userId: user.userId }
  })

  if (!membership) {
    throw createError({ statusCode: 403, message: '只有小组成员才能打卡' })
  }

  // 检查今天是否已打卡
  const today = new Date().toISOString().split('T')[0]
  const existingCheckIn = await prisma.studyGroupCheckIn.findUnique({
    where: {
      groupId_userId_checkInDate: {
        groupId: String(groupId),
        userId: user.userId,
        checkInDate: today
      }
    }
  })

  if (existingCheckIn) {
    return { success: false, message: '今天已经打卡过了！' }
  }

  // 创建打卡记录
  const checkIn = await prisma.studyGroupCheckIn.create({
    data: { groupId: String(groupId), userId: user.userId, checkInDate: today }
  })

  return {
    success: true,
    data: {
      checkIn: {
        id: checkIn.id,
        checkInDate: checkIn.checkInDate,
        checkInTime: checkIn.createdAt.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    },
    message: '打卡成功！'
  }
})
```

#### 2. 更新前端组件
文件：[components/StudyGroupCheckIn.vue:230](components/StudyGroupCheckIn.vue#L230)

**修改前**:
```javascript
const response = await $fetch(`/api/study-groups/${props.groupId}/check-in`, {
  method: 'POST',
  headers
})
```

**修改后**:
```javascript
const response = await $fetch(`/api/study-group-check-in?groupId=${props.groupId}`, {
  method: 'POST',
  headers
})
```

## 测试步骤

1. **刷新浏览器**（清除缓存）
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **访问学习小组页面**
   - 导航到任意学习小组
   - 点击 "🔥 打卡" 标签

3. **点击打卡按钮**
   - 观察控制台输出
   - 应该看到 `[FLAT CHECK-IN POST]` 日志

4. **验证功能**
   - ✅ 打卡成功提示
   - ✅ 显示打卡时间
   - ✅ 统计数据更新（连续天数、累计天数、出勤率）
   - ✅ 本周日历显示今天已打卡
   - ✅ 排行榜更新
   - ✅ 今日动态显示新打卡记录

## 预期服务器日志

成功的打卡请求应显示：
```
[FLAT CHECK-IN POST] ========== 请求到达 ==========
[FLAT CHECK-IN POST] 用户: cmgzi5hdx02ntpj0a8s7lashl
[FLAT CHECK-IN POST] groupId: cmh3qbzkk0002rtevyi7jw8d4
[FLAT CHECK-IN POST] 打卡成功: <check-in-id>
```

## 技术说明

### 为什么扁平路由有效

1. **避免嵌套动态路由的复杂性**
   - 嵌套路径：`/api/study-groups/[id]/check-in` ❌
   - 扁平路径：`/api/study-group-check-in` ✅

2. **查询参数更可靠**
   - 路径参数在某些 Nuxt SSR 场景下可能被误解
   - 查询参数处理更直接、更明确

3. **与 Nuxt 的路由优先级无冲突**
   - 没有文件/文件夹命名冲突
   - 没有页面路由和 API 路由的歧义

### 保留的原有 API

嵌套路由 API 仍然存在，以防其他地方使用：
- `GET /api/study-groups/[id]/check-in` - 获取打卡数据（工作正常）
- `POST /api/study-groups/[id]/check-in` - 提交打卡（有问题，已废弃）

## 后续建议

### 短期
- ✅ 使用扁平路由作为打卡功能的标准实现
- 监控生产环境日志，确认修复有效

### 长期
1. **考虑将其他嵌套动态路由的 POST 请求也迁移到扁平路由**
2. **调查 Nuxt 3 和 Nitro 的版本更新**，看是否修复了此问题
3. **编写集成测试**，覆盖所有 API 路由的 GET 和 POST 请求
4. **文档化路由设计规范**，避免未来出现类似问题

## 状态
✅ **已修复并部署**

## 相关文档
- [CHECKIN_ROUTING_FIX.md](CHECKIN_ROUTING_FIX.md) - 文件夹/文件冲突修复
- [CHECKIN_TOKEN_FIX.md](CHECKIN_TOKEN_FIX.md) - Token 问题排查（非根本原因）
- [CHECKIN_ISSUE_SUMMARY.md](CHECKIN_ISSUE_SUMMARY.md) - 完整问题分析
