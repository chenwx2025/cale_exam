<template>
  <div class="space-y-6">
    <!-- Toolbar: 搜索、筛选、排序 -->
    <div class="bg-white rounded-xl shadow-md p-4">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- 搜索框 -->
          <div class="flex-1">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索帖子标题或内容..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- 类型筛选 -->
          <div class="flex gap-2">
            <button
              v-for="filterType in postTypes"
              :key="filterType.value"
              @click="selectedType = selectedType === filterType.value ? 'all' : filterType.value"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedType === filterType.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ filterType.icon }} {{ filterType.label }}
            </button>
          </div>

          <!-- 排序 -->
          <select
            v-model="sortBy"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="latest">最新发布</option>
            <option value="hot">最热门</option>
            <option value="mostReplies">最多回复</option>
          </select>
        </div>

        <!-- 标签筛选 -->
        <div v-if="availableTags.length > 0" class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-gray-600">标签:</span>
          <button
            @click="selectedTagId = null"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium transition-all',
              !selectedTagId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            全部
          </button>
          <button
            v-for="tag in availableTags"
            :key="tag.id"
            @click="selectedTagId = selectedTagId === tag.id ? null : tag.id"
            :style="selectedTagId === tag.id ? { backgroundColor: tag.color, color: 'white' } : { backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium transition-all border',
              selectedTagId === tag.id ? '' : 'hover:opacity-80'
            ]"
          >
            {{ tag.name }} ({{ tag.postCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- New Post Button -->
    <button
      @click="showNewPostModal = true"
      class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      发起新讨论
    </button>

    <!-- Posts List (BBS Style) -->
    <div v-if="loadingPosts" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-4 text-gray-600">加载讨论中...</p>
    </div>

    <div v-else-if="filteredPosts.length === 0" class="bg-white rounded-xl shadow-md p-12 text-center">
      <div class="text-6xl mb-4">💬</div>
      <p class="text-gray-500 text-lg">{{ searchQuery ? '没有找到匹配的讨论' : '还没有讨论，来发起第一个话题吧！' }}</p>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
      <!-- Table Header -->
      <div class="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 font-semibold text-gray-700 text-sm">
        <div class="col-span-6">主题</div>
        <div class="col-span-2 text-center">作者</div>
        <div class="col-span-2 text-center">数据</div>
        <div class="col-span-2 text-center">最后回复</div>
      </div>

      <!-- Posts -->
      <div class="divide-y divide-gray-100">
        <div
          v-for="(post, index) in paginatedPosts"
          :key="post.id"
          class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="goToPost(post.id)"
        >
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <!-- 主题 -->
            <div class="md:col-span-6">
              <div class="flex items-start gap-3">
                <!-- 类型图标 -->
                <div :class="[
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                  getPostTypeColor(post.type)
                ]">
                  {{ getPostTypeIcon(post.type) }}
                </div>

                <div class="flex-1 min-w-0">
                  <!-- 标题 -->
                  <h3 class="font-semibold text-gray-900 mb-1 flex items-center gap-2 flex-wrap">
                    <!-- 置顶标签 -->
                    <span v-if="post.isPinned" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                      📌 置顶
                    </span>

                    <!-- 精华标签 -->
                    <span v-if="post.isFeatured" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                      ⭐️ 精华
                    </span>

                    <!-- 标题 -->
                    <span class="hover:text-blue-600 transition-colors">
                      {{ post.title || '无标题' }}
                    </span>

                    <!-- 状态标签 (问题帖) -->
                    <span v-if="post.type === 'question' && post.status === 'solved'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      ✓ 已解决
                    </span>
                    <span v-else-if="post.type === 'question' && post.status === 'pending'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                      待解决
                    </span>
                  </h3>

                  <!-- 内容预览 -->
                  <p class="text-sm text-gray-600 line-clamp-2">{{ post.content }}</p>

                  <!-- 标签 -->
                  <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
                    <span
                      v-for="tag in post.tags"
                      :key="tag.id"
                      :style="{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                    >
                      {{ tag.name }}
                    </span>
                  </div>

                  <!-- 移动端：作者和数据 -->
                  <div class="md:hidden mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>{{ post.author?.name || post.author?.email }}</span>
                    <span>👁 {{ post.viewCount || 0 }}</span>
                    <span>👍 {{ post.likeCount }}</span>
                    <span>💬 {{ post.replyCount }}</span>
                    <span v-if="post.poll" class="text-blue-600">📊 {{ post.poll.totalVotes || 0 }}</span>
                    <span>{{ formatDate(post.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 作者 (桌面端) -->
            <div class="hidden md:flex md:col-span-2 items-center justify-center">
              <div class="text-center">
                <div class="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold mb-1">
                  {{ post.author?.name?.charAt(0) || post.author?.email.charAt(0) }}
                </div>
                <div class="text-sm text-gray-700 font-medium">{{ post.author?.name || post.author?.email?.split('@')[0] }}</div>
              </div>
            </div>

            <!-- 数据 (桌面端) -->
            <div class="hidden md:flex md:col-span-2 flex-col items-center justify-center text-sm">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1 text-gray-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                  </svg>
                  {{ post.likeCount }}
                </span>
                <span class="flex items-center gap-1 text-gray-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
                  </svg>
                  {{ post.replyCount }}
                </span>
                <span v-if="post.poll" class="flex items-center gap-1 text-blue-600 font-semibold">
                  📊 {{ post.poll.totalVotes || 0 }}
                </span>
              </div>
            </div>

            <!-- 最后回复 (桌面端) -->
            <div class="hidden md:flex md:col-span-2 flex-col items-center justify-center text-sm text-gray-600">
              <div v-if="post.replies && post.replies.length > 0" class="text-center">
                <div class="text-xs text-gray-500 mb-1">{{ post.replies[post.replies.length - 1].author?.name || '未知' }}</div>
                <div class="text-xs text-gray-400">{{ formatDate(post.replies[post.replies.length - 1].createdAt) }}</div>
              </div>
              <div v-else class="text-xs text-gray-400">暂无回复</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            共 {{ filteredPosts.length }} 个讨论，第 {{ currentPage }} / {{ totalPages }} 页
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Post Modal -->
    <div v-if="showNewPostModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="showNewPostModal = false">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">发起新讨论</h3>
            <button @click="showNewPostModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- 类型选择 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">讨论类型</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                v-for="type in postTypes.filter(t => t.value !== 'all')"
                :key="type.value"
                @click="newPost.type = type.value"
                :class="[
                  'px-4 py-3 rounded-lg text-sm font-medium transition-all border-2',
                  newPost.type === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                ]"
              >
                <div class="text-xl mb-1">{{ type.icon }}</div>
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- 标题 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              v-model="newPost.title"
              type="text"
              placeholder="输入标题..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- 内容 - Markdown 编辑器 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">内容 (支持Markdown)</label>
            <MarkdownEditor
              v-model="newPost.content"
              placeholder="分享你的想法、问题或学习心得... 支持Markdown格式编辑"
              :rows="10"
            />
          </div>

          <!-- 投票功能开关 -->
          <div class="mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="showPollCreator"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span class="text-xl">📊</span>
                添加投票
              </span>
            </label>
          </div>

          <!-- 投票创建器 -->
          <div v-if="showPollCreator" class="mb-6">
            <PollCreator
              ref="pollCreatorRef"
              :embedded="true"
              @create="handlePollCreate"
              @cancel="showPollCreator = false"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end gap-3">
            <button
              @click="showNewPostModal = false"
              class="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button
              @click="createPost"
              :disabled="!newPost.title?.trim() || !newPost.content?.trim() || isPostingNew"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {{ isPostingNew ? '发布中...' : '发布讨论' }}
            </button>
          </div>
        </div>
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

const router = useRouter()
const authStore = useAuthStore()
const posts = ref([])
const loadingPosts = ref(false)
const isPostingNew = ref(false)
const showNewPostModal = ref(false)
const showPollCreator = ref(false)
const pollCreatorRef = ref(null)
const pollData = ref(null)

// 新帖子数据
const newPost = ref({
  title: '',
  content: '',
  type: 'discussion'
})

// 筛选和排序
const searchQuery = ref('')
const selectedType = ref('all')
const selectedTagId = ref(null)
const sortBy = ref('latest')
const currentPage = ref(1)
const postsPerPage = 20

// 标签相关
const availableTags = ref([])

// 帖子类型
const postTypes = [
  { value: 'all', label: '全部', icon: '📋' },
  { value: 'discussion', label: '讨论', icon: '💬' },
  { value: 'question', label: '问题', icon: '❓' },
  { value: 'resource', label: '资源', icon: '📚' },
  { value: 'announcement', label: '公告', icon: '📢' }
]

const currentUser = computed(() => authStore.user)

// 筛选帖子
const filteredPosts = computed(() => {
  let result = posts.value

  // 搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(post =>
      post.title?.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    )
  }

  // 类型筛选
  if (selectedType.value !== 'all') {
    result = result.filter(post => post.type === selectedType.value)
  }

  // 排序
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    } else if (sortBy.value === 'hot') {
      const scoreA = a.likeCount * 2 + a.replyCount
      const scoreB = b.likeCount * 2 + b.replyCount
      return scoreB - scoreA
    } else if (sortBy.value === 'mostReplies') {
      return b.replyCount - a.replyCount
    }
    return 0
  })

  // 置顶帖子排在前面
  return result.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })
})

// 分页
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage))
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return filteredPosts.value.slice(start, end)
})

// 重置分页当筛选条件改变时
watch([searchQuery, selectedType, selectedTagId, sortBy], () => {
  currentPage.value = 1
})

// 监听标签筛选变化，重新加载帖子
watch(selectedTagId, () => {
  loadPosts()
})

// Load posts on mount
onMounted(async () => {
  await authStore.init()
  await loadTags()
  await loadPosts()
})

// Reload when component is activated (for keep-alive)
onActivated(async () => {
  await loadPosts()
})

// Expose loadPosts method to parent component
defineExpose({
  loadPosts
})

// Load tags
const loadTags = async () => {
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/tags`, {
      headers: authStore.getAuthHeader()
    })

    if (response && response.data) {
      availableTags.value = response.data
    }
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

// Load posts
const loadPosts = async () => {
  loadingPosts.value = true
  try {
    const params = new URLSearchParams()
    params.append('groupId', props.groupId)
    if (selectedTagId.value) {
      params.append('tagId', selectedTagId.value)
    }

    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    const url = `/api/study-group-posts?${params.toString()}`
    console.log('[DiscussionsTab] 使用扁平路由 API:', url)
    const response = await $fetch(url, {
      headers: authStore.getAuthHeader()
    })
    console.log('[DiscussionsTab] API响应:', response)

    if (response && response.data) {
      posts.value = response.data
      console.log('[DiscussionsTab] 加载到帖子数量:', posts.value.length)
    } else {
      console.error('[DiscussionsTab] 响应格式错误:', response)
    }
  } catch (error) {
    console.error('[DiscussionsTab] 加载讨论失败:', error)
  } finally {
    loadingPosts.value = false
  }
}

// Create new post
// 处理投票创建
const handlePollCreate = (data) => {
  pollData.value = data
}

const createPost = async () => {
  if (!newPost.value.title?.trim() || !newPost.value.content?.trim()) return

  isPostingNew.value = true
  try {
    // 创建帖子 - 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[DiscussionsTab] 使用扁平路由 API 发布帖子')
    const result = await $fetch(`/api/study-group-posts`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        ...newPost.value,
        groupId: props.groupId
      }
    })
    console.log('[DiscussionsTab] 帖子发布响应:', result)

    // 如果有投票数据，创建投票
    if (pollData.value && result.data?.id) {
      try {
        await $fetch(`/api/study-groups/${props.groupId}/posts/${result.data.id}/polls`, {
          method: 'POST',
          headers: authStore.getAuthHeader(),
          body: pollData.value
        })
      } catch (pollError) {
        console.error('创建投票失败:', pollError)
        alert('帖子已发布，但投票创建失败')
      }
    }

    // 重置表单
    newPost.value = {
      title: '',
      content: '',
      type: 'discussion'
    }
    pollData.value = null
    showPollCreator.value = false
    showNewPostModal.value = false

    // 重新加载帖子列表
    await loadPosts()
  } catch (error) {
    console.error('发布讨论失败:', error)
    alert('发布失败，请重试')
  } finally {
    isPostingNew.value = false
  }
}

// Navigate to post detail
const goToPost = (postId) => {
  router.push(`/study-groups/${props.groupId}/posts/${postId}`)
}

// Helper functions
const formatDate = (date) => {
  const now = new Date()
  const postDate = new Date(date)
  const diffMs = now - postDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return postDate.toLocaleDateString('zh-CN', {
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
