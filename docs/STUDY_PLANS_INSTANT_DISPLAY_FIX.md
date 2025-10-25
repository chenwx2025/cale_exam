# 学习计划列表即时显示修复

## 问题描述

用户报告：创建学习计划后需要等待 15 秒才能在列表中显示。

## 问题根因

### 与其他列表页的区别

学习计划列表页使用了 Nuxt 3 的 `useFetch` 组合式函数，而不是手动的 `$fetch`。

**`useFetch` 的特点**:
1. 自动缓存数据
2. 响应式数据更新
3. 内置的 loading 状态
4. **缓存键（key）机制** - 相同的 key 会返回缓存数据

### 问题原因

```typescript
const { data: studyPlans, pending, refresh } = await useFetch('/api/study-plans', {
  key: () => `study-plans-list-${currentExamType.value}`,
  // ...
})
```

当用户从创建页返回列表页时：
1. Vue Router 重用组件实例
2. `useFetch` 检测到相同的 key
3. 返回缓存的数据，**不发起新的 API 请求**
4. 用户看到旧数据

### 解决方案

调用 `useFetch` 返回的 `refresh()` 函数来强制重新获取数据。

## 修复实现

**文件**: `pages/study-plans/index.vue`

**修改位置**: 第 170-182 行

**修改前**:
```vue
<script setup lang="ts">
const { data: studyPlans, pending, refresh } = await useFetch('/api/study-plans', {
  // ... config
})

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
```

**修改后**:
```vue
<script setup lang="ts">
const { data: studyPlans, pending, refresh } = await useFetch('/api/study-plans', {
  // ... config
})

// Reload when navigating back to this page
onActivated(() => {
  refresh()
})

// Watch route to reload when coming back from create page
const route = useRoute()
watch(() => route.fullPath, (newPath, oldPath) => {
  // Only reload if we're on the study-plans index page
  if (newPath === '/study-plans' && oldPath && oldPath !== newPath) {
    refresh()
  }
})

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
```

## 技术细节

### `useFetch` vs 手动 `$fetch`

| 特性 | `useFetch` | 手动 `$fetch` |
|------|-----------|--------------|
| 缓存 | ✅ 自动缓存 | ❌ 需手动实现 |
| 响应式 | ✅ 自动响应式 | ❌ 需手动更新 ref |
| Loading 状态 | ✅ 内置 pending | ❌ 需手动管理 |
| 刷新数据 | 调用 `refresh()` | 再次调用加载函数 |
| SSR 支持 | ✅ 完整支持 | ⚠️ 需额外处理 |

### 为什么需要 `refresh()`

`useFetch` 的缓存键设计用于：
- 避免重复请求
- 提升性能
- 在相同参数下复用数据

但这也意味着：
- 数据可能过期
- 需要手动刷新来获取最新数据

### 刷新机制

```typescript
// refresh() 的行为：
// 1. 清除当前 key 的缓存
// 2. 重新发起 API 请求
// 3. 更新 data 和 pending 状态
// 4. 触发组件重新渲染
```

## 测试验证

### 测试步骤

1. **创建新计划**:
   - 访问 `/study-plans`
   - 点击"创建新计划"
   - 填写计划信息并创建
   - **应立即**在列表中看到新计划

2. **删除计划**:
   - 在列表中删除一个计划
   - **应立即**从列表中消失

3. **切换考试类型**:
   - 切换考试类型筛选
   - 应立即显示对应类型的计划

### 预期结果

- ✅ 创建后立即显示（无需等待 15 秒）
- ✅ 删除后立即消失
- ✅ 考试类型筛选正常工作
- ✅ 无页面闪烁
- ✅ Loading 状态正确显示

## 其他使用 `useFetch` 的页面

检查是否还有其他页面使用 `useFetch` 并可能存在类似问题：

```bash
grep -r "useFetch" pages/ --include="*.vue"
```

如果发现其他页面也使用 `useFetch` 并有列表页→详情页→返回列表的场景，应用相同的修复模式。

## 最佳实践

### 何时使用 `useFetch`

✅ **适合使用**:
- 需要 SSR 支持的页面
- 数据更新频率低
- 需要自动缓存优化

❌ **不适合使用**:
- 需要频繁更新的数据
- 复杂的条件加载逻辑
- 需要精细控制请求时机

### 使用 `useFetch` 时的注意事项

1. **总是暴露 `refresh` 函数**: 即使当前不需要，也便于后续维护
2. **设置合理的 key**: 确保缓存键能反映所有影响数据的参数
3. **在必要时刷新**: 在 `onActivated` 和路由变化时调用 `refresh()`
4. **考虑缓存失效策略**: 对于时效性要求高的数据，可能需要更激进的刷新策略

## 相关文档

- `docs/INSTANT_DISPLAY_FIX_COMPREHENSIVE.md` - 综合修复文档
- [Nuxt 3 useFetch 文档](https://nuxt.com/docs/api/composables/use-fetch)

## 总结

通过在学习计划列表页添加 `onActivated` 钩子和路由监听，并调用 `refresh()` 函数清除缓存，成功解决了创建计划后需要等待 15 秒才显示的问题。

关键点：
- ✅ 识别使用 `useFetch` 的页面
- ✅ 调用 `refresh()` 而不是重新调用加载函数
- ✅ 在适当的生命周期钩子中触发刷新
- ✅ 保持原有的缓存优势

## 日期

2025-10-25
