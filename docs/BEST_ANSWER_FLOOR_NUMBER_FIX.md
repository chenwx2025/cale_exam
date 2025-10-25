# 最佳答案楼层号显示修复

## 问题描述

用户报告：选择了5楼作为最佳答案，但显示时老是显示2楼为最佳答案。

## 问题分析

### 根本原因

当最佳答案被置顶后，回复列表的**显示顺序改变**了，但楼层号的计算仍然基于**当前显示位置的index**，而不是回复的**原始创建顺序**。

### 具体场景

假设有5个回复（2-6楼）：

**排序前**（按时间顺序）：
```
2楼 - 回复1 (index=0)
3楼 - 回复2 (index=1)
4楼 - 回复3 (index=2)
5楼 - 回复4 (index=3)
6楼 - 回复5 (index=4) [设为最佳答案]
```

**排序后**（最佳答案置顶）：
```
6楼 - 回复5 (index=0) ✅ [最佳答案]
2楼 - 回复1 (index=1)
3楼 - 回复2 (index=2)
4楼 - 回复3 (index=3)
5楼 - 回复4 (index=4)
```

**问题**：
- 旧代码使用 `{{ index + 2 }}楼`
- 最佳答案（回复5）排序后变成index=0
- 显示为：0 + 2 = **2楼** ❌（错误！）
- 应该显示：**6楼** ✅

## 解决方案

### 修改后端API

在格式化回复数据时，**先计算并保存原始楼层号**，再进行排序。

#### 文件: `server/api/study-groups/[id]/posts/[postId]/index.get.ts`

```typescript
// 格式化回复数据并添加楼层号（基于时间顺序）
const formattedReplies = post.replies.map((reply, originalIndex) => {
  const isReplyLiked = reply.likes.some(like => like.userId === user.userId)

  return {
    id: reply.id,
    postId: reply.postId,
    userId: reply.userId,
    content: reply.content,
    isBestAnswer: reply.isBestAnswer,
    floorNumber: originalIndex + 2, // ✨ 保存原始楼层号
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
    likeCount: reply.likes?.length || 0,
    isLiked: isReplyLiked,
    author: reply.user
  }
})

// 对回复进行排序：最佳答案置顶，其他按时间顺序
formattedReplies.sort((a, b) => {
  if (a.isBestAnswer && !b.isBestAnswer) return -1
  if (!a.isBestAnswer && b.isBestAnswer) return 1
  return new Date(a.createdAt) - new Date(b.createdAt)
})
```

**关键点**：
1. 在排序**之前**，先用`originalIndex`计算楼层号
2. `floorNumber = originalIndex + 2`（因为1楼是主帖）
3. 将`floorNumber`保存在每个回复对象中
4. 排序后，楼层号依然保持不变

### 修改前端显示

#### 文件: `pages/study-groups/[id]/posts/[postId].vue`

**楼层号显示**：
```vue
<!-- 旧代码 ❌ -->
<span>{{ index + 2 }}楼</span>

<!-- 新代码 ✅ -->
<span>{{ reply.floorNumber }}楼</span>
```

**沙发/板凳/地板标识**：
```vue
<!-- 旧代码 ❌ -->
<span v-if="index === 0">🛋️ 沙发</span>
<span v-else-if="index === 1">🪑 板凳</span>
<span v-else-if="index === 2">🏠 地板</span>

<!-- 新代码 ✅ -->
<span v-if="reply.floorNumber === 2">🛋️ 沙发</span>
<span v-else-if="reply.floorNumber === 3">🪑 板凳</span>
<span v-else-if="reply.floorNumber === 4">🏠 地板</span>
```

**引用回复函数**：
```javascript
// 旧代码 ❌
const quoteReply = (reply, floorNumber) => {
  const quotedText = `引用来自 ${floorNumber}楼 @${author}：\n...`
}

// 调用
@click="quoteReply(reply, index + 2)"

// 新代码 ✅
const quoteReply = (reply) => {
  const floorNumber = reply.floorNumber
  const quotedText = `引用来自 ${floorNumber}楼 @${author}：\n...`
}

// 调用
@click="quoteReply(reply)"
```

## 修复效果

### 修复前

```
✅ 最佳答案 2楼  [回复5的内容]  ❌ 错误！这是6楼
🛋️ 沙发     3楼  [回复1的内容]  ❌ 错误！这是2楼
🪑 板凳     4楼  [回复2的内容]  ❌ 错误！这是3楼
```

### 修复后

```
✅ 最佳答案 6楼  [回复5的内容]  ✅ 正确！
🛋️ 沙发     2楼  [回复1的内容]  ✅ 正确！
🪑 板凳     3楼  [回复2的内容]  ✅ 正确！
🏠 地板     4楼  [回复3的内容]  ✅ 正确！
            5楼  [回复4的内容]  ✅ 正确！
```

## 技术细节

### 数据流程

1. **数据库查询**：按`createdAt ASC`排序获取回复
2. **计算楼层号**：遍历回复，`floorNumber = index + 2`
3. **排序重组**：最佳答案置顶，其他保持时间顺序
4. **前端显示**：使用`reply.floorNumber`而非`index + 2`

### 为什么要这样设计？

**BBS传统规则**：
- 楼层号代表回复的**发布顺序**，永远不变
- 第一个回复永远是"2楼"（沙发）
- 即使后来置顶、排序，楼层号也不会改变

**用户体验**：
- 用户引用"6楼"时，无论如何排序，都能找到原始的6楼回复
- 保持BBS论坛的传统习惯
- 避免混淆

## 文件修改清单

1. ✅ `server/api/study-groups/[id]/posts/[postId]/index.get.ts`
   - 添加`floorNumber`字段
   - 基于原始顺序计算楼层号

2. ✅ `pages/study-groups/[id]/posts/[postId].vue`
   - 楼层号显示改用`reply.floorNumber`
   - 沙发/板凳/地板标识改用`reply.floorNumber`
   - 更新`quoteReply`函数

## 测试验证

### 测试步骤

1. 打开"测绘时"帖子（有5个回复）
2. 查看当前楼层号显示
3. 设置第5个回复（6楼）为最佳答案
4. 刷新页面
5. 验证：
   - 最佳答案显示为"6楼" ✅
   - 沙发仍然是"2楼" ✅
   - 其他楼层号正确 ✅

## 总结

这个修复确保了**楼层号始终反映回复的原始发布顺序**，即使回复列表因最佳答案置顶而重新排序，楼层号也保持不变。这符合传统BBS论坛的设计规范，提供了更好的用户体验。

---

**修复时间**: ~10分钟
**影响范围**: 帖子详情页回复显示
**状态**: ✅ 已修复
