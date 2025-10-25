# 引用楼层号显示修复

## 问题

点击"引用"按钮时，引用文本显示"引用来自 undefined楼"，没有显示正确的楼层号。

## 原因

- API 返回的回复数据中没有 `floorNumber` 字段
- 前端代码直接使用 `reply.floorNumber`，导致显示 `undefined`

## 解决方案

在 `loadPost` 函数中，处理 API 返回的回复数据时，为每个回复添加 `floorNumber` 字段。

**文件**: `pages/study-groups/[id]/posts/[postId].vue`

### 修改前
```javascript
const loadPost = async () => {
  // ...
  post.value = result.data
  replies.value = result.data.replies || []
  // ...
}
```

### 修改后
```javascript
const loadPost = async () => {
  // ...
  post.value = result.data
  // 为回复添加楼层号（从2楼开始，1楼是主帖）
  replies.value = (result.data.replies || []).map((reply, index) => ({
    ...reply,
    floorNumber: index + 2
  }))
  // ...
}
```

## 楼层规则

- **1楼**: 主帖（post）
- **2楼及以后**: 回复（replies），按照回复的顺序排列

## 特殊楼层标识

代码中还包含了BBS风格的楼层昵称：
- **2楼**: 🛋️ 沙发
- **3楼**: 🪑 板凳
- **4楼**: 🏠 地板

## 测试

1. 刷新帖子详情页
2. 查看回复的楼层号是否正确显示（2楼、3楼、4楼...）
3. 点击主帖的"引用回复"按钮，应该显示"引用来自 1楼 @作者"
4. 点击任意回复的"引用"按钮，应该显示"引用来自 X楼 @回复者"

## 状态

✅ **完成** - 引用功能现在会正确显示楼层号

## 日期

2025-10-25
