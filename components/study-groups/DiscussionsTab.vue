<template>
  <div class="space-y-6">
    <!-- New Post Form -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">发起讨论</h3>
      <textarea
        v-model="newPostContent"
        rows="4"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder="分享你的想法、问题或学习心得..."
      ></textarea>
      <div class="mt-3 flex justify-end">
        <button
          @click="createPost"
          :disabled="!newPostContent.trim() || isPostingNew"
          class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {{ isPostingNew ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>

    <!-- Posts List -->
    <div v-if="loadingPosts" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">加载讨论中...</p>
    </div>

    <div v-else-if="posts.length === 0" class="bg-white rounded-xl shadow-md p-8 text-center">
      <p class="text-gray-500">还没有讨论，来发起第一个话题吧！</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <!-- Post Header -->
        <div class="flex items-start gap-4 mb-4">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {{ post.author.name?.charAt(0) || post.author.email.charAt(0) }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">{{ post.author.name || post.author.email }}</span>
              <span class="text-xs text-gray-500">{{ formatDate(post.createdAt) }}</span>
            </div>
            <p class="text-gray-700 mt-2 whitespace-pre-wrap">{{ post.content }}</p>
          </div>
        </div>

        <!-- Post Actions -->
        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <button
            @click="toggleLike(post.id)"
            :class="[
              'flex items-center gap-1 px-3 py-1 rounded-lg transition-colors',
              post.isLiked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            <span>👍</span>
            <span class="text-sm">{{ post.likeCount || 0 }}</span>
          </button>
          <button
            @click="showReplyForm(post.id)"
            class="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ml-auto"
          >
            <span>💬</span>
            <span class="text-sm">回复 ({{ post.replyCount || 0 }})</span>
          </button>
        </div>

        <!-- Reply Form -->
        <div v-if="replyingTo === post.id" class="mt-4 pt-4 border-t border-gray-100">
          <textarea
            v-model="replyContent"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="写下你的回复..."
          ></textarea>
          <div class="mt-2 flex justify-end gap-2">
            <button
              @click="cancelReply"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="submitReply(post.id)"
              :disabled="!replyContent.trim() || isPosting"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isPosting ? '发送中...' : '发送回复' }}
            </button>
          </div>
        </div>

        <!-- Replies -->
        <div v-if="post.replies && post.replies.length > 0" class="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">回复 ({{ post.replies.length }})</h4>
          <div
            v-for="reply in post.replies"
            :key="reply.id"
            class="ml-4 pl-4 border-l-2 border-gray-200"
          >
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {{ reply.author?.name?.charAt(0) || reply.author?.email?.charAt(0) || '?' }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900 text-sm">{{ reply.author?.name || reply.author?.email || '未知用户' }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(reply.createdAt) }}</span>
                </div>
                <p class="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{{ reply.content }}</p>
              </div>
            </div>
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

const authStore = useAuthStore()
const posts = ref([])
const loadingPosts = ref(false)
const newPostContent = ref('')
const isPostingNew = ref(false)
const replyingTo = ref(null)
const replyContent = ref('')
const isPosting = ref(false)

const currentUser = computed(() => authStore.user)

// Load posts on mount
onMounted(async () => {
  await authStore.init()
  await loadPosts()
})

// Load posts
async function loadPosts() {
  loadingPosts.value = true
  try {
    console.log('[DiscussionsTab] 开始加载帖子, groupId:', props.groupId)
    const response = await $fetch(`/api/study-groups/${props.groupId}/posts`, {
      headers: authStore.getAuthHeader()
    })

    if (response && response.data) {
      // 直接赋值，让 Vue 处理响应式
      posts.value = response.data
      console.log('[DiscussionsTab] 加载到帖子数量:', posts.value.length)
      console.log('[DiscussionsTab] 完整的帖子数据:', posts.value)

      if (posts.value[0]) {
        console.log('[DiscussionsTab] 第一个帖子的 replies 字段:', posts.value[0].replies)
        console.log('[DiscussionsTab] 第一个帖子的回复数:', posts.value[0].replies?.length)
        console.log('[DiscussionsTab] replies 是否是数组:', Array.isArray(posts.value[0].replies))
      }
    }
  } catch (err) {
    console.error('[DiscussionsTab] 加载讨论失败:', err)
    alert('加载讨论失败')
  } finally {
    loadingPosts.value = false
  }
}

// Create new post
async function createPost() {
  if (!newPostContent.value.trim()) return

  isPostingNew.value = true
  try {
    await $fetch(`/api/study-groups/${props.groupId}/posts`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { content: newPostContent.value }
    })

    newPostContent.value = ''
    await loadPosts()
  } catch (err) {
    console.error('发布失败:', err)
    alert('发布失败')
  } finally {
    isPostingNew.value = false
  }
}

// Show reply form
function showReplyForm(postId) {
  replyingTo.value = postId
  replyContent.value = ''
}

// Cancel reply
function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

// Submit reply
async function submitReply(postId) {
  if (!replyContent.value.trim()) return

  isPosting.value = true
  try {
    await $fetch(`/api/study-groups/${props.groupId}/posts/${postId}/reply`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { content: replyContent.value }
    })

    cancelReply()
    await loadPosts()
  } catch (err) {
    console.error('回复失败:', err)
    alert('回复失败')
  } finally {
    isPosting.value = false
  }
}

// Toggle like
async function toggleLike(postId) {
  try {
    console.log('[DiscussionsTab] 切换点赞, postId:', postId)
    await $fetch(`/api/study-groups/${props.groupId}/posts/${postId}/like`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    console.log('[DiscussionsTab] 点赞成功，重新加载帖子')
    await loadPosts()
  } catch (err) {
    console.error('[DiscussionsTab] 点赞失败:', err)
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`

  return date.toLocaleDateString('zh-CN')
}
</script>
