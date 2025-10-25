# 讨论区帖子扁平路由 API 迁移总结

## 问题背景

用户反馈"打不开帖子"的问题，经检查发现帖子详情页面仍在使用嵌套动态路由 API，这在 Nuxt 3 的 SSR 模式下会返回 HTML 而不是 JSON 数据，导致页面无法正常加载。

**问题路由示例：**
```
/api/study-groups/[id]/posts/[postId]           ❌ 嵌套动态路由
/api/study-groups/[id]/posts/[postId]/like      ❌ 嵌套动态路由
/api/study-groups/[id]/posts/[postId]/replies   ❌ 嵌套动态路由
```

## 解决方案

创建扁平路由 API，使用查询参数或请求体传递参数，避免嵌套动态路由问题。

## 新增扁平路由 API

### 1. 帖子详情 API

**文件：** `server/api/study-group-post-detail.get.ts`

**路由：** `GET /api/study-group-post-detail?groupId={groupId}&postId={postId}`

**功能：**
- 获取帖子完整信息
- 包含所有回复及其点赞状态
- 包含投票（Poll）信息
- 返回用户的点赞、收藏状态

**返回数据结构：**
```typescript
{
  success: true,
  data: {
    id: string
    title: string
    content: string
    type: string
    author: { id, name, avatar }
    likeCount: number
    replyCount: number
    isLiked: boolean
    isBookmarked: boolean
    replies: [{
      id: string
      content: string
      author: { id, name, avatar }
      likeCount: number
      isLiked: boolean
      createdAt: Date
    }]
    poll: {
      hasVoted: boolean
      userVotedOptionId: string
      options: [{
        id: string
        text: string
        voteCount: number
        hasUserVoted: boolean
      }]
    }
  }
}
```

**关键实现：**
```typescript
// 检查用户成员身份
const membership = await prisma.studyGroupMember.findFirst({
  where: { groupId, userId: user.userId, isActive: true }
})

// 获取帖子及关联数据
const post = await prisma.studyGroupPost.findUnique({
  where: { id: postId },
  include: {
    author: true,
    replies: { include: { author: true, _count: { select: { likes: true } } } },
    poll: { include: { options: { include: { votes: true } } } },
    _count: { select: { replies: true, likes: true } }
  }
})

// 检查用户点赞状态
const userLike = await prisma.postLike.findFirst({
  where: { postId, userId: user.userId }
})

// 检查回复点赞状态
const userReplyLikes = await prisma.replyLike.findMany({
  where: { replyId: { in: post.replies.map(r => r.id) }, userId: user.userId }
})
```

---

### 2. 帖子点赞 API

**文件：** `server/api/study-group-post-like.post.ts`

**路由：** `POST /api/study-group-post-like`

**请求体：**
```typescript
{
  groupId: string
  postId: string
}
```

**功能：**
- 切换帖子点赞状态
- 已点赞则取消，未点赞则添加
- 返回最新点赞状态和数量

**返回数据：**
```typescript
{
  success: true,
  data: {
    isLiked: boolean
    likeCount: number
  }
}
```

**关键实现：**
```typescript
// 检查是否已点赞
const existingLike = await prisma.postLike.findUnique({
  where: { postId_userId: { postId, userId: user.userId } }
})

if (existingLike) {
  // 取消点赞
  await prisma.postLike.delete({ where: { id: existingLike.id } })
  isLiked = false
} else {
  // 添加点赞
  await prisma.postLike.create({ data: { postId, userId: user.userId } })
  isLiked = true
}

// 获取更新后的点赞数
const likeCount = await prisma.postLike.count({ where: { postId } })
```

---

### 3. 帖子收藏 API

**文件：** `server/api/study-group-post-bookmark.post.ts`

**路由：** `POST /api/study-group-post-bookmark`

**请求体：**
```typescript
{
  groupId: string
  postId: string
}
```

**功能：**
- 切换帖子收藏状态

**返回数据：**
```typescript
{
  success: true,
  data: {
    isBookmarked: boolean
  }
}
```

---

### 4. 回复点赞 API

**文件：** `server/api/study-group-reply-like.post.ts`

**路由：** `POST /api/study-group-reply-like`

**请求体：**
```typescript
{
  groupId: string
  postId: string
  replyId: string
}
```

**功能：**
- 切换回复点赞状态

**返回数据：**
```typescript
{
  success: true,
  data: {
    isLiked: boolean
    likeCount: number
  }
}
```

**关键实现：**
```typescript
const existingLike = await prisma.replyLike.findUnique({
  where: { replyId_userId: { replyId, userId: user.userId } }
})

if (existingLike) {
  await prisma.replyLike.delete({ where: { id: existingLike.id } })
  isLiked = false
} else {
  await prisma.replyLike.create({ data: { replyId, userId: user.userId } })
  isLiked = true
}

const likeCount = await prisma.replyLike.count({ where: { replyId } })
```

---

### 5. 发表回复 API

**文件：** `server/api/study-group-post-reply.post.ts`

**路由：** `POST /api/study-group-post-reply`

**请求体：**
```typescript
{
  groupId: string
  postId: string
  content: string
}
```

**功能：**
- 发表新回复
- 检查帖子是否锁定
- 检查用户成员身份

**返回数据：**
```typescript
{
  success: true,
  data: {
    id: string
    content: string
    author: { id, name, avatar }
    createdAt: Date
  }
  message: "回复发表成功"
}
```

**关键实现：**
```typescript
// 检查帖子是否锁定
const post = await prisma.studyGroupPost.findUnique({ where: { id: postId } })
if (post.isLocked) {
  throw createError({ statusCode: 403, message: '帖子已锁定，无法回复' })
}

// 创建回复
const reply = await prisma.postReply.create({
  data: { postId, authorId: user.userId, content },
  include: { author: { select: { id: true, name: true, avatar: true } } }
})
```

---

## 前端页面更新

### 帖子详情页面 (`pages/study-groups/[id]/posts/[postId].vue`)

#### 1. 加载帖子详情

**修改前：**
```javascript
const data = await $fetch(`/api/study-groups/${groupId}/posts/${postId}`, {
  headers: authStore.getAuthHeader()
})
```

**修改后：**
```javascript
console.log('[Post Detail] 使用扁平路由 API 加载帖子详情')
const result = await $fetch(`/api/study-group-post-detail?groupId=${groupId}&postId=${postId}`, {
  headers: authStore.getAuthHeader()
})
post.value = result.data
```

#### 2. 帖子点赞

**修改前：**
```javascript
await $fetch(`/api/study-groups/${groupId}/posts/${postId}/like`, {
  method: 'POST',
  headers: authStore.getAuthHeader()
})
```

**修改后：**
```javascript
console.log('[Post Like] 使用扁平路由 API 开始点赞操作')
await $fetch(`/api/study-group-post-like`, {
  method: 'POST',
  headers: authStore.getAuthHeader(),
  body: { groupId, postId }
})
```

#### 3. 回复点赞

**修改前：**
```javascript
await $fetch(`/api/study-groups/${groupId}/posts/${postId}/replies/${replyId}/like`, {
  method: 'POST',
  headers: authStore.getAuthHeader()
})
```

**修改后：**
```javascript
console.log('[Reply Like] 使用扁平路由 API 开始点赞操作')
await $fetch(`/api/study-group-reply-like`, {
  method: 'POST',
  headers: authStore.getAuthHeader(),
  body: { groupId, postId, replyId }
})
```

#### 4. 发表回复

**修改前：**
```javascript
await $fetch(`/api/study-groups/${groupId}/posts/${postId}/replies`, {
  method: 'POST',
  headers: authStore.getAuthHeader(),
  body: { content: replyContent.value }
})
```

**修改后：**
```javascript
console.log('[Post Reply] 使用扁平路由 API 发表回复')
await $fetch(`/api/study-group-post-reply`, {
  method: 'POST',
  headers: authStore.getAuthHeader(),
  body: { groupId, postId, content: replyContent.value }
})
```

#### 5. 收藏帖子

**修改前：**
```javascript
await $fetch(`/api/study-groups/${groupId}/posts/${postId}/bookmark`, {
  method: 'POST',
  headers: authStore.getAuthHeader()
})
```

**修改后：**
```javascript
console.log('[Bookmark] 使用扁平路由 API 切换收藏状态')
await $fetch(`/api/study-group-post-bookmark`, {
  method: 'POST',
  headers: authStore.getAuthHeader(),
  body: { groupId, postId }
})
```

---

## 迁移效果

### 修复的问题
✅ 帖子详情页面可以正常打开
✅ 帖子点赞功能正常工作
✅ 回复点赞功能正常工作
✅ 发表回复功能正常工作
✅ 收藏帖子功能正常工作

### 控制台输出
修改后的代码在控制台会显示明确的日志：
```
[Post Detail] 使用扁平路由 API 加载帖子详情
[Post Like] 使用扁平路由 API 开始点赞操作
[Reply Like] 使用扁平路由 API 开始点赞操作
[Post Reply] 使用扁平路由 API 发表回复
[Bookmark] 使用扁平路由 API 切换收藏状态
```

这些日志便于调试和确认正在使用扁平路由。

---

## 安全性考虑

所有API都实现了以下安全检查：

1. **身份验证**：使用 `requireAuth(event)` 确保用户已登录
2. **成员身份检查**：验证用户是否为小组成员
3. **权限验证**：
   - 检查帖子是否属于指定小组
   - 检查帖子是否锁定（发表回复时）
4. **参数验证**：确保必要参数存在
5. **错误处理**：统一的错误格式和状态码

---

## 性能优化

1. **单次查询包含关联数据**
   ```typescript
   include: {
     author: true,
     replies: { include: { author: true } },
     _count: { select: { replies: true, likes: true } }
   }
   ```

2. **批量检查点赞状态**
   ```typescript
   const userReplyLikes = await prisma.replyLike.findMany({
     where: { replyId: { in: post.replies.map(r => r.id) } }
   })
   ```

3. **避免 N+1 查询**
   - 使用 `include` 而不是多次独立查询
   - 一次性获取所有回复的点赞状态

---

## 待迁移的 API

以下 API 仍在使用嵌套路由，需要根据实际需求逐步迁移：

- 帖子管理（置顶、精华、锁定）
- 帖子编辑/删除
- 回复编辑/删除
- 最佳答案设置
- 投票相关操作

如果这些功能也出现问题，可以按照相同的模式创建对应的扁平路由 API。

---

## 总结

通过将讨论区帖子相关的嵌套动态路由迁移到扁平路由，彻底解决了"打不开帖子"的问题。扁平路由模式在 Nuxt 3 SSR 环境下更加可靠，避免了动态路由返回 HTML 的问题。

所有修改保持了 API 的功能一致性，只是改变了路由结构和参数传递方式，对用户体验没有影响。
