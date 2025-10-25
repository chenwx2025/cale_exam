# 文件走马灯浏览功能实现总结

## 功能概述

在多文件资源功能基础上，新增了文件走马灯（Gallery）浏览功能，让用户可以在一个统一的界面中浏览资源的所有文件，支持：
- 左右导航切换文件
- 键盘快捷键控制
- 缩略图快速跳转
- 文件类型过滤
- 在线预览（图片、视频、PDF、文本）
- 直接下载当前文件

## 组件实现

### FileGalleryModal 组件 (`components/FileGalleryModal.vue`)

这是一个全屏模态框组件，提供沉浸式的文件浏览体验。

#### 主要特性：

1. **全屏黑色背景**
   - 半透明黑色背景（90% 不透明度）
   - 点击背景关闭模态框
   - 防止页面滚动

2. **文件预览**
   - **图片**：max-width/max-height 自适应显示
   - **视频**：HTML5 video 播放器，支持控制
   - **PDF**：iframe 嵌入显示
   - **文本文件**：格式化显示，带滚动条
   - **不支持的文件**：显示文件信息和下载按钮

3. **导航控制**
   - **左右箭头按钮**：切换上一个/下一个文件
   - **键盘快捷键**：
     - `←` 左箭头：上一个文件
     - `→` 右箭头：下一个文件
     - `Esc`：关闭走马灯
   - **缩略图条**：底部显示所有文件的缩略图，点击跳转

4. **文件信息栏**
   - 当前文件名
   - 文件序号（如 "2 / 5"）
   - 文件类型和大小
   - 主文件标记

5. **文件类型过滤**
   - 按文件类型筛选（图片、视频、文档等）
   - 点击类型按钮显示该类型的所有文件
   - 清除过滤显示所有文件

6. **操作按钮**
   - **下载按钮**：下载当前文件
   - **关闭按钮**：关闭走马灯

#### 组件 Props：

```typescript
props: {
  files: {
    type: Array,
    required: true,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  },
  isOpen: {
    type: Boolean,
    default: false
  }
}
```

#### 组件 Emits：

```typescript
emit('close')           // 关闭走马灯
emit('download', file)  // 下载文件
```

## 集成到资源详情页

### 页面更新 (`pages/study-groups/[id]/resources/[resourceId].vue`)

#### 1. 添加走马灯组件

```vue
<template>
  <div>
    <!-- 资源详情内容 -->

    <!-- File Gallery Modal -->
    <FileGalleryModal
      v-if="resource?.files && resource.files.length > 0"
      :files="resource.files"
      :initial-index="galleryInitialIndex"
      :is-open="isGalleryOpen"
      @close="closeGallery"
      @download="handleGalleryDownload"
    />
  </div>
</template>
```

#### 2. 添加状态管理

```javascript
// Gallery modal
const isGalleryOpen = ref(false)
const galleryInitialIndex = ref(0)
```

#### 3. 打开走马灯的方式

**方式一：点击预览按钮**
```javascript
const previewFile = (file) => {
  const index = resource.value.files.findIndex(f => f.id === file.id)
  if (index !== -1) {
    galleryInitialIndex.value = index
    isGalleryOpen.value = true
  }
}
```

**方式二：双击文件卡片**
```vue
<div
  v-for="(file, index) in resource.files"
  @click="toggleFileSelection(file.id)"
  @dblclick="openGallery(index)"
>
  <!-- 文件内容 -->
</div>
```

**方式三：直接调用 openGallery**
```javascript
const openGallery = (index = 0) => {
  galleryInitialIndex.value = index
  isGalleryOpen.value = true
}
```

#### 4. 处理走马灯事件

```javascript
// 关闭走马灯
const closeGallery = () => {
  isGalleryOpen.value = false
}

// 从走马灯下载文件
const handleGalleryDownload = (file) => {
  console.log('从走马灯下载文件:', file.fileName)
  // 记录下载统计
  $fetch(`/api/study-resource-download`, {
    method: 'POST',
    headers: authStore.getAuthHeader(),
    body: { groupId, resourceId, fileId: file.id }
  })
}
```

## 用户体验设计

### 交互流程

1. **进入资源详情页**
   - 看到"包含文件 (N)"部分
   - 提示：单击选择文件，双击或点击预览按钮查看走马灯

2. **打开走马灯**
   - 双击任意文件卡片
   - 或点击文件右侧的预览按钮（仅限图片/视频/PDF）
   - 走马灯全屏显示，从选中的文件开始

3. **浏览文件**
   - 点击左右箭头切换文件
   - 使用键盘方向键快速切换
   - 点击底部缩略图跳转到特定文件
   - 按类型过滤文件

4. **下载文件**
   - 点击右上角下载按钮下载当前文件
   - 或点击 Esc 关闭走马灯，在文件列表中批量下载

5. **关闭走马灯**
   - 点击右上角关闭按钮
   - 按 Esc 键
   - 点击背景区域

### 视觉设计

#### 颜色方案
- **背景**：黑色，90% 不透明度
- **文字**：白色（高对比度）
- **按钮悬停**：白色 10% 不透明度
- **当前选中**：橙色边框和光晕
- **文件类型标签**：蓝色（主文件）、橙色（选中类型）

#### 布局结构
```
┌─────────────────────────────────────────────┐
│ 文件名                      下载 [X] 关闭   │ ← 顶部栏
├─────────────────────────────────────────────┤
│                                             │
│  [←]         文件预览区域           [→]    │ ← 主内容区
│                                             │
├─────────────────────────────────────────────┤
│ 类型 | 大小 | 主文件        类型过滤按钮   │ ← 信息栏
├─────────────────────────────────────────────┤
│ [缩略图1] [缩略图2] [缩略图3] ...         │ ← 缩略图条
└─────────────────────────────────────────────┘
```

#### 动画效果
- **打开/关闭**：0.3s 淡入淡出
- **按钮悬停**：scale(1.1) 放大效果
- **箭头按钮**：disabled 时半透明

## 技术实现细节

### 1. Teleport 到 body

使用 Vue 3 的 `<Teleport>` 将模态框渲染到 `<body>` 标签下，避免 z-index 层级问题：

```vue
<Teleport to="body">
  <div class="fixed inset-0 z-50">
    <!-- 走马灯内容 -->
  </div>
</Teleport>
```

### 2. 防止页面滚动

打开走马灯时禁用页面滚动，关闭时恢复：

```javascript
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 清理
onUnmounted(() => {
  document.body.style.overflow = ''
})
```

### 3. 键盘事件监听

```javascript
const handleKeydown = (e) => {
  if (!props.isOpen) return

  if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') previous()
  else if (e.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
```

### 4. 响应式文件列表

支持类型过滤的文件列表：

```javascript
const displayedFiles = computed(() => {
  if (!currentFilter.value) {
    return props.files
  }
  return props.files.filter(f => f.type === currentFilter.value)
})

const currentFile = computed(() => {
  return displayedFiles.value[currentIndex.value]
})
```

### 5. 文本文件加载

对于文本文件，动态加载内容：

```javascript
watch(currentFile, async (newFile) => {
  if (newFile?.mimeType === 'text/plain' && newFile.fileUrl) {
    await loadTextContent(newFile.fileUrl)
  }
}, { immediate: true })

const loadTextContent = async (url) => {
  try {
    const response = await fetch(url)
    textContent.value = await response.text()
  } catch (error) {
    textContent.value = '无法加载文本内容'
  }
}
```

### 6. 缩略图生成

不同文件类型显示不同的缩略图：

```vue
<!-- 图片缩略图 -->
<img v-if="file.type === 'image'" :src="file.fileUrl" />

<!-- 视频图标 -->
<div v-else-if="file.type === 'video'" class="bg-purple-500/20">
  <svg>播放图标</svg>
</div>

<!-- 文档图标 -->
<div v-else class="bg-blue-500/20">
  <svg>文件图标</svg>
</div>
```

## 功能优势

### 1. 提升浏览体验
- **沉浸式全屏**：专注于内容，无干扰
- **快速切换**：左右箭头或键盘即可切换文件
- **缩略图导航**：一目了然，快速跳转

### 2. 减少操作步骤
- **无需逐个打开**：一次打开，浏览所有文件
- **无需关闭再打开**：在走马灯内连续浏览
- **类型过滤**：快速定位特定类型文件

### 3. 支持多种格式
- **图片**：完整显示，保持比例
- **视频**：内置播放控制
- **PDF**：直接预览，无需下载
- **文本**：格式化显示，可滚动

### 4. 响应式设计
- **自适应大小**：max-w-7xl 最大宽度
- **移动端友好**：触摸滑动切换（未来扩展）
- **高 DPI 支持**：图片清晰显示

## 性能优化

### 1. 懒加载文本内容
只在切换到文本文件时才加载内容，避免不必要的网络请求。

### 2. Key 属性优化
视频元素使用 `:key="currentFile.id"` 确保切换时重新加载，避免缓存问题。

### 3. Computed 缓存
使用 `computed` 缓存计算结果，避免重复计算。

### 4. 事件委托
键盘事件监听在组件级别，不是每个文件单独监听。

## 未来扩展建议

1. **触摸手势**
   - 左右滑动切换文件
   - 双指捏合缩放图片

2. **图片增强**
   - 放大镜功能
   - 旋转和翻转
   - 图片对比（并排显示两张图片）

3. **视频增强**
   - 播放列表
   - 连续播放下一个视频
   - 倍速播放

4. **PDF 增强**
   - 页码导航
   - 搜索功能
   - 批注（需要后端支持）

5. **分享功能**
   - 生成当前文件的分享链接
   - 复制文件到剪贴板

6. **幻灯片模式**
   - 自动播放
   - 可配置间隔时间
   - 适合图片展示

7. **全屏模式**
   - 隐藏所有控制栏
   - 只保留文件预览
   - 按键或手势显示/隐藏控制栏

## 使用示例

### 基本用法

```vue
<template>
  <FileGalleryModal
    :files="allFiles"
    :initial-index="0"
    :is-open="showGallery"
    @close="showGallery = false"
    @download="handleDownload"
  />
</template>

<script setup>
const allFiles = ref([
  {
    id: '1',
    fileName: 'image1.jpg',
    fileUrl: '/uploads/image1.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    type: 'image',
    isPrimary: true
  },
  // ... 更多文件
])

const showGallery = ref(false)

const handleDownload = (file) => {
  console.log('下载:', file.fileName)
}
</script>
```

### 从特定文件开始

```javascript
// 从第3个文件开始浏览
const openFromIndex = (index) => {
  galleryInitialIndex.value = index
  isGalleryOpen.value = true
}

// 从特定文件ID开始
const openFromFile = (fileId) => {
  const index = files.value.findIndex(f => f.id === fileId)
  if (index !== -1) {
    openFromIndex(index)
  }
}
```

## 兼容性

- **浏览器要求**：现代浏览器（支持 ES6、Teleport、CSS Grid）
- **Vue 版本**：Vue 3.x
- **文件格式支持**：
  - ✅ 图片：JPG, PNG, GIF, WebP
  - ✅ 视频：MP4, WebM
  - ✅ PDF：浏览器原生支持
  - ✅ 文本：TXT, MD, JSON, CSV 等
  - ❌ Office 文档（需要转换或第三方库）

## 总结

文件走马灯功能极大地提升了多文件资源的浏览体验，让用户可以高效地浏览、比较和下载文件。结合多文件上传功能，完整实现了从上传到浏览的闭环。
