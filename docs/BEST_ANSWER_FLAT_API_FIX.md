# 最佳答案功能扁平路由修复

## 问题

点击"设为最佳答案"按钮时，控制台显示：
```
[Best Answer] 操作成功: <!DOCTYPE html><html>
```

返回的是 HTML 而不是 JSON 数据，导致功能无法正常工作。

## 原因

最佳答案 API 使用了嵌套动态路由：
```
/api/study-groups/[id]/posts/[postId]/replies/[replyId]/best-answer
```

在 Nuxt 3 SSR 环境中，嵌套动态路由会返回 HTML 而不是 JSON。

## 解决方案

### 1. 创建扁平路由最佳答案 API

**文件**: `server/api/study-group-best-answer.post.ts`
- **路由**: `/api/study-group-best-answer`
- **方法**: POST
- **请求体**: `{ groupId, postId, replyId }`

**功能**:
- 验证用户权限（只有帖子作者或管理员可以设置）
- 验证帖子类型（只有 question 类型可以设置最佳答案）
- 切换最佳答案状态（设置/取消）
- 一个问题只能有一个最佳答案
- 设置最佳答案后，帖子状态变为 solved
- 取消最佳答案后，帖子状态变为 pending

**返回数据**:
```typescript
{
  success: true,
  action: 'set' | 'unset',
  message: string,
  isBestAnswer: boolean
}
```

### 2. 修改前端代码

**文件**: `pages/study-groups/[id]/posts/[postId].vue`

**修改前**（嵌套路由）:
```typescript
const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/replies/${replyId}/best-answer`, {
  method: 'POST',
  headers: authStore.getAuthHeader()
})
```

**修改后**（扁平路由）:
```typescript
const result = await $fetch(`/api/study-group-best-answer`, {
  method: 'POST',
  headers: authStore.getAuthHeader(),
  body: { groupId, postId, replyId }
})
```

## 功能说明

### 权限验证
- **帖子作者**: 可以设置自己提问的问题的最佳答案
- **管理员**: owner、admin、moderator 角色可以设置任何问题的最佳答案

### 帖子类型限制
只有 `type: 'question'` 的帖子可以设置最佳答案。其他类型（discussion、announcement、poll）不能设置。

### 最佳答案唯一性
一个问题只能有一个最佳答案。设置新的最佳答案时，会自动取消之前的最佳答案。

### 帖子状态同步
- 设置最佳答案: `status: 'pending'` → `status: 'solved'`
- 取消最佳答案: `status: 'solved'` → `status: 'pending'`

### 切换逻辑
- 如果回复已经是最佳答案 → 取消最佳答案
- 如果回复不是最佳答案 → 设为最佳答案

## UI 标识

设为最佳答案后，回复会显示：
- **✅ 最佳答案** 标签（绿色背景）
- 楼层号旁边显示最佳答案标识

帖子列表中：
- 问题状态从 "待解决" 变为 "✓ 已解决"（绿色标识）

## 测试步骤

1. 创建一个类型为 "问题" 的帖子
2. 添加几条回复
3. 作为帖子作者或管理员，点击某条回复的"设为最佳答案"按钮
4. 验证：
   - 回复显示 ✅ 最佳答案 标签
   - 帖子状态变为 ✓ 已解决
   - 控制台显示 JSON 响应而不是 HTML
5. 再次点击"取消最佳答案"按钮
6. 验证：
   - 最佳答案标签消失
   - 帖子状态变回 "待解决"

## 相关文件

- `server/api/study-group-best-answer.post.ts` - 新建（扁平路由API）
- `pages/study-groups/[id]/posts/[postId].vue` - 修改（使用扁平路由）

## 嵌套路由问题模式

这是继续发现的嵌套动态路由问题。目前已修复的 API：
1. ✅ 帖子详情 - `study-group-post-detail.get.ts`
2. ✅ 帖子点赞 - `study-group-post-like.post.ts`
3. ✅ 帖子收藏 - `study-group-post-bookmark.post.ts`
4. ✅ 回复点赞 - `study-group-reply-like.post.ts`
5. ✅ 创建回复 - `study-group-post-reply.post.ts`
6. ✅ 成员列表 - `study-group-members.get.ts`
7. ✅ 最佳答案 - `study-group-best-answer.post.ts`

## 状态

✅ **完成** - 最佳答案功能现已使用扁平路由，正常工作

## 日期

2025-10-25
