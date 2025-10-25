<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
      >
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        <span class="font-medium">返回资料库</span>
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载资料中...</p>
      </div>

      <!-- Resource Content -->
      <div v-else-if="resource">
        <!-- Resource Header -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ resource.title }}</h1>
              <p v-if="resource.description" class="text-gray-600 mb-4">{{ resource.description }}</p>

              <!-- Tags -->
              <div v-if="resource.tags && resource.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="(tag, index) in resource.tags"
                  :key="index"
                  class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- Meta Info -->
              <div class="flex items-center gap-6 text-sm text-gray-500">
                <div class="flex items-center gap-2">
                  <div v-if="resource.uploader.avatar" class="w-8 h-8 rounded-full overflow-hidden">
                    <img :src="resource.uploader.avatar" :alt="resource.uploader.name" class="w-full h-full object-cover"/>
                  </div>
                  <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                    {{ resource.uploader.name?.charAt(0) || 'U' }}
                  </div>
                  <span>{{ resource.uploader.name }}</span>
                </div>
                <span>{{ formatDate(resource.createdAt) }}</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{{ getCategoryLabel(resource.category) }}</span>
              </div>
            </div>

            <!-- Favorite Button -->
            <button
              @click="toggleFavorite"
              :class="[
                'p-3 rounded-xl transition-all',
                resource.isFavorited
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              ]"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-8 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
              <span>{{ resource.viewCount }} 浏览</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
              <span>{{ resource.downloadCount }} 下载</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
              </svg>
              <span>{{ resource.favoriteCount }} 收藏</span>
            </div>
          </div>

          <!-- Download/View Button -->
          <div class="mt-6">
            <button
              v-if="resource.type === 'link'"
              @click="openExternalLink"
              class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              打开链接
            </button>
            <button
              v-else
              @click="downloadResource"
              :disabled="downloading"
              class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ downloading ? '下载中...' : '下载资料' }}
            </button>
          </div>
        </div>

        <!-- Rating Section -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">评分</h2>

          <!-- Average Rating -->
          <div v-if="resource.averageRating" class="flex items-center gap-4 mb-6">
            <div class="text-5xl font-bold text-orange-600">{{ resource.averageRating.toFixed(1) }}</div>
            <div>
              <div class="flex items-center gap-1 mb-1">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-6 h-6"
                  :class="i <= Math.round(resource.averageRating) ? 'text-yellow-500' : 'text-gray-300'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <div class="text-sm text-gray-500">{{ resource.ratingCount }} 个评分</div>
            </div>
          </div>

          <!-- User Rating -->
          <div class="mb-6">
            <p class="text-sm font-medium text-gray-700 mb-2">您的评分</p>
            <div class="flex items-center gap-2">
              <button
                v-for="i in 5"
                :key="i"
                @click="setUserRating(i)"
                class="transition-transform hover:scale-110"
              >
                <svg
                  class="w-8 h-8"
                  :class="i <= (userRating || 0) ? 'text-yellow-500' : 'text-gray-300'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Rating Review -->
          <div v-if="userRating">
            <label class="block text-sm font-medium text-gray-700 mb-2">评价内容（可选）</label>
            <textarea
              v-model="ratingReview"
              rows="3"
              placeholder="分享您对这个资料的看法..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-3"
            ></textarea>
            <button
              @click="submitRating"
              :disabled="submittingRating"
              class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submittingRating ? '提交中...' : '提交评分' }}
            </button>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6">评论 ({{ resource.commentCount }})</h2>

          <!-- New Comment -->
          <div class="mb-8">
            <textarea
              v-model="newComment"
              rows="3"
              placeholder="发表您的评论..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-3"
            ></textarea>
            <button
              @click="submitComment"
              :disabled="!newComment.trim() || submittingComment"
              class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submittingComment ? '发表中...' : '发表评论' }}
            </button>
          </div>

          <!-- Comments List -->
          <div v-if="resource.comments && resource.comments.length > 0" class="space-y-6">
            <div
              v-for="comment in resource.comments"
              :key="comment.id"
              class="border-b border-gray-200 pb-6 last:border-0"
            >
              <!-- Comment -->
              <div class="flex gap-3">
                <div v-if="comment.user.avatar" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img :src="comment.user.avatar" :alt="comment.user.name" class="w-full h-full object-cover"/>
                </div>
                <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {{ comment.user.name?.charAt(0) || 'U' }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-900">{{ comment.user.name }}</span>
                    <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <p class="text-gray-700">{{ comment.content }}</p>
                </div>
              </div>

              <!-- Replies -->
              <div v-if="comment.replies && comment.replies.length > 0" class="ml-14 mt-4 space-y-4">
                <div
                  v-for="reply in comment.replies"
                  :key="reply.id"
                  class="flex gap-3"
                >
                  <div v-if="reply.user.avatar" class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img :src="reply.user.avatar" :alt="reply.user.name" class="w-full h-full object-cover"/>
                  </div>
                  <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {{ reply.user.name?.charAt(0) || 'U' }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-gray-900">{{ reply.user.name }}</span>
                      <span class="text-sm text-gray-500">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <p class="text-gray-700 text-sm">{{ reply.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            暂无评论，来发表第一条评论吧！
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">😢</div>
        <p class="text-xl text-gray-600 mb-4">资料不存在或已被删除</p>
        <button
          @click="goBack"
          class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          返回资料库
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
const resourceId = route.params.resourceId

const loading = ref(true)
const resource = ref(null)
const downloading = ref(false)

const userRating = ref(0)
const ratingReview = ref('')
const submittingRating = ref(false)

const newComment = ref('')
const submittingComment = ref(false)

// Load resource
const loadResource = async () => {
  loading.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/resources/${resourceId}`, {
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      resource.value = result.data
      userRating.value = result.data.userRating || 0
    }
  } catch (error) {
    console.error('加载资料失败:', error)
    resource.value = null
  } finally {
    loading.value = false
  }
}

// Toggle favorite
const toggleFavorite = async () => {
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/resources/${resourceId}/favorite`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      resource.value.isFavorited = result.data.isFavorited
      resource.value.favoriteCount = result.data.favoriteCount
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    alert(error.data?.message || '收藏操作失败')
  }
}

// Download resource
const downloadResource = async () => {
  downloading.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/resources/${resourceId}/download`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      // Open download URL in new window
      window.open(result.data.downloadUrl, '_blank')
      resource.value.downloadCount++
    }
  } catch (error) {
    console.error('下载失败:', error)
    alert(error.data?.message || '下载失败')
  } finally {
    downloading.value = false
  }
}

// Open external link
const openExternalLink = () => {
  window.open(resource.value.externalUrl, '_blank')
}

// Set user rating
const setUserRating = (rating) => {
  userRating.value = rating
}

// Submit rating
const submitRating = async () => {
  if (!userRating.value) return

  submittingRating.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/resources/${resourceId}/rate`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        rating: userRating.value,
        review: ratingReview.value
      }
    })

    if (result.success) {
      alert('评分成功！')
      resource.value.averageRating = result.data.averageRating
      resource.value.ratingCount = result.data.ratingCount
    }
  } catch (error) {
    console.error('评分失败:', error)
    alert(error.data?.message || '评分失败')
  } finally {
    submittingRating.value = false
  }
}

// Submit comment
const submitComment = async () => {
  if (!newComment.value.trim()) return

  submittingComment.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/resources/${resourceId}/comments`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        content: newComment.value
      }
    })

    if (result.success) {
      alert('评论成功！')
      newComment.value = ''
      // Reload resource to get new comments
      await loadResource()
    }
  } catch (error) {
    console.error('评论失败:', error)
    alert(error.data?.message || '评论失败')
  } finally {
    submittingComment.value = false
  }
}

// Go back
const goBack = () => {
  router.push(`/study-groups/${groupId}/resources`)
}

// Get category label
const getCategoryLabel = (category) => {
  const labels = {
    textbook: '教材',
    note: '笔记',
    practice: '练习题',
    video: '视频教程',
    reference: '参考资料',
    other: '其他'
  }
  return labels[category] || category
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return date.toLocaleDateString('zh-CN')
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

// Load resource on mount
onMounted(() => {
  loadResource()
})
</script>
