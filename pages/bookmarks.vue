<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <svg class="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
          </svg>
          我的收藏
        </h1>
        <p class="text-gray-600">您收藏的精彩讨论</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载收藏中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="bookmarks.length === 0" class="bg-white rounded-2xl shadow-lg p-16 text-center">
        <div class="text-8xl mb-6">📚</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">还没有收藏任何帖子</h2>
        <p class="text-gray-600 mb-6">在学习小组的讨论中点击"收藏"按钮，就可以在这里看到了</p>
        <button
          @click="$router.push('/study-groups')"
          class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
        >
          前往学习小组
        </button>
      </div>

      <!-- Bookmarks List -->
      <div v-else class="space-y-4">
        <!-- Stats Bar -->
        <div class="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
          <div class="flex items-center gap-2 text-gray-700">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
            </svg>
            <span class="font-semibold">共 {{ bookmarks.length }} 个收藏</span>
          </div>
          <button
            @click="loadBookmarks"
            class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            刷新
          </button>
        </div>

        <!-- Bookmark Cards -->
        <div
          v-for="bookmark in bookmarks"
          :key="bookmark.bookmarkId"
          class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
        >
          <div class="p-6">
            <!-- Post Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <!-- Group Info -->
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm text-gray-500">来自小组:</span>
                  <button
                    @click="$router.push(`/study-groups/${bookmark.post.groupId}`)"
                    class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {{ bookmark.post.groupName }}
                  </button>
                </div>

                <!-- Badges -->
                <div class="flex items-center gap-2 flex-wrap mb-2">
                  <span :class="['px-2 py-0.5 rounded text-xs font-medium', getPostTypeColor(bookmark.post.type)]">
                    {{ getPostTypeIcon(bookmark.post.type) }} {{ getPostTypeName(bookmark.post.type) }}
                  </span>
                  <span v-if="bookmark.post.isPinned" class="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                    📌 置顶
                  </span>
                  <span v-if="bookmark.post.isFeatured" class="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                    ⭐️ 精华
                  </span>
                </div>

                <!-- Title -->
                <h3
                  @click="goToPost(bookmark.post.groupId, bookmark.post.id)"
                  class="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                >
                  {{ bookmark.post.title || '无标题' }}
                </h3>

                <!-- Content Preview -->
                <p class="text-gray-600 line-clamp-2 mb-3">{{ bookmark.post.content }}</p>

                <!-- Meta Info -->
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                    </svg>
                    {{ bookmark.post.author?.name || bookmark.post.author?.email }}
                  </span>
                  <span>👁 {{ bookmark.post.viewCount || 0 }}</span>
                  <span>👍 {{ bookmark.post.likeCount || 0 }}</span>
                  <span>💬 {{ bookmark.post.replyCount || 0 }}</span>
                  <span>🔖 {{ formatDate(bookmark.bookmarkedAt) }}收藏</span>
                </div>
              </div>

              <!-- Remove Bookmark Button -->
              <button
                @click="removeBookmark(bookmark.post.groupId, bookmark.post.id)"
                class="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="取消收藏"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()

const bookmarks = ref([])
const loading = ref(true)

onMounted(async () => {
  await authStore.init()
  await loadBookmarks()
})

// Reload when navigating back to this page
onActivated(() => {
  loadBookmarks()
})

// Watch route to reload when coming back from post detail page
const route = useRoute()
watch(() => route.fullPath, (newPath, oldPath) => {
  // Only reload if we're on the bookmarks page
  if (newPath === '/bookmarks' && oldPath && oldPath !== newPath) {
    loadBookmarks()
  }
})

const loadBookmarks = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/user/bookmarks', {
      headers: authStore.getAuthHeader()
    })

    if (response.success) {
      bookmarks.value = response.data
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
    if (error.statusCode === 401) {
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const goToPost = (groupId, postId) => {
  router.push(`/study-groups/${groupId}/posts/${postId}`)
}

const removeBookmark = async (groupId, postId) => {
  if (!confirm('确定要取消收藏这个帖子吗？')) return

  try {
    await $fetch(`/api/study-groups/${groupId}/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    // Reload bookmarks
    await loadBookmarks()
  } catch (error) {
    console.error('取消收藏失败:', error)
    alert('操作失败，请重试')
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getPostTypeIcon = (type) => {
  const icons = {
    discussion: '💬',
    question: '❓',
    resource: '📚',
    announcement: '📢'
  }
  return icons[type] || '💬'
}

const getPostTypeName = (type) => {
  const names = {
    discussion: '讨论',
    question: '问题',
    resource: '资源',
    announcement: '公告'
  }
  return names[type] || '讨论'
}

const getPostTypeColor = (type) => {
  const colors = {
    discussion: 'bg-blue-100 text-blue-600',
    question: 'bg-yellow-100 text-yellow-600',
    resource: 'bg-green-100 text-green-600',
    announcement: 'bg-red-100 text-red-600'
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}
</script>
