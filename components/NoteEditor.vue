<template>
  <div class="note-editor bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      {{ mode === 'create' ? '📝 创建笔记' : '✏️ 编辑笔记' }}
    </h2>

    <!-- 标题 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        标题 <span class="text-red-500">*</span>
      </label>
      <input
        v-model="noteData.title"
        type="text"
        placeholder="输入笔记标题..."
        maxlength="100"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
      />
      <div class="text-xs text-gray-500 mt-1">{{ noteData.title.length }}/100</div>
    </div>

    <!-- 分类和可见性 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
        <select
          v-model="noteData.category"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">选择分类</option>
          <option value="考点总结">📚 考点总结</option>
          <option value="错题整理">📋 错题整理</option>
          <option value="学习心得">💡 学习心得</option>
          <option value="知识脉络">🗺️ 知识脉络</option>
          <option value="记忆口诀">🎵 记忆口诀</option>
          <option value="临床案例">🏥 临床案例</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">可见性</label>
        <select
          v-model="noteData.visibility"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="group">🔓 小组内可见</option>
          <option value="public">🌐 公开</option>
          <option value="private">🔒 仅自己可见</option>
        </select>
      </div>
    </div>

    <!-- 摘要 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">摘要</label>
      <textarea
        v-model="noteData.summary"
        placeholder="简要概述笔记内容..."
        rows="2"
        maxlength="200"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      ></textarea>
      <div class="text-xs text-gray-500 mt-1">{{ (noteData.summary || '').length }}/200</div>
    </div>

    <!-- Markdown 编辑器 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        内容 <span class="text-red-500">*</span> (支持 Markdown)
      </label>
      <MarkdownEditor
        v-model="noteData.content"
        placeholder="分享你的学习笔记... 支持 Markdown 格式"
        :rows="15"
      />
    </div>

    <!-- 封面图片 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">封面图片 URL（可选）</label>
      <input
        v-model="noteData.coverImage"
        type="url"
        placeholder="https://example.com/image.jpg"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div v-if="noteData.coverImage" class="mt-2">
        <img
          :src="noteData.coverImage"
          alt="封面预览"
          class="max-w-xs rounded-lg border border-gray-300"
          @error="coverImageError = true"
        />
      </div>
    </div>

    <!-- 高级选项 -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-semibold text-gray-700 mb-3">高级选项</h3>

      <div class="space-y-3">
        <!-- 允许协作编辑 -->
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="noteData.allowEdit"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">允许其他成员协作编辑</span>
        </label>

        <!-- 关联章节 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">关联章节</label>
          <input
            v-model="noteData.relatedChapter"
            type="text"
            placeholder="例如：第三章 中医诊断学"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button
        @click="handleCancel"
        type="button"
        class="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
      >
        取消
      </button>
      <button
        @click="handleSaveDraft"
        type="button"
        :disabled="!isValid || isSaving"
        class="flex-1 px-6 py-3 text-gray-700 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        {{ isSaving ? '保存中...' : '保存草稿' }}
      </button>
      <button
        @click="handlePublish"
        type="button"
        :disabled="!isValid || isSaving"
        class="flex-1 px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
      >
        {{ isSaving ? '发布中...' : (mode === 'create' ? '发布笔记' : '更新笔记') }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  groupId: {
    type: String,
    required: true
  },
  noteId: {
    type: String,
    default: null
  },
  mode: {
    type: String,
    default: 'create', // create | edit
    validator: (value) => ['create', 'edit'].includes(value)
  }
})

const emit = defineEmits(['saved', 'cancel'])

const authStore = useAuthStore()
const isSaving = ref(false)
const coverImageError = ref(false)

const noteData = ref({
  title: '',
  content: '',
  summary: '',
  coverImage: '',
  category: '',
  visibility: 'group',
  allowEdit: false,
  relatedChapter: ''
})

// 验证表单
const isValid = computed(() => {
  return noteData.value.title.trim() && noteData.value.content.trim()
})

// 加载笔记数据（编辑模式）
const loadNote = async () => {
  if (props.mode === 'edit' && props.noteId) {
    try {
      const result = await $fetch(`/api/study-groups/${props.groupId}/notes/${props.noteId}`, {
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
          visibility: note.visibility,
          allowEdit: note.allowEdit,
          relatedChapter: note.relatedChapter || ''
        }
      }
    } catch (error) {
      console.error('加载笔记失败:', error)
      alert('加载笔记失败')
    }
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!isValid.value || isSaving.value) return

  isSaving.value = true
  try {
    const data = {
      ...noteData.value,
      status: 'draft'
    }

    if (props.mode === 'create') {
      await $fetch(`/api/study-groups/${props.groupId}/notes`, {
        method: 'POST',
        headers: authStore.getAuthHeader(),
        body: data
      })
    } else {
      await $fetch(`/api/study-groups/${props.groupId}/notes/${props.noteId}`, {
        method: 'PUT',
        headers: authStore.getAuthHeader(),
        body: { ...data, changeLog: '保存草稿' }
      })
    }

    alert('草稿保存成功')
    emit('saved', 'draft')
  } catch (error) {
    console.error('保存草稿失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

// 发布笔记
const handlePublish = async () => {
  if (!isValid.value || isSaving.value) return

  isSaving.value = true
  try {
    const data = {
      ...noteData.value,
      status: 'published'
    }

    if (props.mode === 'create') {
      await $fetch(`/api/study-groups/${props.groupId}/notes`, {
        method: 'POST',
        headers: authStore.getAuthHeader(),
        body: data
      })
      alert('笔记发布成功！')
    } else {
      await $fetch(`/api/study-groups/${props.groupId}/notes/${props.noteId}`, {
        method: 'PUT',
        headers: authStore.getAuthHeader(),
        body: { ...data, changeLog: '更新笔记' }
      })
      alert('笔记更新成功！')
    }

    emit('saved', 'published')
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  } finally {
    isSaving.value = false
  }
}

// 取消
const handleCancel = () => {
  if (noteData.value.title || noteData.value.content) {
    if (!confirm('确定要取消吗？未保存的内容将丢失。')) {
      return
    }
  }
  emit('cancel')
}

// 组件挂载时加载数据
onMounted(() => {
  loadNote()
})
</script>

<style scoped>
/* 额外样式 */
</style>
