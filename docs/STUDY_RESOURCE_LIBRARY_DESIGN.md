# 学习资料库功能设计文档

## 一、功能概述

学习资料库是学习小组的核心功能之一，允许成员上传、分享、下载和管理各类学习资料，促进小组内的知识共享和协作学习。

## 二、核心功能特性

### 1. 资料类型支持
- **文档类**：PDF、Word、PowerPoint、Excel
- **图片类**：JPG、PNG、GIF、图表、思维导图
- **视频类**：MP4、在线视频链接（YouTube、B站等）
- **外部链接**：学习网站、在线课程、参考资料链接
- **压缩包**：ZIP、RAR（包含多个文件）

### 2. 资料分类体系
```
📚 考试真题
  - 历年真题
  - 模拟试题
  - 题目解析

📝 学习笔记
  - 个人笔记
  - 整理笔记
  - 思维导图

📖 教材资料
  - 教材PDF
  - 参考书籍
  - 辅导资料

🎥 视频课程
  - 录播课程
  - 直播回放
  - 讲座视频

📄 参考文献
  - 学术论文
  - 研究报告
  - 期刊文章

🔗 在线资源
  - 学习网站
  - 在线工具
  - 相关链接

📦 综合资料包
  - 复习资料包
  - 专题资料包
  - 考前冲刺包
```

### 3. 权限管理系统
- **上传权限**：
  - 小组owner/admin：无限制上传
  - 普通成员：需要管理员开启权限
  - 可设置每日/每月上传数量限制

- **下载权限**：
  - 仅小组成员可见和下载
  - 可设置某些资料仅admin/moderator可见

- **审核机制**：
  - 可选择开启资料审核
  - 管理员审核通过后资料才可见
  - 自动检测违规内容

### 4. 互动和评价功能
- **评分系统**：5星评分，帮助筛选优质资料
- **评论讨论**：成员可以评论和讨论资料
- **收藏功能**：个人收藏夹，快速访问常用资料
- **分享统计**：记录下载次数和浏览量
- **点赞功能**：为优质资料点赞

### 5. 搜索和筛选
- **关键词搜索**：搜索标题、描述、标签
- **分类筛选**：按资料类型筛选
- **标签筛选**：自定义标签系统
- **排序方式**：
  - 最新上传
  - 最多下载
  - 最高评分
  - 最热门（综合指标）

### 6. 存储和管理
- **文件大小限制**：单个文件最大100MB
- **存储配额**：每个小组有存储空间限制
- **文件预览**：支持在线预览PDF、图片、视频
- **版本管理**：允许更新资料并保留历史版本

## 三、数据库设计

### 3.1 主要数据模型

```prisma
// 学习资料
model StudyResource {
  id              String   @id @default(cuid())
  groupId         String
  group           StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  uploaderId      String
  uploader        User @relation("ResourceUploader", fields: [uploaderId], references: [id], onDelete: Cascade)

  // 基本信息
  title           String              // 资料标题
  description     String?             // 资料描述
  category        String              // 资料分类
  tags            String?             // 标签（JSON数组）

  // 资料类型和存储
  type            String              // document, image, video, link, archive
  fileUrl         String?             // 文件URL（如果是上传的文件）
  fileName        String?             // 原始文件名
  fileSize        Int?                // 文件大小（字节）
  mimeType        String?             // MIME类型
  externalUrl     String?             // 外部链接URL（如果是链接类型）
  thumbnailUrl    String?             // 缩略图URL

  // 版本管理
  version         Int      @default(1)              // 版本号
  previousVersionId String?                        // 上一版本ID
  previousVersion   StudyResource? @relation("ResourceVersion", fields: [previousVersionId], references: [id])
  nextVersions      StudyResource[] @relation("ResourceVersion")

  // 状态和权限
  status          String   @default("pending")     // pending, approved, rejected
  visibility      String   @default("members")     // members, admins_only
  requiresApproval Boolean  @default(false)        // 是否需要审核
  approvedBy      String?                          // 审核者ID
  approvedAt      DateTime?                        // 审核时间
  rejectionReason String?                          // 拒绝原因

  // 统计数据
  viewCount       Int      @default(0)             // 浏览次数
  downloadCount   Int      @default(0)             // 下载次数
  ratingSum       Int      @default(0)             // 评分总和
  ratingCount     Int      @default(0)             // 评分人数
  averageRating   Float?                           // 平均评分

  // 关联数据
  ratings         ResourceRating[]                 // 评分记录
  comments        ResourceComment[]                // 评论
  downloads       ResourceDownload[]               // 下载记录
  favorites       ResourceFavorite[]               // 收藏记录

  // 时间戳
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?                        // 软删除

  @@index([groupId])
  @@index([uploaderId])
  @@index([category])
  @@index([type])
  @@index([status])
  @@index([createdAt])
  @@index([downloadCount])
  @@index([averageRating])
}

// 资料评分
model ResourceRating {
  id          String   @id @default(cuid())
  resourceId  String
  resource    StudyResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  userId      String
  user        User @relation("ResourceRatings", fields: [userId], references: [id], onDelete: Cascade)
  rating      Int                     // 1-5星评分
  review      String?                 // 评价文字
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([resourceId, userId])
  @@index([resourceId])
  @@index([userId])
  @@index([rating])
}

// 资料评论
model ResourceComment {
  id          String   @id @default(cuid())
  resourceId  String
  resource    StudyResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  userId      String
  user        User @relation("ResourceComments", fields: [userId], references: [id], onDelete: Cascade)
  content     String                  // 评论内容
  parentId    String?                 // 父评论ID（支持回复）
  parent      ResourceComment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies     ResourceComment[] @relation("CommentReplies")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?               // 软删除

  @@index([resourceId])
  @@index([userId])
  @@index([parentId])
  @@index([createdAt])
}

// 资料下载记录
model ResourceDownload {
  id          String   @id @default(cuid())
  resourceId  String
  resource    StudyResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  userId      String
  user        User @relation("ResourceDownloads", fields: [userId], references: [id], onDelete: Cascade)
  ipAddress   String?                 // IP地址（防刷）
  userAgent   String?                 // 用户代理
  createdAt   DateTime @default(now())

  @@index([resourceId])
  @@index([userId])
  @@index([createdAt])
}

// 资料收藏
model ResourceFavorite {
  id          String   @id @default(cuid())
  resourceId  String
  resource    StudyResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  userId      String
  user        User @relation("ResourceFavorites", fields: [userId], references: [id], onDelete: Cascade)
  folderId    String?                 // 收藏夹ID（可选）
  folder      ResourceFolder? @relation(fields: [folderId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())

  @@unique([resourceId, userId])
  @@index([resourceId])
  @@index([userId])
  @@index([folderId])
}

// 收藏夹（个人分类）
model ResourceFolder {
  id          String   @id @default(cuid())
  userId      String
  user        User @relation("ResourceFolders", fields: [userId], references: [id], onDelete: Cascade)
  name        String                  // 收藏夹名称
  description String?                 // 描述
  icon        String?                 // 图标
  color       String?                 // 颜色
  isDefault   Boolean  @default(false) // 是否为默认收藏夹
  favorites   ResourceFavorite[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([isDefault])
}
```

### 3.2 User模型需要添加的关系

```prisma
model User {
  // ... 现有字段 ...

  // 资料库相关
  uploadedResources    StudyResource[] @relation("ResourceUploader")
  resourceRatings      ResourceRating[] @relation("ResourceRatings")
  resourceComments     ResourceComment[] @relation("ResourceComments")
  resourceDownloads    ResourceDownload[] @relation("ResourceDownloads")
  resourceFavorites    ResourceFavorite[] @relation("ResourceFavorites")
  resourceFolders      ResourceFolder[] @relation("ResourceFolders")
}
```

### 3.3 StudyGroup模型需要添加的关系

```prisma
model StudyGroup {
  // ... 现有字段 ...

  resources StudyResource[]  // 资料库
}
```

## 四、API接口设计

### 4.1 资料管理接口

```typescript
// 1. 上传资料
POST /api/study-groups/[groupId]/resources
Body: {
  title: string
  description?: string
  category: string
  tags?: string[]
  type: 'document' | 'image' | 'video' | 'link' | 'archive'
  file?: File  // 文件上传
  externalUrl?: string  // 外部链接
  visibility?: 'members' | 'admins_only'
}
Response: { success: boolean, data: StudyResource }

// 2. 获取资料列表
GET /api/study-groups/[groupId]/resources
Query: {
  page?: number
  pageSize?: number
  category?: string
  type?: string
  tags?: string
  search?: string
  sortBy?: 'latest' | 'downloads' | 'rating' | 'views'
  status?: 'pending' | 'approved' | 'rejected'
}
Response: { success: boolean, data: { resources: StudyResource[], pagination: {...} } }

// 3. 获取资料详情
GET /api/study-groups/[groupId]/resources/[resourceId]
Response: { success: boolean, data: StudyResource }

// 4. 更新资料
PUT /api/study-groups/[groupId]/resources/[resourceId]
Body: { title?, description?, category?, tags?, visibility? }
Response: { success: boolean, data: StudyResource }

// 5. 删除资料
DELETE /api/study-groups/[groupId]/resources/[resourceId]
Response: { success: boolean, message: string }

// 6. 下载资料
GET /api/study-groups/[groupId]/resources/[resourceId]/download
Response: File download or redirect

// 7. 审核资料
POST /api/study-groups/[groupId]/resources/[resourceId]/review
Body: { action: 'approve' | 'reject', reason?: string }
Response: { success: boolean, data: StudyResource }
```

### 4.2 互动接口

```typescript
// 1. 评分
POST /api/study-groups/[groupId]/resources/[resourceId]/rate
Body: { rating: number, review?: string }
Response: { success: boolean, data: ResourceRating }

// 2. 评论
POST /api/study-groups/[groupId]/resources/[resourceId]/comments
Body: { content: string, parentId?: string }
Response: { success: boolean, data: ResourceComment }

// 3. 获取评论列表
GET /api/study-groups/[groupId]/resources/[resourceId]/comments
Query: { page?, pageSize? }
Response: { success: boolean, data: { comments: ResourceComment[], pagination: {...} } }

// 4. 收藏/取消收藏
POST /api/study-groups/[groupId]/resources/[resourceId]/favorite
Body: { folderId?: string }
Response: { success: boolean, data: ResourceFavorite }

DELETE /api/study-groups/[groupId]/resources/[resourceId]/favorite
Response: { success: boolean, message: string }

// 5. 获取我的收藏
GET /api/resources/favorites
Query: { folderId?, page?, pageSize? }
Response: { success: boolean, data: { favorites: ResourceFavorite[], pagination: {...} } }
```

### 4.3 收藏夹管理接口

```typescript
// 1. 创建收藏夹
POST /api/resources/folders
Body: { name: string, description?: string, icon?: string, color?: string }
Response: { success: boolean, data: ResourceFolder }

// 2. 获取收藏夹列表
GET /api/resources/folders
Response: { success: boolean, data: ResourceFolder[] }

// 3. 更新收藏夹
PUT /api/resources/folders/[folderId]
Body: { name?, description?, icon?, color? }
Response: { success: boolean, data: ResourceFolder }

// 4. 删除收藏夹
DELETE /api/resources/folders/[folderId]
Response: { success: boolean, message: string }
```

### 4.4 统计接口

```typescript
// 1. 获取资料统计
GET /api/study-groups/[groupId]/resources/stats
Response: {
  success: boolean,
  data: {
    totalResources: number
    totalDownloads: number
    categoryCounts: { category: string, count: number }[]
    typeCounts: { type: string, count: number }[]
    topResources: StudyResource[]  // 下载最多的资料
    recentUploads: StudyResource[]  // 最新上传
  }
}
```

## 五、前端页面设计

### 5.1 页面结构

```
/study-groups/[id]/resources
  ├── index.vue              # 资料库主页
  ├── [resourceId]/
  │   ├── index.vue          # 资料详情页
  │   └── edit.vue           # 编辑资料页
  └── upload.vue             # 上传资料页
```

### 5.2 组件设计

```
components/study-groups/resources/
  ├── ResourceCard.vue           # 资料卡片
  ├── ResourceList.vue           # 资料列表
  ├── ResourceGrid.vue           # 资料网格视图
  ├── ResourceUploadModal.vue    # 上传弹窗
  ├── ResourcePreview.vue        # 资料预览
  ├── ResourceRating.vue         # 评分组件
  ├── ResourceComments.vue       # 评论区
  ├── ResourceFilters.vue        # 筛选器
  ├── ResourceStats.vue          # 统计面板
  └── FavoriteFolder.vue         # 收藏夹
```

### 5.3 页面功能说明

#### 资料库主页 (`/study-groups/[id]/resources`)

**布局**：
```
┌─────────────────────────────────────────────────┐
│ 📚 学习资料库                     [上传资料]   │
├─────────────────────────────────────────────────┤
│ [搜索框]                                        │
│ 分类: [全部▼] 类型: [全部▼] 排序: [最新▼]   │
├─────────────────┬───────────────────────────────┤
│  分类导航        │   资料卡片网格                │
│  📚 考试真题    │   ┌────┐ ┌────┐ ┌────┐      │
│  📝 学习笔记    │   │    │ │    │ │    │      │
│  📖 教材资料    │   └────┘ └────┘ └────┘      │
│  🎥 视频课程    │   ┌────┐ ┌────┐ ┌────┐      │
│  📄 参考文献    │   │    │ │    │ │    │      │
│  🔗 在线资源    │   └────┘ └────┘ └────┘      │
│  📦 综合资料包  │                               │
├─────────────────┴───────────────────────────────┤
│             [分页导航]                          │
└─────────────────────────────────────────────────┘
```

**功能**：
- 资料列表/网格切换
- 分类筛选
- 标签筛选
- 搜索功能
- 排序功能
- 上传入口
- 统计信息（总资料数、总下载量等）

#### 资料详情页 (`/study-groups/[id]/resources/[resourceId]`)

**布局**：
```
┌─────────────────────────────────────────────────┐
│ [← 返回]                     [编辑] [删除]     │
├─────────────────────────────────────────────────┤
│ 📄 资料标题                                    │
│ 👤 上传者 | 📅 上传时间 | 📁 分类 | 🏷️ 标签 │
│ ⭐ 4.5 (23人评分) | 👁️ 156次浏览 | ⬇️ 89次下载│
├─────────────────────────────────────────────────┤
│                                                 │
│          [资料预览区域]                        │
│          (PDF预览/图片预览/视频播放器)        │
│                                                 │
├─────────────────────────────────────────────────┤
│ 📝 资料描述                                    │
│ 这是一份详细的复习资料...                     │
├─────────────────────────────────────────────────┤
│ [⬇️ 下载] [⭐ 收藏] [💬 评论] [📊 评分]      │
├─────────────────────────────────────────────────┤
│ 💬 评论区 (12条)                               │
│ ┌───────────────────────────────────────────┐ │
│ │ 👤 用户A: 资料很有用！    ⭐⭐⭐⭐⭐      │ │
│ │    2小时前                  [回复]        │ │
│ └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**功能**：
- 资料预览
- 下载按钮
- 评分和评论
- 收藏功能
- 分享功能
- 版本历史
- 相关资料推荐

#### 上传资料页 (`/study-groups/[id]/resources/upload`)

**表单字段**：
```
┌─────────────────────────────────────────────────┐
│ 📤 上传资料                                    │
├─────────────────────────────────────────────────┤
│ 资料类型: ○ 文件上传  ○ 外部链接            │
├─────────────────────────────────────────────────┤
│ 资料标题: [___________________________]        │
├─────────────────────────────────────────────────┤
│ 资料分类: [选择分类 ▼]                        │
├─────────────────────────────────────────────────┤
│ 标签: [tag1] [tag2] [+ 添加]                  │
├─────────────────────────────────────────────────┤
│ 文件上传:                                      │
│ ┌─────────────────────────────────────────┐   │
│ │   拖拽文件到这里或点击上传               │   │
│ │   支持: PDF, Word, PPT, 图片, 视频      │   │
│ │   最大: 100MB                            │   │
│ └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│ 资料描述:                                      │
│ ┌─────────────────────────────────────────┐   │
│ │                                          │   │
│ │                                          │   │
│ └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│ 可见性: ○ 所有成员  ○ 仅管理员              │
├─────────────────────────────────────────────────┤
│           [取消]  [上传资料]                   │
└─────────────────────────────────────────────────┘
```

## 六、技术实现要点

### 6.1 文件上传
- 使用 Nuxt 3 的 `useFileDialog` 或 `<input type="file">`
- 前端文件类型验证和大小限制
- 使用 FormData 上传文件
- 显示上传进度条
- 支持拖拽上传

### 6.2 文件存储
- **开发环境**：存储到本地 `/public/uploads/resources/` 目录
- **生产环境**：推荐使用云存储服务（AWS S3、阿里云OSS等）
- 文件命名：使用 UUID + 原始扩展名
- 生成缩略图（图片和视频）

### 6.3 文件预览
- **PDF**: 使用 `pdf.js` 或 `vue-pdf-embed`
- **图片**: 直接使用 `<img>` 标签 + 灯箱效果
- **视频**: 使用 `<video>` 标签或 `video.js`
- **文档**: 提供下载链接，或集成在线预览服务

### 6.4 安全性
- 文件类型白名单验证
- 文件内容扫描（病毒、恶意代码）
- 权限验证（只有小组成员可访问）
- 防止路径遍历攻击
- 防止刷下载量（IP + 用户ID + 时间间隔）

### 6.5 性能优化
- 资料列表分页加载
- 图片懒加载
- 缩略图生成
- CDN加速
- 浏览器缓存

## 七、开发计划

### Phase 1: 基础功能（第1-2周）
- ✅ 数据库模型设计
- [ ] 创建数据库迁移
- [ ] 实现文件上传API
- [ ] 实现资料CRUD API
- [ ] 创建资料列表页面
- [ ] 创建资料详情页面
- [ ] 创建上传页面

### Phase 2: 互动功能（第3周）
- [ ] 实现评分系统
- [ ] 实现评论功能
- [ ] 实现收藏功能
- [ ] 实现下载统计
- [ ] 创建互动UI组件

### Phase 3: 高级功能（第4周）
- [ ] 实现收藏夹管理
- [ ] 实现文件预览
- [ ] 实现搜索和筛选
- [ ] 实现审核机制
- [ ] 实现版本管理

### Phase 4: 优化和测试（第5周）
- [ ] 性能优化
- [ ] 安全性加固
- [ ] UI/UX优化
- [ ] 功能测试
- [ ] 用户测试

## 八、用户流程示例

### 上传资料流程
```
1. 用户进入小组资料库页面
2. 点击"上传资料"按钮
3. 填写资料信息（标题、分类、标签、描述）
4. 选择文件或输入外部链接
5. 点击"上传"按钮
6. 系统验证文件和权限
7. 如需审核，进入待审核状态
8. 审核通过后，资料对小组成员可见
9. 其他成员可以浏览、下载、评分、评论
```

### 查找和下载资料流程
```
1. 用户进入小组资料库页面
2. 使用分类/标签/搜索筛选资料
3. 浏览资料列表，查看缩略图和基本信息
4. 点击感兴趣的资料卡片
5. 查看资料详情和预览
6. 阅读其他成员的评价
7. 点击"下载"按钮
8. 系统记录下载行为
9. 用户可以评分和评论
10. 可以收藏资料到个人收藏夹
```

## 九、未来扩展方向

1. **协作编辑**：支持在线协作编辑文档
2. **资料打包**：批量下载多个资料
3. **分享链接**：生成资料分享链接（带有效期）
4. **资料推荐**：基于学习偏好推荐资料
5. **AI辅助**：AI自动生成资料摘要和标签
6. **离线下载**：PWA离线访问资料
7. **资料市场**：跨小组资料交易/共享平台
8. **学习路径**：基于资料创建学习路径
9. **知识图谱**：资料之间的关联关系可视化
10. **积分系统**：上传和分享资料获得积分奖励

## 十、技术栈

- **后端**: Nuxt 3 Server API + Prisma ORM
- **前端**: Vue 3 + Nuxt 3 + TailwindCSS
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **文件存储**: 本地存储 (开发) / 云存储 (生产)
- **文件处理**:
  - PDF预览: `vue-pdf-embed`
  - 视频播放: `video.js`
  - 图片处理: `sharp`
- **其他**:
  - 文件上传: `multer` 或 Nuxt 内置
  - 表单验证: `zod` 或 `vee-validate`
  - 图标: `heroicons` 或 `lucide-vue`

---

**文档版本**: v1.0
**创建日期**: 2025-10-24
**最后更新**: 2025-10-24
**作者**: Claude AI Assistant
