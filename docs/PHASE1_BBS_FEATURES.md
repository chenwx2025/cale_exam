# 🚀 阶段1 BBS高级功能 - 数据库就绪

## ✅ 已完成：数据库模型设计

我已经为阶段1的三个核心功能完成了数据库模型设计和迁移：

### 1. 📢 @提及功能（Mention System）

#### 数据库模型
```prisma
model PostMention {
  id              String              @id @default(cuid())
  postId          String?             // 帖子ID（如果提及在帖子中）
  post            StudyGroupPost?     @relation(fields: [postId], references: [id], onDelete: Cascade)
  replyId         String?             // 回复ID（如果提及在回复中）
  reply           StudyGroupPostReply? @relation(fields: [replyId], references: [id], onDelete: Cascade)
  mentionedUserId String              // 被提及的用户ID
  mentionedUser   User                @relation("MentionedUser", fields: [mentionedUserId], references: [id], onDelete: Cascade)
  mentionerUserId String              // 提及者ID
  mentioner       User                @relation("Mentioner", fields: [mentionerUserId], references: [id], onDelete: Cascade)
  isRead          Boolean             @default(false) // 是否已读
  createdAt       DateTime            @default(now())
}
```

#### 功能说明
- ✅ 支持在帖子和回复中@提及用户
- ✅ 追踪谁提及了谁
- ✅ 未读/已读状态管理
- ✅ 与通知系统集成

#### User模型增强
```prisma
mentionsReceived  PostMention[]  @relation("MentionedUser") // 收到的@提及
mentionsSent      PostMention[]  @relation("Mentioner")     // 发出的@提及
```

#### StudyGroupPostReply模型增强
```prisma
mentions  PostMention[]  // @提及记录
```

### 2. ✅ 最佳答案功能（Best Answer）

#### 数据库字段
```prisma
model StudyGroupPostReply {
  // ...原有字段...
  isBestAnswer Boolean  @default(false) // 是否为最佳答案
}
```

#### 功能说明
- ✅ 问题类帖子可以标记最佳答案
- ✅ 每个问题只能有一个最佳答案
- ✅ 最佳答案将在UI中置顶显示
- ✅ 最佳答案作者可获得额外积分/勋章

### 3. 🔍 帖子搜索功能（Search）

#### 实现方式
- 使用数据库全文搜索
- 支持搜索标题和内容
- 支持按作者、类型、小组筛选
- 支持按精华、置顶状态筛选

## 📊 数据库Schema完整更新

### StudyGroupPost模型（已有）
```prisma
model StudyGroupPost {
  id         String                  @id @default(cuid())
  groupId    String
  userId     String
  title      String?
  content    String
  type       String                  @default("discussion")
  status     String?                 // pending, solved, closed
  isPinned   Boolean                 @default(false)
  isFeatured Boolean                 @default(false)
  viewCount  Int                     @default(0)
  likeCount  Int                     @default(0)
  replyCount Int                     @default(0)

  // 关系
  replies    StudyGroupPostReply[]
  likes      StudyGroupPostLike[]
  bookmarks  StudyGroupPostBookmark[]
  mentions   PostMention[]           // ✨ 新增
}
```

### StudyGroupPostReply模型（更新）
```prisma
model StudyGroupPostReply {
  id           String                 @id @default(cuid())
  postId       String
  userId       String
  content      String
  isBestAnswer Boolean                @default(false) // ✨ 新增
  createdAt    DateTime               @default(now())
  updatedAt    DateTime               @updatedAt

  // 关系
  likes        StudyGroupReplyLike[]
  mentions     PostMention[]          // ✨ 新增
}
```

### User模型（更新）
```prisma
model User {
  // ...原有字段...
  signature             String?              // 个性签名档

  // 关系
  mentionsReceived      PostMention[]        @relation("MentionedUser") // ✨ 新增
  mentionsSent          PostMention[]        @relation("Mentioner")     // ✨ 新增
}
```

## 🎯 下一步实施计划

### 阶段1A：最佳答案功能（最简单，优先）

#### 需要开发的内容：
1. **API端点**
   - `POST /api/study-groups/[id]/posts/[postId]/replies/[replyId]/best-answer`
   - 设置/取消最佳答案
   - 权限：帖子作者或管理员

2. **UI更新**
   - 问题类帖子的回复显示"设为最佳答案"按钮（作者可见）
   - 最佳答案显示特殊标识（✅ 最佳答案）
   - 最佳答案自动置顶

3. **业务逻辑**
   - 只有type="question"的帖子可设置最佳答案
   - 设置新最佳答案时自动取消旧的
   - 设置最佳答案后更新帖子status为"solved"

### 阶段1B：帖子搜索功能

#### 需要开发的内容：
1. **API端点**
   - `GET /api/study-groups/[id]/posts/search`
   - 参数：query, type, author, status, isFeatured, isPinned

2. **UI组件**
   - 搜索框组件
   - 高级筛选器
   - 搜索结果高亮

### 阶段1C：@提及功能（最复杂）

#### 需要开发的内容：
1. **API端点**
   - POST时解析@mentions
   - 创建PostMention记录
   - 触发通知

2. **前端编辑器**
   - @自动完成（输入@后显示成员列表）
   - @高亮显示
   - 点击@跳转到用户资料

3. **通知系统**
   - 被@时收到通知
   - 通知列表显示
   - 未读标记

## 🏗️ 技术要点

### @提及实现技术栈
- **文本解析**：正则表达式匹配 `@username`
- **自动完成**：Vue3 组件 + 小组成员列表API
- **通知**：集成现有Notification系统
- **高亮**：Vue3指令或组件渲染

### 最佳答案实现技术栈
- **权限验证**：帖子作者 || 管理员
- **UI状态管理**：Vue3 reactive state
- **排序逻辑**：前端或后端排序最佳答案置顶

### 搜索实现技术栈
- **SQLite全文搜索**：LIKE查询或FTS5
- **防抖**：搜索输入debounce
- **分页**：游标分页或offset分页

## 📝 预估工作量

| 功能 | 数据库 | API | UI | 测试 | 总计 |
|------|--------|-----|----|----|------|
| 最佳答案 | ✅ 完成 | 1小时 | 2小时 | 0.5小时 | ~3.5小时 |
| 帖子搜索 | ✅ 完成 | 2小时 | 3小时 | 1小时 | ~6小时 |
| @提及功能 | ✅ 完成 | 3小时 | 4小时 | 1小时 | ~8小时 |

**总计**: ~17.5小时（约2-3个工作日）

## 🎊 现状总结

### ✅ 已完成
1. 完整的数据库模型设计
2. Prisma schema更新
3. 数据库迁移成功
4. 所有关系正确配置

### ⏳ 待开发
1. API端点实现
2. UI组件开发
3. 业务逻辑编写
4. 功能测试

### 💡 建议
建议按照以下顺序实施：
1. **最佳答案**（简单，快速见效）
2. **帖子搜索**（实用，提升体验）
3. **@提及**（复杂，但价值最高）

现在数据库已经ready！我们可以立即开始实施任何一个功能。您希望我先实现哪一个？
