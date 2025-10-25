<template>
  <div class="personal-note-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer" @click="goToNote">
    <!-- Cover Image or Placeholder -->
    <div v-if="note.coverImage" class="relative h-48 overflow-hidden">
      <img :src="note.coverImage" :alt="note.title" class="w-full h-full object-cover" />
      <div class="absolute top-3 right-3 flex gap-2">
        <span v-if="note.isPinned" class="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">📌 置顶</span>
        <span v-if="note.isFavorite" class="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-semibold">⭐ 收藏</span>
      </div>
    </div>
    <div v-else class="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
      <div class="text-6xl">{{ getCategoryIcon(note.category) }}</div>
      <div class="absolute top-3 right-3 flex gap-2">
        <span v-if="note.isPinned" class="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">📌 置顶</span>
        <span v-if="note.isFavorite" class="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-semibold">⭐ 收藏</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Status Badge -->
      <div class="flex items-center gap-2 mb-3">
        <span v-if="note.category" class="px-3 py-1 rounded-full text-xs font-semibold" :class="getCategoryClass(note.category)">
          {{ getCategoryIcon(note.category) }} {{ note.category }}
        </span>
        <span v-if="note.examType" class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-semibold">
          {{ note.examType === 'cale' ? 'CALE' : 'NCCAOM' }}
        </span>
        <span :class="getStatusClass(note.status)" class="px-2 py-1 text-xs rounded-full font-semibold">
          {{ getStatusText(note.status) }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
        {{ note.title }}
      </h3>

      <!-- Summary -->
      <p v-if="note.summary" class="text-gray-600 text-sm mb-4 line-clamp-3">
        {{ note.summary }}
      </p>

      <!-- Tags -->
      <div v-if="note.tags && note.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="(tag, index) in note.tags.slice(0, 3)"
          :key="index"
          class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
        >
          #{{ tag }}
        </span>
        <span v-if="note.tags.length > 3" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          +{{ note.tags.length - 3 }}
        </span>
      </div>

      <!-- Shared Groups -->
      <div v-if="note.sharedGroups && note.sharedGroups.length > 0" class="mb-4 p-3 bg-green-50 rounded-lg">
        <div class="flex items-center gap-2 text-sm text-green-700">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
          </svg>
          <span class="font-semibold">已分享到 {{ note.sharedGroups.length }} 个小组</span>
        </div>
        <div class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="group in note.sharedGroups.slice(0, 2)"
            :key="group.id"
            class="text-xs text-green-600"
          >
            {{ group.name }}
          </span>
          <span v-if="note.sharedGroups.length > 2" class="text-xs text-green-600">
            等{{ note.sharedGroups.length }}个小组
          </span>
        </div>
      </div>

      <!-- Meta Info -->
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>{{ formatDate(note.updatedAt) }}</span>
        <div class="flex items-center gap-3">
          <button
            @click.stop="toggleFavorite"
            class="flex items-center gap-1 hover:text-yellow-600 transition-colors"
          >
            {{ note.isFavorite ? '⭐' : '☆' }}
          </button>
          <button
            @click.stop="showShareModal = true"
            class="flex items-center gap-1 hover:text-blue-600 transition-colors"
            title="分享到小组"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
          <button
            @click.stop="$emit('edit', note.id)"
            class="flex items-center gap-1 hover:text-blue-600 transition-colors"
            title="编辑"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button
            @click.stop="$emit('delete', note.id)"
            class="flex items-center gap-1 hover:text-red-600 transition-colors"
            title="删除"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareToGroupModal
      v-if="showShareModal"
      :note-id="note.id"
      :note-title="note.title"
      @close="showShareModal = false"
      @shared="handleShared"
    />
  </div>
</template>

<script setup>
import ShareToGroupModal from './ShareToGroupModal.vue'

const props = defineProps({
  note: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['updated', 'edit', 'delete'])

const router = useRouter()
const authStore = useAuthStore()
const showShareModal = ref(false)

// Category helpers
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

const getCategoryClass = (category) => {
  const classes = {
    '考点总结': 'bg-blue-100 text-blue-700',
    '错题整理': 'bg-red-100 text-red-700',
    '学习心得': 'bg-green-100 text-green-700',
    '知识脉络': 'bg-purple-100 text-purple-700',
    '记忆口诀': 'bg-yellow-100 text-yellow-700',
    '临床案例': 'bg-pink-100 text-pink-700'
  }
  return classes[category] || 'bg-gray-100 text-gray-700'
}

const getStatusClass = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-600',
    'published': 'bg-green-100 text-green-700',
    'archived': 'bg-orange-100 text-orange-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

const getStatusText = (status) => {
  const texts = {
    'draft': '草稿',
    'published': '已发布',
    'archived': '已归档'
  }
  return texts[status] || status
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  }
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return date.toLocaleDateString('zh-CN')
}

// Toggle favorite
const toggleFavorite = async () => {
  try {
    await $fetch(`/api/personal-notes/${props.note.id}`, {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: {
        isFavorite: !props.note.isFavorite
      }
    })
    emit('updated')
  } catch (error) {
    console.error('切换收藏状态失败:', error)
  }
}

// Navigate to note detail
const goToNote = () => {
  router.push(`/dashboard/notes/${props.note.id}`)
}

// Handle shared
const handleShared = () => {
  showShareModal.value = false
  emit('updated')
}
</script>

<style scoped>
.personal-note-card {
  transition: transform 0.2s ease;
}

.personal-note-card:hover {
  transform: translateY(-4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
