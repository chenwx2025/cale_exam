<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">上传资料</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Upload Type -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">上传类型</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="uploadType = 'file'"
              :class="[
                'p-4 border-2 rounded-lg transition-all',
                uploadType === 'file'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
              </svg>
              <div class="font-medium">上传文件</div>
            </button>
            <button
              @click="uploadType = 'link'"
              :class="[
                'p-4 border-2 rounded-lg transition-all',
                uploadType === 'link'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
              </svg>
              <div class="font-medium">添加链接</div>
            </button>
          </div>
        </div>

        <!-- File Upload -->
        <div v-if="uploadType === 'file'" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">选择文件 * (支持多选)</label>
          <div
            @click="$refs.fileInput.click()"
            @dragover.prevent
            @drop.prevent="handleDrop"
            :class="[
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
              selectedFiles.length > 0
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
            ]"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              class="hidden"
              @change="handleFileSelect"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.zip,.rar,.7z"
            />
            <div v-if="selectedFiles.length > 0">
              <svg class="w-16 h-16 mx-auto mb-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <p class="font-medium text-gray-900 mb-1">已选择 {{ selectedFiles.length }} 个文件</p>
              <p class="text-sm text-gray-500">总大小: {{ formatFileSize(totalFileSize) }}</p>
              <button
                @click.stop="selectedFiles = []"
                class="mt-3 text-sm text-red-600 hover:text-red-700"
              >
                移除文件
              </button>
            </div>
            <div v-else>
              <svg class="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <p class="text-gray-700 mb-1">点击或拖拽文件到此处</p>
              <p class="text-sm text-gray-500">支持 PDF, Word, Excel, PPT, 图片, 视频, 压缩包 (最大100MB)</p>
            </div>
          </div>

          <!-- File List -->
          <div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <svg class="w-8 h-8 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ file.name }}</p>
                  <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                @click="removeFile(index)"
                class="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Link Input -->
        <div v-if="uploadType === 'link'" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">外部链接 *</label>
          <input
            v-model="formData.externalUrl"
            type="url"
            placeholder="https://example.com/resource"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <!-- Title -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">资料标题 *</label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="输入资料标题"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">资料描述</label>
          <textarea
            v-model="formData.description"
            rows="3"
            placeholder="简单描述这个资料的内容和用途"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <!-- Category -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">资料分类</label>
          <select
            v-model="formData.category"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="textbook">教材</option>
            <option value="note">笔记</option>
            <option value="practice">练习题</option>
            <option value="video">视频教程</option>
            <option value="reference">参考资料</option>
            <option value="other">其他</option>
          </select>
        </div>

        <!-- Tags -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">标签 (逗号分隔)</label>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="如: 中医基础, 针灸, 方剂"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="(tag, index) in formData.tags"
              :key="index"
              class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Visibility -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">可见性</label>
          <select
            v-model="formData.visibility"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="members">所有成员可见</option>
            <option value="admins">仅管理员可见</option>
          </select>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          取消
        </button>
        <button
          @click="handleUpload"
          :disabled="!canUpload || uploading"
          class="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {{ uploading ? '上传中...' : '确认上传' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  groupId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'uploaded'])

const authStore = useAuthStore()

const uploadType = ref('file')
const selectedFiles = ref([])
const uploading = ref(false)
const tagsInput = ref('')

const formData = ref({
  title: '',
  description: '',
  category: 'other',
  tags: [],
  externalUrl: '',
  visibility: 'members'
})

// Total file size
const totalFileSize = computed(() => {
  return selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
})

// Can upload
const canUpload = computed(() => {
  if (uploadType.value === 'file') {
    return selectedFiles.value.length > 0 && formData.value.title
  } else {
    return formData.value.externalUrl && formData.value.title
  }
})

// Watch tags input
watch(tagsInput, (value) => {
  if (value) {
    formData.value.tags = value.split(',').map(tag => tag.trim()).filter(tag => tag)
  } else {
    formData.value.tags = []
  }
})

// Handle file select
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)

  for (const file of files) {
    if (file.size > 100 * 1024 * 1024) {
      alert(`文件 ${file.name} 大小超过100MB，已跳过`)
      continue
    }
    selectedFiles.value.push(file)
  }

  // Auto-fill title with first file name if empty
  if (selectedFiles.value.length > 0 && !formData.value.title) {
    formData.value.title = selectedFiles.value[0].name
  }
}

// Remove individual file
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

// Handle drop
const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)

  for (const file of files) {
    if (file.size > 100 * 1024 * 1024) {
      alert(`文件 ${file.name} 大小超过100MB，已跳过`)
      continue
    }
    selectedFiles.value.push(file)
  }

  // Auto-fill title with first file name if empty
  if (selectedFiles.value.length > 0 && !formData.value.title) {
    formData.value.title = selectedFiles.value[0].name
  }
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Handle upload
const handleUpload = async () => {
  if (!canUpload.value) return

  uploading.value = true
  try {
    if (uploadType.value === 'file') {
      // Upload all files as one resource
      const formDataToSend = new FormData()

      // Append all files with the same field name 'file'
      selectedFiles.value.forEach(file => {
        formDataToSend.append('file', file)
      })

      // Append other fields
      formDataToSend.append('groupId', props.groupId)
      formDataToSend.append('title', formData.value.title)
      formDataToSend.append('description', formData.value.description)
      formDataToSend.append('category', formData.value.category)
      formDataToSend.append('tags', JSON.stringify(formData.value.tags))
      formDataToSend.append('visibility', formData.value.visibility)

      console.log(`[ResourceUpload] 上传资源，包含 ${selectedFiles.value.length} 个文件`)
      const result = await $fetch(`/api/study-resources`, {
        method: 'POST',
        headers: authStore.getAuthHeader(),
        body: formDataToSend
      })

      if (result.success) {
        alert(result.message || '资料上传成功！')
        emit('uploaded', result.data)
      }
    } else {
      // Upload link
      console.log('[ResourceUpload] 使用扁平路由 API 添加链接')
      const result = await $fetch(`/api/study-resources`, {
        method: 'POST',
        headers: authStore.getAuthHeader(),
        body: {
          groupId: props.groupId,
          title: formData.value.title,
          description: formData.value.description,
          category: formData.value.category,
          tags: formData.value.tags,
          externalUrl: formData.value.externalUrl,
          visibility: formData.value.visibility
        }
      })

      if (result.success) {
        alert('链接添加成功！')
        emit('uploaded', result.data)
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    alert(error.data?.message || '上传失败')
  } finally {
    uploading.value = false
  }
}
</script>
