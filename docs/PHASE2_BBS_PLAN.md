# Phase 2: BBS内容组织与管理功能

## 📋 概述

Phase 1已经完成了核心交互功能（最佳答案、搜索、@提及）。Phase 2将专注于**内容组织和管理**，让论坛内容更有序、更易管理。

---

## 🎯 Phase 2 功能列表

### 2A. 帖子置顶/取消置顶（高优先级）⭐️⭐️⭐️

**功能描述**：
- 管理员可以置顶重要帖子
- 置顶帖在列表中始终排在最前面
- 显示📌置顶标识
- 可以取消置顶

**数据库**：
```prisma
model StudyGroupPost {
  isPinned Boolean @default(false)  // ✅ 已存在

  @@index([isPinned])
}
```

**API端点**：
- `POST /api/study-groups/[id]/posts/[postId]/pin` - 置顶/取消置顶

**权限**：
- 只有owner/admin/moderator可以置顶

**预计时间**：~2小时

---

### 2B. 帖子标签系统（中优先级）⭐️⭐️

**功能描述**：
- 帖子可以添加多个标签
- 标签用于分类和组织内容
- 可以按标签筛选帖子
- 显示热门标签

**数据库**：
```prisma
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  color     String?  // 标签颜色
  createdAt DateTime @default(now())
  postTags  PostTag[]
}

model PostTag {
  id     String          @id @default(cuid())
  postId String
  post   StudyGroupPost  @relation(...)
  tagId  String
  tag    Tag             @relation(...)

  @@unique([postId, tagId])
  @@index([postId])
  @@index([tagId])
}
```

**API端点**：
- `GET /api/tags` - 获取所有标签
- `POST /api/study-groups/[id]/posts/[postId]/tags` - 为帖子添加标签
- `DELETE /api/study-groups/[id]/posts/[postId]/tags/[tagId]` - 移除标签
- `GET /api/study-groups/[id]/posts?tag=[tagName]` - 按标签筛选

**UI组件**：
- 标签选择器
- 标签云显示
- 标签过滤器

**预计时间**：~5小时

---

### 2C. 用户签名档（低优先级）⭐️

**功能描述**：
- 用户可以设置个性签名
- 签名显示在每个帖子/回复下方
- 支持纯文本

**数据库**：
```prisma
model User {
  signature String?  // ✅ 已存在
}
```

**API端点**：
- `PUT /api/user/signature` - 更新签名

**UI位置**：
- 用户设置页面
- 帖子/回复作者信息区

**预计时间**：~2小时

---

### 2D. 帖子编辑功能（中优先级）⭐️⭐️

**功能描述**：
- 用户可以编辑自己的帖子
- 显示"已编辑"标记和编辑时间
- 管理员可以编辑任何帖子

**数据库**：
```prisma
model StudyGroupPost {
  updatedAt DateTime @updatedAt  // ✅ 已存在
  editedAt  DateTime?            // 最后编辑时间
  editCount Int      @default(0) // 编辑次数
}
```

**API端点**：
- `PUT /api/study-groups/[id]/posts/[postId]` - 编辑帖子

**权限**：
- 帖子作者或管理员

**预计时间**：~3小时

---

### 2E. 帖子删除/隐藏（中优先级）⭐️⭐️

**功能描述**：
- 软删除帖子（不从数据库删除）
- 显示"此帖已删除"提示
- 管理员可以恢复已删除帖子

**数据库**：
```prisma
model StudyGroupPost {
  isDeleted Boolean  @default(false)
  deletedAt DateTime?
  deletedBy String?
}
```

**API端点**：
- `DELETE /api/study-groups/[id]/posts/[postId]` - 软删除
- `POST /api/study-groups/[id]/posts/[postId]/restore` - 恢复

**预计时间**：~2.5小时

---

### 2F. 帖子锁定功能（低优先级）⭐️

**功能描述**：
- 管理员可以锁定帖子
- 锁定后不能回复
- 显示🔒锁定标识

**数据库**：
```prisma
model StudyGroupPost {
  isLocked Boolean  @default(false)
  lockedAt DateTime?
  lockedBy String?
}
```

**API端点**：
- `POST /api/study-groups/[id]/posts/[postId]/lock` - 锁定/解锁

**预计时间**：~1.5小时

---

## 📊 Phase 2 优先级排序

### 推荐实施顺序：

1. **置顶功能** (2A) - ⭐️⭐️⭐️高优先级，简单快速
2. **帖子编辑** (2D) - ⭐️⭐️实用性强
3. **帖子删除** (2E) - ⭐️⭐️管理必需
4. **标签系统** (2B) - ⭐️⭐️内容组织核心
5. **签名档** (2C) - ⭐️个性化功能
6. **帖子锁定** (2F) - ⭐️可选功能

---

## 🎨 UI设计建议

### 置顶帖标识
```
📌 [置顶] 欢迎新成员！学习小组使用指南
⭐️ [精华] Vue 3响应式原理详解
```

### 标签显示
```
#Vue3  #响应式  #教程
[蓝色] [绿色]   [橙色]
```

### 管理员操作菜单
```
[下拉菜单]
- 📌 置顶/取消置顶
- ⭐️ 设为精华/取消精华
- 🔒 锁定/解锁
- 🗑️ 删除
- ✏️ 编辑
```

---

## 🔧 技术实现要点

### 置顶排序
```javascript
orderBy: [
  { isPinned: 'desc' },     // 置顶优先
  { isFeatured: 'desc' },   // 精华次之
  { createdAt: 'desc' }     // 最新排后
]
```

### 标签颜色方案
```javascript
const tagColors = {
  blue: { bg: '#EFF6FF', text: '#1E40AF' },
  green: { bg: '#F0FDF4', text: '#15803D' },
  red: { bg: '#FEF2F2', text: '#B91C1C' },
  orange: { bg: '#FFF7ED', text: '#C2410C' },
  purple: { bg: '#F5F3FF', text: '#7C3AED' }
}
```

### 软删除过滤
```javascript
// 查询时排除已删除
where: {
  isDeleted: false
}

// 管理员查看包括已删除
where: {
  OR: [
    { isDeleted: false },
    { isDeleted: true } // 管理员可见
  ]
}
```

---

## 📈 预计总时间

| 功能 | 时间 | 优先级 |
|------|------|--------|
| 2A. 置顶 | 2h | 高 |
| 2B. 标签 | 5h | 中 |
| 2C. 签名档 | 2h | 低 |
| 2D. 编辑 | 3h | 中 |
| 2E. 删除 | 2.5h | 中 |
| 2F. 锁定 | 1.5h | 低 |
| **总计** | **16h** | - |

---

## 🎯 Phase 2 完成标准

### 必须完成（MVP）
- ✅ 置顶功能
- ✅ 帖子编辑
- ✅ 帖子删除

### 推荐完成
- ✅ 标签系统
- ⚠️ 签名档（可选）

### 可选功能
- ⚠️ 帖子锁定

---

## 🚀 下一步行动

### 立即开始
1. 实现置顶功能（最简单，最实用）
2. 测试置顶排序逻辑
3. 添加UI控制按钮

### 后续步骤
1. 帖子编辑功能
2. 软删除功能
3. 标签系统（最复杂）

---

## 💡 用户场景

### 场景1：小组管理员置顶重要公告
```
1. 管理员发布"学习计划调整通知"
2. 点击"置顶"按钮
3. 帖子显示📌标识并置顶
4. 所有成员进入小组首先看到这个公告
```

### 场景2：使用标签组织学习资料
```
1. 用户发布Vue教程帖子
2. 添加标签：#Vue3 #教程 #前端
3. 其他用户点击#Vue3标签
4. 看到所有Vue3相关帖子
```

### 场景3：编辑帖子更新内容
```
1. 用户发现帖子中有错别字
2. 点击"编辑"按钮
3. 修改内容并保存
4. 帖子显示"已编辑"标记
```

---

## 📝 注意事项

### 权限控制
- 置顶：仅管理员
- 编辑：作者+管理员
- 删除：作者+管理员
- 锁定：仅管理员
- 标签：所有成员（或仅作者）

### 数据一致性
- 删除帖子时不删除回复（软删除）
- 标签删除时清理关联
- 置顶帖数量建议限制（如最多3个）

### 性能优化
- 标签查询添加索引
- 置顶帖缓存
- 分页加载

---

**创建日期**: 2025-10-24
**状态**: 📝 规划中
**预计开始**: 立即
**预计完成**: Phase 2 MVP ~1-2天

让我们从最简单实用的**置顶功能**开始！🚀
