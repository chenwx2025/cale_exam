# 考试订阅系统设计文档

## 📋 系统概述

全新的考试订阅系统，确保用户只能访问已订阅的考试内容，提供清晰的订阅管理和访问控制。

## 🎯 核心功能

### 1. 用户流程

```
用户登录
   ↓
/select-exam (考试选择页面)
   ↓
选择已订阅的考试 (CALE/NCCAOM)
   ↓
进入考试学习中心 (/dashboard)
   ↓
访问该考试的所有内容
```

### 2. 订阅管理

#### 订阅考试
- 位置：`/user/profile` - 个人中心
- 功能：显示可订阅的考试类型，点击订阅按钮
- API：`POST /api/user/subscribe-exam`
- 效果：
  - 新订阅：创建订阅记录
  - 重新激活：将 `isActive: false` 改为 `true`
  - 实时更新：同步更新 authStore 和 localStorage

#### 退订考试
- 位置：`/user/profile` - 个人中心
- 功能：已订阅考试旁边显示"退订"按钮
- API：`POST /api/user/unsubscribe-exam`
- 效果：
  - 软删除：将 `isActive` 设为 `false`
  - 实时更新：同步更新 authStore 和 localStorage
  - 访问限制：用户无法再访问该考试的任何内容

### 3. 访问控制

#### 中间件保护
创建了 `middleware/exam-access.ts` 中间件，保护以下页面：

**需要订阅权限的页面：**
- `/dashboard` - 学习中心
- `/outline` - 考试大纲
- `/exam/*` - 模拟考试相关
- `/study-plan` - 学习计划
- `/wrong-questions` - 错题本
- `/practiced-questions` - 已做题目
- `/stats` - 统计数据
- `/ai/*` - AI 学习助手

#### 保护逻辑

```typescript
1. 检查用户是否登录
2. 检查当前路由是否需要考试订阅权限
3. 获取当前选择的考试类型 (examStore.currentExamType)
4. 检查用户是否订阅了该考试
5. 未订阅 → 重定向到 /select-exam
6. 已订阅 → 允许访问
```

## 📁 文件结构

### 新增文件

```
middleware/
  └── exam-access.ts          # 考试访问权限中间件

server/api/user/
  └── unsubscribe-exam.post.ts # 退订 API
```

### 修改文件

```
layouts/
  └── default.vue              # 移除全局 ExamTabSwitcher

pages/
  ├── dashboard.vue           # 添加 exam-access 中间件
  ├── outline.vue             # 添加 exam-access 中间件
  ├── stats.vue               # 添加 exam-access 中间件
  ├── wrong-questions.vue     # 添加 exam-access 中间件
  ├── practiced-questions.vue # 添加 exam-access 中间件
  ├── study-plan.vue          # 添加 exam-access 中间件
  ├── exam/
  │   ├── config.vue          # 添加 exam-access 中间件
  │   └── question-sets.vue   # 添加 exam-access 中间件
  └── user/
      └── profile.vue         # 清理调试日志，优化订阅/退订逻辑

components/
  └── ExamTabSwitcher.vue     # 清理调试日志

server/api/user/
  └── subscribe-exam.post.ts  # 修复重新激活逻辑
```

## 🔧 技术实现

### 1. 中间件代码

```typescript
// middleware/exam-access.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const examStore = useExamStore()

  // 检查是否需要考试订阅权限
  const needsExamAccess = examProtectedPaths.some(path =>
    to.path.startsWith(path)
  )

  if (!needsExamAccess) return

  // 获取当前考试类型
  const currentExamType = examStore.currentExamType

  // 未选择考试 → 重定向
  if (!currentExamType) {
    return navigateTo('/select-exam')
  }

  // 检查订阅权限
  const hasAccess = authStore.user?.subscribedExams?.includes(currentExamType)

  if (!hasAccess) {
    return navigateTo('/select-exam')
  }
})
```

### 2. 页面保护配置

```typescript
// 在需要保护的页面中添加
definePageMeta({
  middleware: ['auth', 'exam-access']
})
```

### 3. 订阅 API 逻辑

```typescript
// server/api/user/subscribe-exam.post.ts
if (existingSubscription && !existingSubscription.isActive) {
  // 重新激活订阅
  await prisma.userExamSubscription.update({
    where: { id: existingSubscription.id },
    data: { isActive: true }
  })
  return {
    success: true,  // ✅ 返回成功
    message: '订阅已重新激活'
  }
}
```

### 4. 退订 API 逻辑

```typescript
// server/api/user/unsubscribe-exam.post.ts
await prisma.userExamSubscription.update({
  where: { id: subscription.id },
  data: { isActive: false }  // 软删除
})
```

## 🎨 UI 组件

### 1. 考试选择页面 (`/select-exam`)

**已订阅考试卡片：**
- 蓝色渐变（CALE）/ 紫色渐变（NCCAOM）
- 显示考试名称、订阅时间
- 显示学习统计（学习计划、模拟考试、错题数）
- 点击进入学习中心

**未订阅状态：**
- 显示提示信息
- 引导按钮跳转到个人中心订阅

### 2. 个人中心 (`/user/profile`)

**考试订阅区域：**
- 已订阅列表：
  - 绿色背景卡片
  - 显示考试类型和订阅时间
  - "已订阅"标签 + 红色"退订"按钮
- 可订阅列表：
  - 蓝色"订阅"按钮
  - 点击订阅对应考试

## 🔐 安全性

1. **双重验证**：
   - 前端：authStore 检查订阅状态
   - 后端：API 验证用户身份和订阅权限

2. **软删除**：
   - 退订不删除数据库记录
   - 仅将 `isActive` 设为 `false`
   - 便于数据分析和用户重新订阅

3. **状态同步**：
   - 订阅/退订后实时更新 localStorage
   - 确保刷新页面后状态一致

## 📊 数据流

```
用户操作
   ↓
前端调用 API
   ↓
后端验证权限
   ↓
更新数据库 (UserExamSubscription)
   ↓
返回成功响应
   ↓
前端更新 authStore.user.subscribedExams
   ↓
更新 localStorage
   ↓
刷新页面数据
   ↓
UI 实时更新
```

## 🧪 测试场景

### 场景 1：新用户订阅
1. 登录后进入 `/select-exam`
2. 看到"还没有订阅任何考试"提示
3. 点击前往个人中心
4. 订阅 CALE
5. 返回考试选择页面
6. 看到 CALE 卡片
7. 点击进入学习中心

### 场景 2：退订考试
1. 在个人中心点击"退订"按钮
2. 确认退订
3. 该考试从已订阅列表移除
4. 该考试出现在可订阅列表
5. 尝试访问该考试内容 → 重定向到 `/select-exam`

### 场景 3：重新订阅
1. 退订后重新订阅
2. API 检测到已存在记录（isActive: false）
3. 将记录重新激活（isActive: true）
4. 返回成功，恢复访问权限

## 🚀 优势

1. **清晰的权限控制**：用户只能访问已订阅的考试内容
2. **统一的入口**：通过考试选择页面统一管理
3. **灵活的订阅管理**：支持订阅、退订、重新订阅
4. **良好的用户体验**：实时反馈，状态同步
5. **安全可靠**：前后端双重验证，软删除机制

## 📝 注意事项

1. **考试上下文**：访问考试内容前必须先在 `/select-exam` 选择考试
2. **状态持久化**：examStore.currentExamType 存储在 localStorage
3. **路由保护**：所有考试相关页面都需要添加 `exam-access` 中间件
4. **数据一致性**：订阅/退订操作必须同时更新 authStore 和 localStorage

## 🔄 未来改进

1. **订阅期限**：添加订阅到期时间检查
2. **多级权限**：不同订阅级别（免费、基础、高级）
3. **订阅通知**：到期提醒、续费通知
4. **统计分析**：订阅转化率、用户留存分析
5. **路由优化**：考虑将考试内容统一到 `/exams/:examType/` 路由结构下
