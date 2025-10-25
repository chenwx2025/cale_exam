<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载笔记中...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <div class="text-6xl mb-4">😢</div>
        <p class="text-xl text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="$router.back()"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          返回
        </button>
      </div>

      <!-- Note Content -->
      <div v-else-if="note" class="space-y-6">
        <!-- Back Button -->
        <button
          @click="$router.push('/dashboard/notes')"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回笔记列表
        </button>

        <!-- Note Card -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <!-- Cover Image -->
          <div v-if="note.coverImage" class="h-64 overflow-hidden">
            <img :src="note.coverImage" :alt="note.title" class="w-full h-full object-cover" />
          </div>

          <!-- Content -->
          <div class="p-8">
            <!-- Status Badges -->
            <div class="flex items-center gap-2 mb-4">
              <span v-if="note.isPinned" class="px-3 py-1 bg-red-500 text-white text-sm rounded-full font-semibold">📌 置顶</span>
              <span v-if="note.isFavorite" class="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full font-semibold">⭐ 收藏</span>
              <span v-if="note.category" class="px-3 py-1 text-sm rounded-full font-semibold" :class="getCategoryClass(note.category)">
                {{ getCategoryIcon(note.category) }} {{ note.category }}
              </span>
              <span v-if="note.examType" class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-semibold">
                {{ note.examType === 'cale' ? 'CALE' : 'NCCAOM' }}
              </span>
              <span class="px-3 py-1 text-sm rounded-full font-semibold" :class="getStatusClass(note.status)">
                {{ getStatusText(note.status) }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ note.title }}</h1>

            <!-- Summary -->
            <p v-if="note.summary" class="text-lg text-gray-600 mb-6 p-4 bg-blue-50 rounded-lg">
              {{ note.summary }}
            </p>

            <!-- Tags -->
            <div v-if="note.tags && note.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
              <span
                v-for="(tag, index) in note.tags"
                :key="index"
                class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- Meta Info -->
            <div class="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
              <span>创建于 {{ formatDate(note.createdAt) }}</span>
              <span>•</span>
              <span>更新于 {{ formatDate(note.updatedAt) }}</span>
              <span v-if="note.publishedAt">•</span>
              <span v-if="note.publishedAt">发布于 {{ formatDate(note.publishedAt) }}</span>
            </div>

            <!-- Rendered Markdown Content -->
            <div class="prose prose-lg max-w-none mb-8">
              <MarkdownRenderer :content="note.content" />
            </div>

            <!-- Shared Groups -->
            <div v-if="note.sharedGroups && note.sharedGroups.length > 0" class="mt-8 p-6 bg-green-50 rounded-lg">
              <h3 class="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
                已分享到以下小组
              </h3>
              <div class="space-y-3">
                <div
                  v-for="group in note.sharedGroups"
                  :key="group.id"
                  class="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {{ group.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900">{{ group.name }}</div>
                      <div class="text-sm text-gray-500">分享于 {{ formatDate(group.sharedAt) }}</div>
                    </div>
                  </div>
                  <div v-if="group.studyNoteStats" class="text-sm text-gray-600">
                    👁 {{ group.studyNoteStats.viewCount }} ·
                    ❤️ {{ group.studyNoteStats.likeCount }} ·
                    ⭐ {{ group.studyNoteStats.favoriteCount }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-8 flex items-center justify-end gap-3">
              <button
                @click="toggleFavorite"
                class="px-6 py-2 border-2 border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors font-medium"
              >
                {{ note.isFavorite ? '⭐ 已收藏' : '☆ 收藏' }}
              </button>
              <button
                @click="showShareModal = true"
                class="px-6 py-2 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                分享到小组
              </button>
              <button
                @click="goToEdit"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                编辑笔记
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Share Modal -->
      <ShareToGroupModal
        v-if="showShareModal && note"
        :note-id="note.id"
        :note-title="note.title"
        @close="showShareModal = false"
        @shared="handleShared"
      />
    </div>
  </div>
</template>

<script setup>
import ShareToGroupModal from '~/components/ShareToGroupModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const noteId = route.params.id
const note = ref(null)
const loading = ref(true)
const error = ref(null)
const showShareModal = ref(false)

// Load note
const loadNote = async () => {
  loading.value = true
  error.value = null
  try {
    const result = await $fetch(`/api/personal-notes/${noteId}`, {
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      note.value = result.data
    }
  } catch (err) {
    console.error('加载笔记失败:', err)
    error.value = err.data?.message || '加载笔记失败'
  } finally {
    loading.value = false
  }
}

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
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Toggle favorite
const toggleFavorite = async () => {
  try {
    await $fetch(`/api/personal-notes/${noteId}`, {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: {
        isFavorite: !note.value.isFavorite
      }
    })
    loadNote()
  } catch (error) {
    console.error('切换收藏状态失败:', error)
  }
}

// Go to edit
const goToEdit = () => {
  router.push(`/dashboard/notes/${noteId}/edit`)
}

// Handle shared
const handleShared = () => {
  showShareModal.value = false
  loadNote()
}

// Load note on mount
onMounted(() => {
  loadNote()
})
</script>
