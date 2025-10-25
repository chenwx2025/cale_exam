<template>
  <div class="personal-note-editor bg-white rounded-2xl shadow-lg p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      {{ mode === 'create' ? '创建新笔记' : '编辑笔记' }}
    </h2>

    <!-- Loading State (for edit mode) -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">加载笔记中...</p>
    </div>

    <!-- Editor Form -->
    <div v-else class="space-y-6">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          标题 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="noteData.title"
          type="text"
          maxlength="100"
          placeholder="输入笔记标题..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
        <div class="mt-1 text-sm text-gray-500 text-right">
          {{ noteData.title.length }}/100
        </div>
      </div>

      <!-- Summary -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          摘要
        </label>
        <textarea
          v-model="noteData.summary"
          rows="2"
          maxlength="200"
          placeholder="简要描述笔记内容..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        ></textarea>
        <div class="mt-1 text-sm text-gray-500 text-right">
          {{ (noteData.summary || '').length }}/200
        </div>
      </div>

      <!-- Category and Exam Type -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            分类
          </label>
          <select
            v-model="noteData.category"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">未分类</option>
            <option value="考点总结">📚 考点总结</option>
            <option value="错题整理">📋 错题整理</option>
            <option value="学习心得">💡 学习心得</option>
            <option value="知识脉络">🗺️ 知识脉络</option>
            <option value="记忆口诀">🎵 记忆口诀</option>
            <option value="临床案例">🏥 临床案例</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            考试类型
          </label>
          <select
            v-model="noteData.examType"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">不指定</option>
            <option value="cale">CALE</option>
            <option value="nccaom">NCCAOM</option>
          </select>
        </div>
      </div>

      <!-- Cover Image URL -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          封面图片URL
        </label>
        <input
          v-model="noteData.coverImage"
          type="url"
          placeholder="https://example.com/image.jpg"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          标签 (用逗号分隔)
        </label>
        <input
          v-model="tagsInput"
          type="text"
          placeholder="例如: 针灸, 经络, 穴位"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div v-if="noteData.tags.length > 0" class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="(tag, index) in noteData.tags"
            :key="index"
            class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          笔记内容 <span class="text-red-500">*</span>
        </label>
        <MarkdownEditor v-model="noteData.content" :rows="15" />
      </div>

      <!-- Advanced Options (Collapsible) -->
      <div class="border-t border-gray-200 pt-6">
        <button
          @click="showAdvanced = !showAdvanced"
          class="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          <svg
            class="w-5 h-5 transition-transform"
            :class="{ 'rotate-90': showAdvanced }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          高级选项
        </button>

        <div v-if="showAdvanced" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              关联章节
            </label>
            <input
              v-model="noteData.relatedChapter"
              type="text"
              placeholder="例如: 第3章 经络腧穴"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="noteData.isPinned"
                type="checkbox"
                class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">📌 置顶笔记</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="noteData.isFavorite"
                type="checkbox"
                class="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
              />
              <span class="text-sm font-medium text-gray-700">⭐ 收藏笔记</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          @click="$emit('cancel')"
          class="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          取消
        </button>
        <button
          @click="handleSaveDraft"
          :disabled="!isValid || saving"
          class="px-6 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? '保存中...' : '保存草稿' }}
        </button>
        <button
          @click="handlePublish"
          :disabled="!isValid || saving"
          class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? '发布中...' : '发布笔记' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'create', // create | edit
    validator: (value) => ['create', 'edit'].includes(value)
  },
  noteId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['saved', 'cancel'])

const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const showAdvanced = ref(false)
const tagsInput = ref('')

const noteData = ref({
  title: '',
  content: '',
  summary: '',
  coverImage: '',
  category: '',
  examType: '',
  tags: [],
  relatedChapter: '',
  relatedKnowledge: [],
  isPinned: false,
  isFavorite: false,
  status: 'draft'
})

// Validation
const isValid = computed(() => {
  return noteData.value.title.trim() && noteData.value.content.trim()
})

// Watch tags input
watch(tagsInput, (newVal) => {
  if (newVal) {
    noteData.value.tags = newVal.split(',').map(t => t.trim()).filter(t => t)
  } else {
    noteData.value.tags = []
  }
})

// Load existing note for edit mode
const loadNote = async () => {
  if (props.mode === 'edit' && props.noteId) {
    loading.value = true
    try {
      const result = await $fetch(`/api/personal-notes/${props.noteId}`, {
        headers: authStore.getAuthHeader()
      })

      if (result.success) {
        const note = result.data
        noteData.value = {
          title: note.title,
          content: note.content,
          summary: note.summary || '',
          coverImage: note.coverImage || '',
          category: note.category || '',
          examType: note.examType || '',
          tags: note.tags || [],
          relatedChapter: note.relatedChapter || '',
          relatedKnowledge: note.relatedKnowledge || [],
          isPinned: note.isPinned,
          isFavorite: note.isFavorite,
          status: note.status
        }
        tagsInput.value = note.tags?.join(', ') || ''
      }
    } catch (error) {
      console.error('加载笔记失败:', error)
    } finally {
      loading.value = false
    }
  }
}

// Save draft
const handleSaveDraft = async () => {
  if (!isValid.value) return

  saving.value = true
  try {
    const data = { ...noteData.value, status: 'draft' }

    if (props.mode === 'create') {
      await $fetch('/api/personal-notes', {
        method: 'POST',
        headers: authStore.getAuthHeader(),
        body: data
      })
    } else {
      await $fetch(`/api/personal-notes/${props.noteId}`, {
        method: 'PUT',
        headers: authStore.getAuthHeader(),
        body: data
      })
    }

    emit('saved', 'draft')
  } catch (error) {
    console.error('保存草稿失败:', error)
    alert('保存草稿失败')
  } finally {
    saving.value = false
  }
}

// Publish
const handlePublish = async () => {
  if (!isValid.value) return

  saving.value = true
  try {
    const data = { ...noteData.value, status: 'published' }

    if (props.mode === 'create') {
      await $fetch('/api/personal-notes', {
        method: 'POST',
        headers: authStore.getAuthHeader(),
        body: data
      })
    } else {
      await $fetch(`/api/personal-notes/${props.noteId}`, {
        method: 'PUT',
        headers: authStore.getAuthHeader(),
        body: data
      })
    }

    emit('saved', 'published')
  } catch (error) {
    console.error('发布笔记失败:', error)
    alert('发布笔记失败')
  } finally {
    saving.value = false
  }
}

// Load note on mount if editing
onMounted(() => {
  if (props.mode === 'edit') {
    loadNote()
  }
})
</script>
