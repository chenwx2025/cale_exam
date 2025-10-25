<template>
  <div class="note-detail-page min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="bg-white rounded-xl shadow-md p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载笔记中...</p>
      </div>

      <!-- 笔记内容 -->
      <div v-else-if="note" class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- 封面图 -->
        <div v-if="note.coverImage" class="cover-image">
          <img :src="note.coverImage" :alt="note.title" class="w-full h-64 object-cover" />
        </div>

        <!-- 主体内容 -->
        <div class="p-8">
          <!-- 分类和徽章 -->
          <div class="flex items-center gap-2 mb-4">
            <span v-if="note.category" class="category-badge">
              {{ note.category }}
            </span>
            <span v-if="note.isPinned" class="badge bg-red-500 text-white">📌 置顶</span>
            <span v-if="note.isFeatured" class="badge bg-yellow-500 text-white">⭐ 精选</span>
          </div>

          <!-- 标题 -->
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ note.title }}</h1>

          <!-- 摘要 -->
          <p v-if="note.summary" class="text-lg text-gray-600 mb-6 pb-6 border-b border-gray-200">
            {{ note.summary }}
          </p>

          <!-- 作者和统计 -->
          <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="avatar">
                {{ note.author?.name?.charAt(0) || 'U' }}
              </div>
              <div>
                <div class="font-semibold text-gray-900">
                  {{ note.author?.name || note.author?.email }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatDate(note.publishedAt || note.createdAt) }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>👁 {{ note.viewCount }}</span>
              <span :class="{ 'text-red-500': note.isLiked }">
                {{ note.isLiked ? '❤️' : '🤍' }} {{ note.likeCount }}
              </span>
              <span :class="{ 'text-yellow-500': note.isFavorited }">
                {{ note.isFavorited ? '⭐' : '☆' }} {{ note.favoriteCount }}
              </span>
            </div>
          </div>

          <!-- Markdown 内容 -->
          <div class="markdown-content mb-8">
            <MarkdownRenderer :content="note.content" />
          </div>

          <!-- 互动按钮 -->
          <div class="flex gap-3 mb-6">
            <button
              @click="handleLike"
              :class="[
                'action-btn flex-1',
                note.isLiked ? 'bg-red-50 text-red-600 border-red-300' : 'bg-white text-gray-700 border-gray-300'
              ]"
              :disabled="isLiking"
            >
              {{ note.isLiked ? '❤️ 已赞' : '🤍 点赞' }} ({{ note.likeCount }})
            </button>
            <button
              @click="handleFavorite"
              :class="[
                'action-btn flex-1',
                note.isFavorited ? 'bg-yellow-50 text-yellow-600 border-yellow-300' : 'bg-white text-gray-700 border-gray-300'
              ]"
              :disabled="isFavoriting"
            >
              {{ note.isFavorited ? '⭐ 已藏' : '☆ 收藏' }} ({{ note.favoriteCount }})
            </button>
            <button
              v-if="note.canEdit"
              @click="goToEdit"
              class="action-btn flex-1 bg-blue-50 text-blue-600 border-blue-300"
            >
              ✏️ 编辑
            </button>
          </div>

          <!-- 返回按钮 -->
          <button
            @click="goBack"
            class="w-full px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ← 返回笔记列表
          </button>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
        <div class="text-6xl mb-4">😢</div>
        <p class="text-gray-500 text-lg">笔记不存在或已被删除</p>
        <button
          @click="goBack"
          class="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          返回列表
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const groupId = route.params.id
const noteId = route.params.noteId

const note = ref(null)
const loading = ref(true)
const isLiking = ref(false)
const isFavoriting = ref(false)

// 加载笔记详情
const loadNote = async () => {
  loading.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/notes/${noteId}`, {
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      note.value = result.data
    }
  } catch (error) {
    console.error('加载笔记失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 点赞
const handleLike = async () => {
  if (isLiking.value) return
  isLiking.value = true
  try {
    await $fetch(`/api/study-groups/${groupId}/notes/${noteId}/like`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })
    await loadNote()
  } catch (error) {
    console.error('点赞失败:', error)
  } finally {
    isLiking.value = false
  }
}

// 收藏
const handleFavorite = async () => {
  if (isFavoriting.value) return
  isFavoriting.value = true
  try {
    await $fetch(`/api/study-groups/${groupId}/notes/${noteId}/favorite`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })
    await loadNote()
  } catch (error) {
    console.error('收藏失败:', error)
  } finally {
    isFavoriting.value = false
  }
}

// 返回
const goBack = () => {
  router.push(`/study-groups/${groupId}/notes`)
}

// 编辑
const goToEdit = () => {
  router.push(`/study-groups/${groupId}/notes/${noteId}/edit`)
}

// 初始加载
onMounted(() => {
  loadNote()
})
</script>

<style scoped>
.category-badge {
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}

.action-btn {
  padding: 12px 24px;
  border: 2px solid;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.markdown-content {
  line-height: 1.8;
}
</style>
