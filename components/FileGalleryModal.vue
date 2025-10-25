<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
        @click.self="close"
      >
        <!-- Gallery Container -->
        <div class="relative w-full h-full max-w-7xl mx-auto flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4 text-white">
            <div class="flex items-center gap-4">
              <h3 class="text-xl font-semibold">{{ currentFile?.fileName }}</h3>
              <span class="text-sm text-gray-300">
                {{ currentIndex + 1 }} / {{ files.length }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <!-- Download Button -->
              <button
                @click="downloadCurrent"
                class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="下载当前文件"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
              <!-- Close Button -->
              <button
                @click="close"
                class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="关闭"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="flex-1 flex items-center justify-center relative overflow-hidden">
            <!-- Previous Button -->
            <button
              v-if="files.length > 1"
              @click="previous"
              class="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110"
              :disabled="currentIndex === 0"
              :class="{ 'opacity-50 cursor-not-allowed': currentIndex === 0 }"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <!-- File Display -->
            <div class="w-full h-full flex items-center justify-center">
              <!-- Image -->
              <img
                v-if="currentFile?.type === 'image'"
                :src="currentFile.fileUrl"
                :alt="currentFile.fileName"
                class="max-w-full max-h-full object-contain"
              />

              <!-- Video -->
              <video
                v-else-if="currentFile?.type === 'video'"
                :src="currentFile.fileUrl"
                controls
                class="max-w-full max-h-full"
                :key="currentFile.id"
              >
                您的浏览器不支持视频播放。
              </video>

              <!-- PDF -->
              <iframe
                v-else-if="currentFile?.mimeType === 'application/pdf'"
                :src="currentFile.fileUrl"
                class="w-full h-full bg-white"
                frameborder="0"
              >
                您的浏览器不支持 PDF 预览。
              </iframe>

              <!-- Text File -->
              <div
                v-else-if="currentFile?.mimeType === 'text/plain'"
                class="w-full h-full overflow-auto bg-white rounded-lg p-8"
              >
                <pre class="whitespace-pre-wrap font-mono text-sm text-gray-800">{{ textContent }}</pre>
              </div>

              <!-- Unsupported File -->
              <div v-else class="text-center text-white">
                <svg class="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                </svg>
                <p class="text-xl mb-2">无法预览此文件</p>
                <p class="text-gray-400 mb-4">{{ currentFile?.fileName }}</p>
                <button
                  @click="downloadCurrent"
                  class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  下载文件
                </button>
              </div>
            </div>

            <!-- Next Button -->
            <button
              v-if="files.length > 1"
              @click="next"
              class="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110"
              :disabled="currentIndex === files.length - 1"
              :class="{ 'opacity-50 cursor-not-allowed': currentIndex === files.length - 1 }"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- File Info Bar -->
          <div class="mt-4 bg-black/50 rounded-lg p-4 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <span class="text-sm">
                  类型: <span class="font-medium">{{ getFileTypeLabel(currentFile?.type) }}</span>
                </span>
                <span class="text-sm">
                  大小: <span class="font-medium">{{ formatFileSize(currentFile?.fileSize) }}</span>
                </span>
                <span v-if="currentFile?.isPrimary" class="text-xs px-2 py-1 bg-blue-500 rounded-full">
                  主文件
                </span>
              </div>
              <!-- File Type Filter (optional) -->
              <div class="flex items-center gap-2">
                <button
                  v-for="type in availableTypes"
                  :key="type"
                  @click="filterByType(type)"
                  class="px-3 py-1 text-xs rounded-full transition-colors"
                  :class="currentFilter === type
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'"
                >
                  {{ getFileTypeLabel(type) }}
                </button>
                <button
                  v-if="currentFilter"
                  @click="clearFilter"
                  class="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full"
                >
                  全部
                </button>
              </div>
            </div>
          </div>

          <!-- Thumbnail Strip -->
          <div v-if="files.length > 1" class="mt-4 overflow-x-auto">
            <div class="flex gap-2 pb-2">
              <button
                v-for="(file, index) in displayedFiles"
                :key="file.id"
                @click="goToFile(index)"
                :class="[
                  'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                  currentIndex === index
                    ? 'border-orange-500 ring-2 ring-orange-500/50'
                    : 'border-white/20 hover:border-white/50'
                ]"
              >
                <!-- Image Thumbnail -->
                <img
                  v-if="file.type === 'image'"
                  :src="file.fileUrl"
                  :alt="file.fileName"
                  class="w-full h-full object-cover"
                />
                <!-- Video Thumbnail -->
                <div
                  v-else-if="file.type === 'video'"
                  class="w-full h-full bg-purple-500/20 flex items-center justify-center"
                >
                  <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                  </svg>
                </div>
                <!-- Document Thumbnail -->
                <div
                  v-else
                  class="w-full h-full bg-blue-500/20 flex items-center justify-center"
                >
                  <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
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
})

const emit = defineEmits(['close', 'download'])

const currentIndex = ref(props.initialIndex)
const textContent = ref('')
const currentFilter = ref(null)

// Current file
const currentFile = computed(() => {
  return displayedFiles.value[currentIndex.value]
})

// Filter files by type
const displayedFiles = computed(() => {
  if (!currentFilter.value) {
    return props.files
  }
  return props.files.filter(f => f.type === currentFilter.value)
})

// Available file types
const availableTypes = computed(() => {
  const types = new Set(props.files.map(f => f.type))
  return Array.from(types).filter(t => t !== 'other')
})

// Watch for file changes to load text content
watch(currentFile, async (newFile) => {
  if (newFile?.mimeType === 'text/plain' && newFile.fileUrl) {
    await loadTextContent(newFile.fileUrl)
  }
}, { immediate: true })

// Watch for initial index changes
watch(() => props.initialIndex, (newIndex) => {
  currentIndex.value = newIndex
})

// Watch for open state changes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Reset index when opening
    currentIndex.value = props.initialIndex
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  } else {
    // Restore body scroll
    document.body.style.overflow = ''
  }
})

// Navigation
const next = () => {
  if (currentIndex.value < displayedFiles.value.length - 1) {
    currentIndex.value++
  }
}

const previous = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const goToFile = (index) => {
  currentIndex.value = index
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (!props.isOpen) return

  if (e.key === 'ArrowRight') {
    next()
  } else if (e.key === 'ArrowLeft') {
    previous()
  } else if (e.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

// Actions
const close = () => {
  emit('close')
}

const downloadCurrent = () => {
  if (currentFile.value) {
    window.open(currentFile.value.fileUrl, '_blank')
    emit('download', currentFile.value)
  }
}

const filterByType = (type) => {
  currentFilter.value = type
  currentIndex.value = 0 // Reset to first file of filtered type
}

const clearFilter = () => {
  currentFilter.value = null
  currentIndex.value = 0
}

// Load text content
const loadTextContent = async (url) => {
  try {
    const response = await fetch(url)
    textContent.value = await response.text()
  } catch (error) {
    console.error('加载文本内容失败:', error)
    textContent.value = '无法加载文本内容'
  }
}

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Get file type label
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
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Custom scrollbar for thumbnail strip */
::-webkit-scrollbar {
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
