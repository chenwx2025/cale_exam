<template>
  <div
    class="note-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
    @click="goToNote"
  >
    <!-- 封面图片 -->
    <div v-if="note.coverImage" class="cover-image relative overflow-hidden bg-gray-100">
      <img
        :src="note.coverImage"
        :alt="note.title"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <!-- 徽章 -->
      <div class="absolute top-3 right-3 flex gap-2">
        <span v-if="note.isPinned" class="badge bg-red-500 text-white">📌 置顶</span>
        <span v-if="note.isFeatured" class="badge bg-yellow-500 text-white">⭐ 精选</span>
      </div>
    </div>

    <!-- 无封面时的占位 -->
    <div v-else class="cover-placeholder bg-gradient-to-br from-blue-100 to-purple-100 h-32 flex items-center justify-center relative">
      <div class="text-6xl opacity-30">📝</div>
      <!-- 徽章 -->
      <div class="absolute top-3 right-3 flex gap-2">
        <span v-if="note.isPinned" class="badge bg-red-500 text-white">📌 置顶</span>
        <span v-if="note.isFeatured" class="badge bg-yellow-500 text-white">⭐ 精选</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="p-5">
      <!-- 分类标签 -->
      <div v-if="note.category" class="mb-2">
        <span class="category-badge">{{ getCategoryIcon(note.category) }} {{ note.category }}</span>
      </div>

      <!-- 标题 -->
      <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {{ note.title }}
      </h3>

      <!-- 摘要 -->
      <p v-if="note.summary" class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ note.summary }}
      </p>

      <!-- 标签 -->
      <div v-if="note.tags && note.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in note.tags.slice(0, 3)"
          :key="tag.id"
          :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }"
          class="tag-item"
        >
          {{ tag.name }}
        </span>
        <span v-if="note.tags.length > 3" class="text-xs text-gray-400">
          +{{ note.tags.length - 3 }}
        </span>
      </div>

      <!-- 作者信息 -->
      <div class="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div class="avatar">
          {{ note.author?.name?.charAt(0) || note.author?.email?.charAt(0) || 'U' }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-800 truncate">
            {{ note.author?.name || note.author?.email?.split('@')[0] }}
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(note.publishedAt || note.createdAt) }}
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-3">
          <span class="stat-item">
            👁 {{ note.viewCount || 0 }}
          </span>
          <span class="stat-item" :class="{ 'text-red-500': note.isLiked }">
            {{ note.isLiked ? '❤️' : '🤍' }} {{ note.likeCount || 0 }}
          </span>
          <span class="stat-item" :class="{ 'text-yellow-500': note.isFavorited }">
            {{ note.isFavorited ? '⭐' : '☆' }} {{ note.favoriteCount || 0 }}
          </span>
          <span v-if="note.commentCount > 0" class="stat-item">
            💬 {{ note.commentCount }}
          </span>
        </div>
        <div v-if="note.attachmentCount > 0" class="flex items-center gap-1">
          📎 {{ note.attachmentCount }}
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          @click.stop="handleLike"
          :class="[
            'action-btn flex-1',
            note.isLiked ? 'text-red-500 border-red-500' : 'text-gray-600 border-gray-300'
          ]"
          :disabled="isLiking"
        >
          {{ note.isLiked ? '❤️' : '🤍' }} {{ note.isLiked ? '已赞' : '点赞' }}
        </button>
        <button
          @click.stop="handleFavorite"
          :class="[
            'action-btn flex-1',
            note.isFavorited ? 'text-yellow-500 border-yellow-500' : 'text-gray-600 border-gray-300'
          ]"
          :disabled="isFavoriting"
        >
          {{ note.isFavorited ? '⭐' : '☆' }} {{ note.isFavorited ? '已藏' : '收藏' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  note: {
    type: Object,
    required: true
  },
  groupId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['updated'])

const router = useRouter()
const authStore = useAuthStore()
const isLiking = ref(false)
const isFavoriting = ref(false)

// 分类图标映射
const getCategoryIcon = (category) => {
  const icons = {
    '考点总结': '📚',
    '错题整理': '📋',
    '学习心得': '💡',
    '知识脉络': '🗺️',
    '记忆口诀': '🎵',
    '临床案例': '🏥'
  }
  return icons[category] || '📝'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const now = new Date()
  const noteDate = new Date(date)
  const diffMs = now - noteDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return noteDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 跳转到笔记详情
const goToNote = () => {
  router.push(`/study-groups/${props.groupId}/notes/${props.note.id}`)
}

// 点赞
const handleLike = async () => {
  if (isLiking.value) return

  isLiking.value = true
  try {
    const result = await $fetch(`/api/study-groups/${props.groupId}/notes/${props.note.id}/like`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      emit('updated')
    }
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
    const result = await $fetch(`/api/study-groups/${props.groupId}/notes/${props.note.id}/favorite`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      emit('updated')
    }
  } catch (error) {
    console.error('收藏失败:', error)
  } finally {
    isFavoriting.value = false
  }
}
</script>

<style scoped>
.note-card {
  border: 1px solid #e5e7eb;
}

.note-card:hover {
  transform: translateY(-4px);
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-item {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  border: 1px solid;
  white-space: nowrap;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  transition: all 0.2s;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
