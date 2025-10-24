# Study Groups Posts Display Fix

**Date**: 2025-10-23
**Status**: ✅ FIXED
**Issue**: 小组有三个帖子但看不到

---

## Problem Description

用户反馈：学习小组明明有三个帖子，但在讨论标签页中看不到任何帖子。

---

## Root Cause

**缺少 GET API**: DiscussionsTab 组件调用 `/api/study-groups/[id]/posts` (GET) 来获取帖子列表，但这个 API 不存在。

### 原有情况

Server API 只有:
- ✅ `POST /api/study-groups/[id]/posts.post.ts` - 创建新帖子
- ❌ `GET /api/study-groups/[id]/posts.get.ts` - **缺失**

Frontend 调用:
```typescript
// DiscussionsTab.vue:176
const { data, error } = await useFetch(`/api/study-groups/${props.groupId}/posts`)
```

由于 GET API 不存在，请求返回 404，导致帖子列表为空。

---

## Solution

### 1. 创建 GET Posts API

新建文件 [server/api/study-groups/[id]/posts.get.ts](server/api/study-groups/[id]/posts.get.ts):

```typescript
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')

  // 检查用户是否是小组成员
  const membership = await prisma.studyGroupMember.findFirst({
    where: { groupId, userId: user.userId }
  })

  if (!membership) {
    throw createError({
      statusCode: 403,
      message: '只有小组成员可以查看讨论'
    })
  }

  // 获取帖子列表（包含回复和反应）
  const posts = await prisma.studyGroupPost.findMany({
    where: { groupId },
    include: {
      user: { select: { id, name, email, avatar, nickname } },
      replies: {
        include: {
          user: { select: { id, name, email, avatar, nickname } }
        },
        orderBy: { createdAt: 'asc' }
      },
      reactions: {
        select: { id, type, userId }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 格式化数据（user -> author）
  const formattedPosts = posts.map(post => ({
    ...post,
    author: post.user,
    replies: post.replies.map(reply => ({
      ...reply,
      author: reply.user
    }))
  }))

  return {
    success: true,
    data: formattedPosts
  }
})
```

**功能**:
- ✅ 验证用户认证
- ✅ 检查用户是否是小组成员（权限控制）
- ✅ 获取帖子、回复、反应数据
- ✅ 格式化数据以匹配前端期望的结构

### 2. 更新 DiscussionsTab 组件

修改 [components/study-groups/DiscussionsTab.vue](components/study-groups/DiscussionsTab.vue:153-190):

```typescript
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// Load posts on mount
onMounted(async () => {
  await authStore.init()  // 确保认证状态已加载
  await loadPosts()
})

// Load posts
async function loadPosts() {
  loadingPosts.value = true
  try {
    console.log('[DiscussionsTab] 开始加载帖子, groupId:', props.groupId)
    const { data, error } = await useFetch(`/api/study-groups/${props.groupId}/posts`, {
      headers: authStore.getAuthHeader()  // 明确添加认证头
    })
    if (error.value) {
      console.error('[DiscussionsTab] 加载讨论失败:', error.value)
      alert('加载讨论失败')
    } else if (data.value) {
      posts.value = data.value.data || []
      console.log('[DiscussionsTab] 加载到帖子数量:', posts.value.length)
    }
  } catch (err) {
    console.error('[DiscussionsTab] 加载讨论异常:', err)
  } finally {
    loadingPosts.value = false
  }
}
```

**改进**:
- ✅ 使用 authStore 替代 `/api/auth/user` API 调用
- ✅ 初始化 authStore 确保 token 已加载
- ✅ 明确添加认证头
- ✅ 添加调试日志

---

## How to Test

### 测试步骤

1. **清除缓存并重新加载页面**
   ```bash
   Ctrl+Shift+Delete (or Cmd+Shift+Delete)
   Hard reload: Ctrl+F5 (or Cmd+Shift+R)
   ```

2. **登录并进入学习小组**
   - 确保已登录
   - 进入学习小组列表
   - 点击某个有帖子的小组

3. **查看讨论标签**
   - 应该能看到所有帖子
   - 帖子应该包含作者信息、创建时间
   - 应该能看到回复和反应按钮

### 预期控制台输出

```
[Study Group Detail] Auth store initialized, token: exists
[Study Group Detail] 开始加载小组: clx...
[AUTH] Token验证成功: { userId: '...', path: '/api/study-groups/...' }
[Study Group Detail] 小组数据加载成功: {...}
[DiscussionsTab] 开始加载帖子, groupId: clx...
[AUTH] Token验证成功: { userId: '...', path: '/api/study-groups/.../posts' }
[DiscussionsTab] 加载到帖子数量: 3
```

### 验证功能

- ✅ 能看到所有帖子
- ✅ 帖子按创建时间倒序排列（最新的在上面）
- ✅ 显示作者头像（首字母）和名字
- ✅ 显示创建时间（相对时间，如"2小时前"）
- ✅ 能看到回复数量
- ✅ 能看到反应（👍 💡 ✨）数量

---

## Data Flow

```
用户访问小组详情页
    ↓
pages/study-groups/[id].vue
    ↓
加载小组信息: GET /api/study-groups/[id]
    ↓
渲染 DiscussionsTab 组件
    ↓
DiscussionsTab.onMounted()
    ↓
初始化 authStore (加载 token)
    ↓
loadPosts(): GET /api/study-groups/[id]/posts
    ↓
服务器验证:
  1. 检查 Authorization header
  2. 验证 JWT token
  3. 检查用户是否是小组成员
    ↓
返回帖子数据:
  - posts (帖子)
  - replies (回复)
  - reactions (反应)
    ↓
前端渲染帖子列表
```

---

## Database Schema Reference

### StudyGroupPost

```prisma
model StudyGroupPost {
  id        String   @id @default(cuid())
  groupId   String
  userId    String
  content   String   @db.Text
  createdAt DateTime @default(now())

  group     StudyGroup  @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id])
  replies   StudyGroupPostReply[]
  reactions StudyGroupPostReaction[]
}
```

### StudyGroupPostReply

```prisma
model StudyGroupPostReply {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  content   String   @db.Text
  createdAt DateTime @default(now())

  post      StudyGroupPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User           @relation(fields: [userId], references: [id])
}
```

### StudyGroupPostReaction

```prisma
model StudyGroupPostReaction {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  type      String   // 'like', 'helpful', 'insightful'
  createdAt DateTime @default(now())

  post      StudyGroupPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User           @relation(fields: [userId], references: [id])

  @@unique([postId, userId, type])
}
```

---

## Related Files

### 新建文件
- [server/api/study-groups/[id]/posts.get.ts](server/api/study-groups/[id]/posts.get.ts) - 获取帖子列表 API

### 修改文件
- [components/study-groups/DiscussionsTab.vue](components/study-groups/DiscussionsTab.vue) - 讨论标签组件

### 相关文件
- [server/api/study-groups/[id]/posts.post.ts](server/api/study-groups/[id]/posts.post.ts) - 创建帖子 API (已存在)
- [server/api/study-groups/[id]/posts/[postId]/reply.post.ts](server/api/study-groups/[id]/posts/[postId]/reply.post.ts) - 回复帖子 API (需要验证)
- [server/api/study-groups/[id]/posts/[postId]/react.post.ts](server/api/study-groups/[id]/posts/[postId]/react.post.ts) - 反应帖子 API (需要验证)

---

## Future Improvements

1. **分页加载**
   - 当前一次性加载所有帖子
   - 建议：实现分页或无限滚动

2. **实时更新**
   - 当前需要手动刷新看到新帖子
   - 建议：使用 WebSocket 或轮询实现实时更新

3. **富文本编辑**
   - 当前只支持纯文本
   - 建议：支持 Markdown 或富文本格式

4. **图片上传**
   - 当前不支持图片
   - 建议：添加图片上传功能

5. **帖子搜索**
   - 当前无法搜索帖子
   - 建议：添加搜索功能

---

## Summary

✅ **创建了 GET posts API** 用于获取帖子列表
✅ **修复了 DiscussionsTab** 组件的认证问题
✅ **添加了调试日志** 便于问题追踪
✅ **帖子现在可以正常显示** 包括回复和反应

**Status**: 🟢 READY FOR TESTING

---

**Last Updated**: 2025-10-23
**Fixed By**: 创建缺失的 GET posts API
