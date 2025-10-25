# 剩余嵌套路由 API 迁移计划

## 当前状态

在检查代码后，发现以下嵌套动态路由 API 仍在前端使用，可能存在返回 HTML 的问题。

## 已发现需要迁移的 API

### 1. ✅ 置顶帖子 API
- **当前路由**: `/api/study-groups/${groupId}/posts/${postId}/pin`
- **新建路由**: `/api/study-group-post-pin`
- **状态**: 已创建扁平路由 API
- **前端文件**: `pages/study-groups/[id]/posts/[postId].vue:646`

### 2. ✅ 精华帖子 API
- **当前路由**: `/api/study-groups/${groupId}/posts/${postId}/featured`
- **新建路由**: `/api/study-group-post-featured`
- **状态**: 已创建扁平路由 API（使用 sed 转换）
- **前端文件**: `pages/study-groups/[id]/posts/[postId].vue:678`

### 3. ✅ 锁定帖子 API
- **当前路由**: `/api/study-groups/${groupId}/posts/${postId}/lock`
- **新建路由**: `/api/study-group-post-lock`
- **状态**: 已创建扁平路由 API（使用 sed 转换）
- **前端文件**: `pages/study-groups/[id]/posts/[postId].vue:709`

### 4. 编辑帖子 API
- **当前路由**: `/api/study-groups/${groupId}/posts/${postId}/edit` (PUT)
- **新建路由**: `/api/study-group-post-edit`
- **状态**: 待迁移
- **前端文件**: `pages/study-groups/[id]/posts/[postId].vue:783`
- **特殊性**: 已经使用 `readBody` 读取数据，只需调整路由参数来源

### 5. 编辑回复 API
- **当前路由**: `/api/study-groups/${groupId}/posts/${postId}/replies/${replyId}/edit` (PUT)
- **新建路由**: `/api/study-group-reply-edit`
- **状态**: 待迁移
- **前端文件**: `pages/study-groups/[id]/posts/[postId].vue:835`

### 6. 成员列表 API（帖子页面调用）
- **当前路由**: `/api/study-groups/${groupId}/members`
- **新建路由**: `/api/study-group-members` ✅ 已创建
- **状态**: API 已创建，但此处前端未更新
- **前端文件**: `pages/study-groups/[id]/posts/[postId].vue:625`
- **用途**: 加载用户角色

## 优先级分级

### 高优先级（用户常用功能）
1. ✅ 置顶帖子 - 管理员常用
2. ✅ 精华帖子 - 管理员常用
3. ✅ 锁定帖子 - 管理员常用
4. 编辑帖子 - 用户常用
5. 编辑回复 - 用户常用

### 中优先级
6. 成员列表（帖子页面） - 仅用于权限检查

## 迁移策略

由于已经创建了部分扁平路由 API，现在需要：

1. **完成剩余 API 创建**:
   - 编辑帖子 API
   - 编辑回复 API

2. **更新前端代码**:
   - 修改所有调用这些 API 的地方
   - 统一使用扁平路由 + body 参数的方式

3. **测试验证**:
   - 测试置顶/取消置顶
   - 测试精华/取消精华
   - 测试锁定/解锁
   - 测试编辑帖子
   - 测试编辑回复

## 标准化模式

所有扁平路由 API 应遵循以下模式：

```typescript
// API 文件名
server/api/study-group-{功能}.{method}.ts

// 路由
/api/study-group-{功能}

// 请求方式
POST 或 PUT（根据操作性质）

// 请求体
{
  groupId: string,
  postId: string,
  replyId?: string,  // 如果需要
  ...其他参数
}

// 响应
{
  success: boolean,
  message: string,
  data?: any
}
```

## 注意事项

1. **PUT vs POST**: 编辑操作使用 PUT，切换状态使用 POST
2. **参数验证**: 所有 API 都要验证必需参数
3. **权限检查**: 保持与原 API 相同的权限逻辑
4. **错误处理**: 统一的错误响应格式
5. **日志标识**: 使用 `[FLAT XXX]` 前缀便于区分

## 下一步行动

1. 创建编辑帖子和编辑回复的扁平路由 API
2. 批量更新前端代码使用新的 API
3. 测试所有迁移的功能
4. 创建完整的迁移文档

## 日期

2025-10-25
