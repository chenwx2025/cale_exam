# 多文件资源上传功能实现总结

## 功能概述

实现了学习资料库的多文件上传和管理功能，用户可以：
- 一次性上传多个文件，作为一个资源条目
- 浏览资源中的所有文件
- 选择单个或多个文件进行下载
- 预览支持的文件类型（图片、视频、PDF）

## 数据库架构更新

### 新增 ResourceFile 模型

在 `prisma/schema.prisma` 中添加了 `ResourceFile` 模型来支持一个资源包含多个文件：

```prisma
model ResourceFile {
  id              String   @id @default(cuid())
  resourceId      String
  resource        StudyResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  // 文件信息
  fileName        String              // 原始文件名
  fileUrl         String              // 文件URL
  fileSize        Int                 // 文件大小（字节）
  mimeType        String              // MIME类型
  type            String              // document, image, video, archive, other
  thumbnailUrl    String?             // 缩略图URL

  // 排序和显示
  displayOrder    Int      @default(0) // 显示顺序
  isPrimary       Boolean  @default(false) // 是否为主文件（用于缩略图）

  // 统计
  downloadCount   Int      @default(0) // 单个文件下载次数

  // 时间戳
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([resourceId])
  @@index([type])
  @@index([displayOrder])
}
```

### StudyResource 模型更新

在 `StudyResource` 模型中添加了 `files` 关联：

```prisma
model StudyResource {
  // ... 其他字段
  files           ResourceFile[]                   // 多文件支持
}
```

## 后端 API 更新

### 1. 文件上传 API (`server/api/study-resources.post.ts`)

**主要改动：**
- 支持接收多个文件（同一个 `file` 字段名）
- 将所有文件保存到服务器
- 创建一个 `StudyResource` 记录
- 为每个文件创建对应的 `ResourceFile` 记录

**关键代码片段：**
```typescript
// 收集所有文件
const files: Array<{ data: any; filename: string; mimeType: string }> = []

for (const part of formData) {
  if (part.name === 'file') {
    files.push({
      data: part.data,
      filename: part.filename || 'unnamed',
      mimeType: part.type || 'application/octet-stream'
    })
  }
}

// 保存所有文件并创建 ResourceFile 记录
const savedFiles = []
for (let i = 0; i < files.length; i++) {
  const file = files[i]
  // ... 保存文件逻辑
  savedFiles.push({
    fileName: file.filename,
    fileUrl,
    fileSize,
    mimeType: file.mimeType,
    type: fileType,
    displayOrder: i,
    isPrimary: i === 0
  })
}

// 创建资料记录，包含关联的文件
const resource = await prisma.studyResource.create({
  data: {
    // ... 其他字段
    files: {
      create: savedFiles
    }
  },
  include: {
    uploader: true,
    files: true,
    _count: { select: { files: true } }
  }
})
```

### 2. 资料列表 API (`server/api/study-resources.get.ts`)

**更新：**
- 在查询时包含 `files` 关联数据
- 添加 `files` 计数到 `_count`

```typescript
include: {
  uploader: { ... },
  files: {
    orderBy: { displayOrder: 'asc' }
  },
  _count: {
    select: {
      ratings: true,
      comments: true,
      downloads: true,
      favorites: true,
      files: true  // 新增
    }
  }
}
```

### 3. 资料详情 API (`server/api/study-resource-detail.get.ts`)

**更新：**
- 同样包含 `files` 关联数据和计数

## 前端组件更新

### 1. ResourceUploadModal 组件 (`components/ResourceUploadModal.vue`)

**更新内容：**

#### Template 部分：
- 添加 `multiple` 属性到文件输入框
- 显示已选择的文件列表
- 每个文件有独立的移除按钮
- 显示文件总数和总大小

```vue
<input type="file" multiple @change="handleFileSelect" />

<!-- 文件列表 -->
<div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
  <div v-for="(file, index) in selectedFiles" :key="index">
    <p>{{ file.name }}</p>
    <p>{{ formatFileSize(file.size) }}</p>
    <button @click="removeFile(index)">移除</button>
  </div>
</div>
```

#### Script 部分：
- 将 `selectedFile` 改为 `selectedFiles` 数组
- 添加 `totalFileSize` 计算属性
- 实现 `removeFile(index)` 方法
- 更新上传逻辑：一次性发送所有文件

```javascript
const selectedFiles = ref([])

const totalFileSize = computed(() => {
  return selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
})

const handleUpload = async () => {
  const formDataToSend = new FormData()

  // 添加所有文件
  selectedFiles.value.forEach(file => {
    formDataToSend.append('file', file)
  })

  // 添加其他字段
  formDataToSend.append('groupId', props.groupId)
  formDataToSend.append('title', formData.value.title)
  // ...

  const result = await $fetch(`/api/study-resources`, {
    method: 'POST',
    headers: authStore.getAuthHeader(),
    body: formDataToSend
  })
}
```

### 2. 资源详情页面 (`pages/study-groups/[id]/resources/[resourceId].vue`)

**新增功能：**

#### 1. 文件列表显示
```vue
<div v-if="resource.files && resource.files.length > 0">
  <h3>包含文件 ({{ resource.files.length }})</h3>

  <!-- 全选和批量下载按钮 -->
  <button @click="toggleSelectAll">
    {{ selectedFileIds.length === resource.files.length ? '取消全选' : '全选' }}
  </button>
  <button @click="downloadSelected">
    下载选中 ({{ selectedFileIds.length }})
  </button>

  <!-- 文件列表 -->
  <div v-for="file in resource.files" :key="file.id">
    <!-- 复选框 -->
    <input type="checkbox" :checked="selectedFileIds.includes(file.id)"
           @click="toggleFileSelection(file.id)" />

    <!-- 文件图标 -->
    <svg>...</svg>

    <!-- 文件信息 -->
    <p>{{ file.fileName }}</p>
    <p>{{ formatFileSize(file.fileSize) }}</p>
    <span v-if="file.isPrimary">主文件</span>

    <!-- 操作按钮 -->
    <button @click="downloadSingleFile(file)">下载</button>
    <button v-if="canPreview(file)" @click="previewFile(file)">预览</button>
  </div>
</div>
```

#### 2. Script 部分新增功能

```javascript
// 状态管理
const selectedFileIds = ref([])
const downloadingFiles = ref(false)
const currentPreviewFile = ref(null)

// 切换文件选择
const toggleFileSelection = (fileId) => {
  const index = selectedFileIds.value.indexOf(fileId)
  if (index > -1) {
    selectedFileIds.value.splice(index, 1)
  } else {
    selectedFileIds.value.push(fileId)
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedFileIds.value.length === resource.value.files.length) {
    selectedFileIds.value = []
  } else {
    selectedFileIds.value = resource.value.files.map(f => f.id)
  }
}

// 下载单个文件
const downloadSingleFile = (file) => {
  window.open(file.fileUrl, '_blank')
}

// 批量下载选中文件
const downloadSelected = async () => {
  const selectedFiles = resource.value.files.filter(f =>
    selectedFileIds.value.includes(f.id)
  )

  for (const file of selectedFiles) {
    window.open(file.fileUrl, '_blank')
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  alert(`已开始下载 ${selectedFiles.length} 个文件`)
}

// 预览文件
const previewFile = (file) => {
  currentPreviewFile.value = file
  // 滚动到预览区域
}

// 获取文件类型标签
const getFileTypeLabel = (type) => {
  const labels = {
    'image': '图片',
    'video': '视频',
    'document': '文档',
    'archive': '压缩包',
    'other': '其他'
  }
  return labels[type] || '未知'
}
```

## 功能特点

### 1. 灵活的文件管理
- 支持上传 1-多个文件
- 每个文件独立存储，有自己的元数据
- 第一个文件自动标记为主文件（`isPrimary`）
- 按 `displayOrder` 排序显示

### 2. 多种下载方式
- **单个文件下载**：点击文件旁边的下载按钮
- **批量下载**：选中多个文件后批量下载
- **全选下载**：一键选择所有文件

### 3. 文件预览
- 图片、视频、PDF 文件支持在线预览
- 预览按钮仅对支持的文件类型显示
- 点击预览按钮会滚动到预览区域

### 4. 用户友好的界面
- 文件类型图标（图片、视频、文档、压缩包）
- 文件大小格式化显示
- 主文件标记
- 复选框选择状态可视化
- 选中文件数量实时显示

## 兼容性考虑

### 向后兼容
为了保持向后兼容，`StudyResource` 模型仍保留原有的单文件字段：
- `fileUrl`: 使用第一个文件的 URL
- `fileName`: 使用第一个文件的名称
- `fileSize`: 使用所有文件的总大小
- `mimeType`: 使用第一个文件的 MIME 类型

这样旧代码仍可正常工作，新功能通过 `files` 关联访问所有文件。

## 使用示例

### 上传多个文件

1. 用户在资料库页面点击"上传资料"
2. 在上传模态框中选择"文件上传"
3. 点击文件选择按钮，一次性选择多个文件
4. 填写资料标题、描述等信息（这些信息应用于整个资源）
5. 点击"上传"按钮
6. 系统创建一个资源记录，包含所有选中的文件

### 浏览和下载文件

1. 用户进入资源详情页面
2. 看到"包含文件 (N)"部分，显示所有文件列表
3. 可以：
   - 点击单个文件的下载按钮直接下载
   - 勾选多个文件，点击"下载选中"批量下载
   - 点击"全选"按钮选择所有文件
   - 对支持预览的文件（图片、视频、PDF）点击预览按钮查看

## 技术要点

1. **FormData 多文件上传**：使用同一个字段名多次 append 文件
2. **Prisma 嵌套创建**：在创建资源时同时创建关联的文件记录
3. **数组状态管理**：使用 ref 数组管理文件选择状态
4. **异步批量下载**：使用延迟避免浏览器阻止多窗口打开
5. **响应式计算**：computed 属性计算总大小、选择状态等

## 未来优化建议

1. **压缩打包下载**：批量下载时生成 ZIP 文件
2. **拖拽排序**：允许用户调整文件显示顺序
3. **进度显示**：上传多个大文件时显示总进度
4. **缩略图生成**：为图片和视频自动生成缩略图
5. **文件替换**：允许替换资源中的某个文件
6. **版本管理**：文件修改时保留历史版本
