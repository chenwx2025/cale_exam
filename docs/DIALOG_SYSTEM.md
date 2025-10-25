# 自定义对话框系统 (Custom Dialog System)

## 概述

本项目已实现一套统一的自定义对话框系统，用于替换浏览器默认的 `alert()`, `confirm()`, 和 `prompt()` 对话框。所有对话框组件都采用与应用程序一致的设计风格，包括渐变背景、圆角、阴影效果和配色方案。

## 组件结构

### 1. 核心组件

#### AlertModal.vue
用于显示提示信息的模态框，支持四种类型：
- `success` - 成功提示（绿色主题）
- `error` - 错误提示（红色主题）
- `warning` - 警告提示（黄色主题）
- `info` - 信息提示（蓝色主题，默认）

#### ConfirmModal.vue
用于确认操作的模态框，支持三种类型：
- `danger` - 危险操作（红色主题）
- `warning` - 警告操作（黄色主题）
- `info` - 普通确认（蓝色主题，默认）

#### PromptModal.vue
用于输入文本的模态框，固定蓝色主题。

#### DialogContainer.vue
全局对话框容器，统一管理所有对话框的显示。

### 2. Composable

#### useDialog.ts
提供三个主要方法：
- `alert(options)` - 显示提示对话框
- `confirm(options)` - 显示确认对话框
- `prompt(options)` - 显示输入对话框

## 使用方法

### 基础使用

```vue
<script setup lang="ts">
import { useDialog } from '~/composables/useDialog'

const dialog = useDialog()

// 简单提示
await dialog.alert('操作成功！')

// 简单确认
const confirmed = await dialog.confirm('确定要删除吗？')
if (confirmed) {
  // 执行删除操作
}

// 简单输入
const email = await dialog.prompt('请输入您的邮箱：')
if (email) {
  // 处理输入的邮箱
}
</script>
```

### 高级用法

#### Alert 对话框

```typescript
// 成功提示
await dialog.alert({
  message: '考试创建成功！',
  type: 'success',
  title: '创建成功',
  okText: '好的'
})

// 错误提示
await dialog.alert({
  message: '网络连接失败，请检查您的网络设置。',
  type: 'error',
  title: '连接错误'
})

// 警告提示
await dialog.alert({
  message: '您的会话即将过期，请保存您的工作。',
  type: 'warning',
  title: '会话警告'
})

// 多行消息
await dialog.alert({
  message: '删除失败：您无权删除此考试\n\n可能原因：\n1. 此考试不属于您的账号\n2. 请确认您已登录正确的账号',
  type: 'error',
  title: '删除失败'
})
```

#### Confirm 对话框

```typescript
// 危险操作确认
const confirmed = await dialog.confirm({
  message: '确定要删除"模拟考试 #1"吗？删除后无法恢复。',
  type: 'danger',
  title: '删除确认',
  confirmText: '删除',
  cancelText: '取消'
})

// 警告操作确认
const confirmed = await dialog.confirm({
  message: '确定要退出登录吗？',
  type: 'warning',
  title: '退出确认',
  confirmText: '退出',
  cancelText: '取消'
})

// 普通确认
const confirmed = await dialog.confirm({
  message: '是否保存当前更改？',
  type: 'info',
  title: '保存确认',
  confirmText: '保存',
  cancelText: '不保存'
})
```

#### Prompt 对话框

```typescript
// 基本输入
const email = await dialog.prompt({
  message: '请输入您的注册邮箱：',
  title: '邮箱验证',
  placeholder: 'example@email.com',
  confirmText: '提交',
  cancelText: '取消'
})

// 带默认值的输入
const name = await dialog.prompt({
  message: '请输入您的姓名：',
  title: '个人信息',
  placeholder: '请输入姓名',
  defaultValue: '张三',
  confirmText: '确定',
  cancelText: '取消'
})

// 处理用户取消
const result = await dialog.prompt('请输入备注：')
if (result === null) {
  console.log('用户取消了输入')
} else if (result === '') {
  console.log('用户输入为空')
} else {
  console.log('用户输入：', result)
}
```

## 已更新的页面

以下页面已经从浏览器默认对话框迁移到自定义对话框系统：

### 已完成迁移
1. ✅ **pages/exams/index.vue** - 考试列表页
   - 删除考试确认
   - 删除成功/失败提示
   - 加载失败提示

2. ✅ **pages/exam/question-sets.vue** - 题目集页面
   - 批量删除确认
   - 删除成功/失败提示
   - 加载失败提示

3. ✅ **layouts/exam.vue** - 考试布局
   - 退出登录确认

4. ✅ **layouts/default.vue** - 默认布局
   - 退出登录确认

### 待迁移的页面

以下页面仍在使用浏览器默认对话框，建议按优先级逐步迁移：

#### 高优先级
- pages/study-plans/[id].vue - 学习计划详情（更新失败、删除确认）
- pages/study-plans/index.vue - 学习计划列表（删除确认）
- pages/select-exam.vue - 选择考试（退订确认）
- pages/verify-email.vue - 邮箱验证（输入邮箱、发送失败）

#### 中优先级
- pages/exam/[id].vue - 考试页面（加载失败、提交失败）
- pages/exam/config.vue - 考试配置（创建成功、创建失败）
- pages/wrong-questions.vue - 错题本（移除确认）
- pages/study-plan.vue - 学习计划（创建成功、创建失败）
- pages/user/profile.vue - 用户资料（加载失败、退订确认）

#### 低优先级
- pages/auth/register.vue - 注册页面
- pages/auth/login.vue - 登录页面
- pages/notifications/settings.vue - 通知设置
- pages/practice.vue - 练习页面
- pages/stats.vue - 统计页面
- components/* - 各种组件

#### 管理页面
- pages/admin/questions/import.vue - 题目导入
- pages/admin/questions/index.vue - 题目管理
- pages/admin/categories/index.vue - 分类管理
- pages/admin/users/[id].vue - 用户管理
- pages/admin/analytics.vue - 分析页面
- pages/admin/questions.vue - 题目列表
- pages/admin/settings.vue - 系统设置

## 迁移指南

### 步骤 1：导入 useDialog

```typescript
import { useDialog } from '~/composables/useDialog'

const dialog = useDialog()
```

### 步骤 2：替换 alert()

```typescript
// 之前
alert('操作成功')

// 之后
await dialog.alert('操作成功')

// 或带选项
await dialog.alert({
  message: '操作成功',
  type: 'success',
  title: '成功'
})
```

### 步骤 3：替换 confirm()

```typescript
// 之前
if (confirm('确定要删除吗？')) {
  // 执行删除
}

// 之后
const confirmed = await dialog.confirm('确定要删除吗？')
if (confirmed) {
  // 执行删除
}

// 或带选项
const confirmed = await dialog.confirm({
  message: '确定要删除吗？',
  type: 'danger',
  title: '删除确认',
  confirmText: '删除',
  cancelText: '取消'
})
if (confirmed) {
  // 执行删除
}
```

### 步骤 4：替换 prompt()

```typescript
// 之前
const email = prompt('请输入邮箱：')
if (email) {
  // 处理邮箱
}

// 之后
const email = await dialog.prompt('请输入邮箱：')
if (email) {
  // 处理邮箱
}

// 或带选项
const email = await dialog.prompt({
  message: '请输入邮箱：',
  title: '邮箱验证',
  placeholder: 'example@email.com',
  defaultValue: '',
  confirmText: '提交',
  cancelText: '取消'
})
if (email !== null) {
  // 处理邮箱（用户没有取消）
}
```

## 设计特点

### 视觉设计
- **渐变背景头部**：根据类型显示不同颜色的渐变背景
- **图标指示**：每种类型都有对应的图标（✓、✗、⚠、ℹ）
- **圆角设计**：使用 `rounded-2xl` 实现柔和的视觉效果
- **阴影效果**：`shadow-2xl` 提供层次感
- **过渡动画**：淡入淡出和缩放动画提升用户体验

### 颜色方案
- **成功 (Success)**：绿色 (`green-500` to `green-600`)
- **错误 (Error)**：红色 (`red-500` to `red-600`)
- **警告 (Warning)**：黄色 (`yellow-500` to `yellow-600`)
- **信息 (Info)**：蓝色 (`blue-500` to `blue-600`)

### 交互特点
- 点击背景遮罩可关闭对话框（AlertModal 关闭，ConfirmModal/PromptModal 取消）
- Prompt 对话框支持 Enter 键确认、Esc 键取消
- 按钮带有悬停效果和阴影变化
- 自动聚焦输入框（PromptModal）

## 技术实现

### 状态管理
使用 Vue 3 Composition API 的 `ref` 在 composable 中创建全局共享状态，确保对话框在整个应用中都能正常工作。

### Teleport
所有对话框组件使用 `<Teleport to="body">` 确保它们渲染在 DOM 树的最顶层，避免 z-index 层叠问题。

### Promise 封装
每个对话框方法都返回 Promise，使得可以使用 `async/await` 语法，代码更加清晰易读。

```typescript
// Alert 返回 void
await dialog.alert('提示信息')

// Confirm 返回 boolean
const confirmed = await dialog.confirm('确认吗？') // true 或 false

// Prompt 返回 string | null
const input = await dialog.prompt('输入：') // 字符串或 null（取消）
```

## 最佳实践

1. **始终使用 await**：确保对话框关闭后再执行后续操作
2. **选择合适的类型**：
   - 成功操作后使用 `type: 'success'`
   - 错误情况使用 `type: 'error'`
   - 危险操作确认使用 `type: 'danger'`
   - 退出、登出等使用 `type: 'warning'`
3. **提供清晰的消息**：使用多行文本（`\n`）解释复杂情况
4. **自定义按钮文字**：使用 `confirmText` 和 `cancelText` 让操作更明确
5. **处理取消操作**：Prompt 返回 `null` 时表示用户取消，需要妥善处理

## 示例：完整的删除流程

```typescript
const deleteExam = async (examId: string, examTitle: string) => {
  // 1. 确认删除
  const confirmed = await dialog.confirm({
    message: `确定要删除"${examTitle}"吗？删除后无法恢复。`,
    type: 'danger',
    title: '删除确认',
    confirmText: '删除',
    cancelText: '取消'
  })

  if (!confirmed) {
    return
  }

  try {
    // 2. 执行删除
    const response = await $fetch('/api/exams/delete', {
      method: 'POST',
      body: { examId }
    })

    if (response.success) {
      // 3. 成功提示
      await dialog.alert({
        message: `成功删除"${examTitle}"`,
        type: 'success',
        title: '删除成功'
      })

      // 4. 刷新列表
      await fetchExams()
    } else {
      // 5. 失败提示
      await dialog.alert({
        message: '删除失败: ' + response.message,
        type: 'error',
        title: '删除失败'
      })
    }
  } catch (error: any) {
    // 6. 错误处理
    await dialog.alert({
      message: '删除失败: ' + (error.message || '未知错误'),
      type: 'error',
      title: '删除失败'
    })
  }
}
```

## 维护说明

### 添加新的对话框类型
如需添加新类型，需要修改：
1. `AlertModal.vue` 或 `ConfirmModal.vue` 的类型定义
2. `useDialog.ts` 的接口定义
3. 组件中的 `computed` 属性（headerClass、iconBgClass、buttonClass）

### 修改样式
所有样式都使用 Tailwind CSS，修改时保持与应用整体设计一致：
- 主色调：蓝色系 (`blue-500`, `blue-600`, `blue-700`)
- 成功色：绿色系 (`green-500`, `green-600`, `green-700`)
- 错误色：红色系 (`red-500`, `red-600`, `red-700`)
- 警告色：黄色系 (`yellow-500`, `yellow-600`, `yellow-700`)

---

**最后更新时间**：2025-10-21
**当前版本**：1.0.0
