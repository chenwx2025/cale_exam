# Phase 2: 用户系统与数据隔离 - 进度报告

## 📊 当前进度: 65%

---

## ✅ 已完成的工作

### 1. 用户 API (100%)

#### GET /api/user/profile
获取当前用户信息
- ✅ 从认证中间件获取当前用户
- ✅ 返回用户详细信息
- ✅ 包含订阅的考试类型
- ✅ 包含用户统计数据（学习计划数、考试数、错题数）

#### PUT /api/user/profile
更新用户信息
- ✅ 允许更新姓名、昵称、头像
- ✅ 只能更新自己的信息

#### POST /api/user/change-password
修改密码
- ✅ 验证旧密码
- ✅ 验证新密码强度
- ✅ 修改后使所有 token 失效（增加 tokenVersion）

#### POST /api/user/subscribe-exam
订阅考试类型
- ✅ 添加新的考试订阅
- ✅ 重新激活已有订阅
- ✅ 防止重复订阅

### 2. 数据隔离改造 (100%)

#### StudyPlan API
- ✅ [server/api/study-plans/index.get.ts](server/api/study-plans/index.get.ts)
  - 从 query 参数获取 userId 改为从认证用户获取
  - 只返回当前用户的学习计划

#### Exam API
- ✅ [server/api/exam/create.post.ts](server/api/exam/create.post.ts)
  - 从请求体移除 userId 参数
  - 使用认证用户的 ID 创建考试

- ✅ [server/api/exam/create-mock.post.ts](server/api/exam/create-mock.post.ts)
  - 从请求体移除 userId 参数
  - 使用认证用户的 ID 创建模拟考试

#### Question Sets API
- ✅ [server/api/question-sets/list.get.ts](server/api/question-sets/list.get.ts)
  - 从 query 参数获取 userId 改为从认证用户获取
  - 只返回当前用户的题目集

- ✅ [server/api/question-sets/delete.post.ts](server/api/question-sets/delete.post.ts)
  - 添加所有权验证
  - 确保用户只能删除自己的题目集
  - 双重保护（验证 + 删除时再次检查）

---

## 🚧 待完成的工作

### 3. 前端改造 (0%)

#### 需要更新的组件/页面
- [ ] 移除所有手动传递 userId 的地方
- [ ] 使用 auth store 中的用户信息
- [ ] [pages/exam/config.vue](pages/exam/config.vue) - 创建考试时不再传 userId
- [ ] [pages/study-plan.vue](pages/study-plan.vue) - 获取学习计划时不再传 userId
- [ ] [pages/exam/question-sets.vue](pages/exam/question-sets.vue) - 获取题目集时不再传 userId

#### 用户界面
- [ ] 创建用户个人中心页面 `/user/profile`
- [ ] 创建考试订阅页面 `/user/subscriptions`
- [ ] 创建用户导航菜单
  - 用户头像/姓名
  - 个人中心
  - 退出登录

#### 首页改造
- [ ] 创建新的首页 `/pages/index.vue`
- [ ] 显示已订阅的考试列表
- [ ] 点击进入不同考试

---

## 🔐 数据隔离安全性

### 实施的安全措施

1. **强制认证**
   - 所有受保护的 API 都使用 `requireAuth()`
   - 未登录自动抛出 401 错误

2. **自动 userId 注入**
   - 从 JWT Token 中提取 userId
   - 不再从请求参数获取（防止伪造）

3. **所有权验证**
   - 读取：只能查看自己的数据
   - 删除：验证资源所有权后才允许删除
   - 创建：自动使用当前用户 ID

4. **双重保护**
   - 查询时过滤 userId
   - 删除时再次验证 userId

### 代码示例

**之前（不安全）:**
```typescript
const { userId } = query  // 可以被伪造
const data = await prisma.exam.findMany({ where: { userId } })
```

**现在（安全）:**
```typescript
const currentUser = requireAuth(event)  // 从 JWT 获取
const data = await prisma.exam.findMany({
  where: { userId: currentUser.userId }  // 使用认证用户 ID
})
```

---

## 📁 已修改的文件

### 新建文件
- `server/api/user/profile.get.ts`
- `server/api/user/profile.put.ts`
- `server/api/user/change-password.post.ts`
- `server/api/user/subscribe-exam.post.ts`

### 修改文件
- `server/api/study-plans/index.get.ts`
- `server/api/exam/create.post.ts`
- `server/api/exam/create-mock.post.ts`
- `server/api/question-sets/list.get.ts`
- `server/api/question-sets/delete.post.ts`

---

## 🧪 需要测试的场景

### 数据隔离测试
1. [ ] 用户 A 登录，创建学习计划
2. [ ] 用户 B 登录，不应该看到用户 A 的学习计划
3. [ ] 用户 B 尝试删除用户 A 的考试，应该被拒绝

### API 测试
1. [ ] 测试 GET /api/user/profile
2. [ ] 测试 PUT /api/user/profile
3. [ ] 测试 POST /api/user/change-password
4. [ ] 测试 POST /api/user/subscribe-exam

### 前端测试
1. [ ] 创建考试不再需要手动传 userId
2. [ ] 获取题目集列表自动显示当前用户的数据
3. [ ] 删除题目集时验证所有权

---

## 🎯 下一步计划

### 立即行动
1. **更新前端组件** - 移除所有手动传递 userId 的地方
2. **创建用户中心页面** - 个人信息、订阅管理
3. **更新导航栏** - 添加用户菜单

### 短期计划
1. 创建新首页（考试选择）
2. 完整的端到端测试
3. 修复发现的 bug

### 中期计划 (Phase 3)
1. 多考试类型路由
2. 考试订阅页面
3. 更完善的权限控制

---

## 💡 重要提醒

1. **前端代码需要更新**
   - 所有调用 API 的地方不再传 userId
   - 使用 auth store 的 getAuthHeader() 获取 Authorization 头

2. **测试账号**
   - demo@cale.com / Demo123456!
   - testuser@example.com / Test123456!

3. **API 调用方式变化**

**之前:**
```typescript
await $fetch('/api/exam/create', {
  method: 'POST',
  body: {
    userId: 'demo-user',  // ❌ 不再需要
    examType: 'cale',
    // ...
  }
})
```

**现在:**
```typescript
await $fetch('/api/exam/create', {
  method: 'POST',
  headers: authStore.getAuthHeader(),  // ✅ 添加 token
  body: {
    examType: 'cale',  // ✅ 移除 userId
    // ...
  }
})
```

---

**更新时间**: 2025-10-20
**状态**: 进行中
**下一步**: 前端组件改造
