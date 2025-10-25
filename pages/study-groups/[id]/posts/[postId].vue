<template>
  <div class="min-h-screen bg-gray-100 py-6">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
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

      <!-- Post Content -->
      <div v-else-if="post">
        <!-- Navigation Breadcrumb -->
        <div class="mb-4 flex items-center gap-2 text-sm">
          <button
            @click="$router.push(`/study-groups/${groupId}`)"
            class="text-blue-600 hover:text-blue-700 hover:underline"
          >
            返回小组
          </button>
          <span class="text-gray-400">›</span>
          <span class="text-gray-600">讨论详情</span>
        </div>

        <!-- Thread Title Bar -->
        <div class="bg-white border border-gray-300 rounded-t-lg px-6 py-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-3 flex-wrap">
              <!-- Type Badge -->
              <span :class="['px-3 py-1 rounded text-sm font-medium', getPostTypeColor(post.type)]">
                {{ getPostTypeIcon(post.type) }} {{ getPostTypeName(post.type) }}
              </span>

              <!-- Pinned Badge -->
              <span v-if="post.isPinned" class="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700">
                📌 置顶
              </span>

              <!-- Featured Badge -->
              <span v-if="post.isFeatured" class="px-3 py-1 rounded text-sm font-medium bg-amber-100 text-amber-700">
                ⭐️ 精华
              </span>

              <!-- Locked Badge -->
              <span v-if="post.isLocked" class="px-3 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700">
                🔒 已锁定
              </span>

              <!-- Status Badge -->
              <span v-if="post.type === 'question' && post.status === 'solved'" class="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700">
                ✓ 已解决
              </span>
              <span v-else-if="post.type === 'question' && post.status === 'pending'" class="px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-700">
                待解决
              </span>
            </div>

            <!-- Admin Actions -->
            <div v-if="canManage" class="flex items-center gap-2">
              <button
                @click="togglePin"
                :disabled="isTogglingPin"
                class="px-3 py-1.5 rounded text-sm font-medium transition-all disabled:opacity-50"
                :class="post.isPinned
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ isTogglingPin ? '处理中...' : (post.isPinned ? '取消置顶' : '置顶帖子') }}
              </button>
              <button
                @click="toggleFeatured"
                :disabled="isTogglingFeatured"
                class="px-3 py-1.5 rounded text-sm font-medium transition-all disabled:opacity-50"
                :class="post.isFeatured
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ isTogglingFeatured ? '处理中...' : (post.isFeatured ? '取消精华' : '设为精华') }}
              </button>
              <button
                @click="toggleLock"
                :disabled="isTogglingLock"
                class="px-3 py-1.5 rounded text-sm font-medium transition-all disabled:opacity-50"
                :class="post.isLocked
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ isTogglingLock ? '处理中...' : (post.isLocked ? '解锁帖子' : '锁定帖子') }}
              </button>
            </div>
          </div>

          <!-- Thread Title -->
          <h1 class="text-2xl font-bold text-gray-900 mt-3">{{ post.title || '无标题' }}</h1>
        </div>

        <!-- Thread Stats Bar -->
        <div class="bg-gray-50 border-x border-gray-300 px-6 py-3 flex items-center gap-6 text-sm text-gray-600">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
            作者: <strong class="text-gray-900">{{ post.author?.name || post.author?.email }}</strong>
          </span>
          <span>发布: {{ formatDate(post.createdAt) }}</span>
          <span>👁 {{ post.viewCount || 0 }} 浏览</span>
          <span>👍 {{ post.likeCount || 0 }}</span>
          <span>💬 {{ post.replyCount || 0 }} 回复</span>
        </div>

        <!-- Main Post (1楼) -->
        <div class="bg-white border-x border-b border-gray-300 rounded-b-lg overflow-hidden mb-4">
          <div class="grid grid-cols-1 md:grid-cols-12">
            <!-- Left Sidebar: Author Info -->
            <div class="md:col-span-3 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-6">
              <div class="flex md:flex-col items-center md:items-start gap-4 md:gap-3">
                <!-- Avatar -->
                <div class="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {{ post.author?.name?.charAt(0) || post.author?.email.charAt(0) }}
                </div>

                <!-- Author Details -->
                <div class="flex-1 md:w-full text-center md:text-left">
                  <div class="font-bold text-gray-900 mb-1">{{ post.author?.name || post.author?.email?.split('@')[0] }}</div>
                  <div class="text-xs text-gray-500 mb-2">楼主</div>
                  <div class="text-xs text-gray-400 mb-2">ID: {{ post.author?.id?.slice(0, 8) }}</div>
                  <!-- Signature -->
                  <div v-if="post.author?.signature" class="text-xs text-gray-500 italic border-t border-gray-200 pt-2 mt-2">
                    {{ post.author.signature }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Content Area -->
            <div class="md:col-span-9 p-6">
              <!-- Floor Number -->
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <span class="text-sm font-semibold text-gray-700 bg-blue-50 px-3 py-1 rounded">1楼</span>
                <span class="text-xs text-gray-500">{{ formatDate(post.createdAt) }}</span>
              </div>

              <!-- Post Content - Markdown渲染 -->
              <div v-if="!isEditingPost" class="mb-6">
                <MarkdownRenderer :content="post.content" />
                <div v-if="post.createdAt !== post.updatedAt" class="text-xs text-gray-400 mt-2">
                  已编辑于 {{ formatDate(post.updatedAt) }}
                </div>
              </div>

              <!-- Poll Display -->
              <div v-if="post.hasPoll" class="mb-6">
                <PollDisplay
                  :group-id="groupId"
                  :post-id="postId"
                  @updated="loadPost"
                />
              </div>
              <!-- Edit Post Form -->
              <div v-else class="mb-6">
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input
                    v-model="editPostTitle"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="帖子标题"
                  />
                </div>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">内容 (支持Markdown)</label>
                  <MarkdownEditor
                    v-model="editPostContent"
                    :rows="10"
                    placeholder="编辑帖子内容... 支持Markdown格式编辑"
                  />
                </div>
              </div>

              <!-- Post Actions -->
              <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
                <template v-if="!isEditingPost">
                  <button
                    @click="toggleLike"
                    :class="[
                      'flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all',
                      post.isLiked
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                    </svg>
                    赞 ({{ post.likeCount || 0 }})
                  </button>
                  <button
                    @click="toggleBookmark"
                    :class="[
                      'flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all',
                      post.isBookmarked
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                    {{ post.isBookmarked ? '已收藏' : '收藏' }}
                  </button>
                  <button
                    @click="quotePost"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-all"
                  >
                    引用回复
                  </button>
                  <!-- Edit Button - Only for post author or admin -->
                  <button
                    v-if="post.author?.id === authStore.user?.id || canManage"
                    @click="startEditPost"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    编辑
                  </button>
                </template>
                <template v-else>
                  <button
                    @click="savePostEdit"
                    :disabled="isSavingPost"
                    class="px-4 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-all disabled:opacity-50"
                  >
                    {{ isSavingPost ? '保存中...' : '保存' }}
                  </button>
                  <button
                    @click="cancelEditPost"
                    :disabled="isSavingPost"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    取消
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Replies Section -->
        <div v-if="replies.length > 0" class="space-y-4 mb-4">
          <div
            v-for="(reply, index) in replies"
            :key="reply.id"
            :id="`reply-${reply.id}`"
            class="bg-white border border-gray-300 rounded-lg overflow-hidden"
          >
            <div class="grid grid-cols-1 md:grid-cols-12">
              <!-- Left Sidebar: Author Info -->
              <div class="md:col-span-3 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-6">
                <div class="flex md:flex-col items-center md:items-start gap-4 md:gap-3">
                  <!-- Avatar -->
                  <div class="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {{ reply.author?.name?.charAt(0) || reply.author?.email?.charAt(0) || '?' }}
                  </div>

                  <!-- Author Details -->
                  <div class="flex-1 md:w-full text-center md:text-left">
                    <div class="font-bold text-gray-900 mb-1 text-sm">{{ reply.author?.name || reply.author?.email?.split('@')[0] || '未知用户' }}</div>
                    <div class="text-xs text-gray-400">ID: {{ reply.author?.id?.slice(0, 8) || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Right Content Area -->
              <div class="md:col-span-9 p-6">
                <!-- Floor Number -->
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded">{{ reply.floorNumber }}楼</span>
                    <!-- 最佳答案标识 -->
                    <span v-if="reply.isBestAnswer" class="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700 flex items-center gap-1">
                      ✅ 最佳答案
                    </span>
                    <!-- 沙发/板凳/地板标识 - 基于楼层号 -->
                    <span v-if="reply.floorNumber === 2" class="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                      🛋️ 沙发
                    </span>
                    <span v-else-if="reply.floorNumber === 3" class="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-700">
                      🪑 板凳
                    </span>
                    <span v-else-if="reply.floorNumber === 4" class="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                      🏠 地板
                    </span>
                  </div>
                  <span class="text-xs text-gray-500">{{ formatDate(reply.createdAt) }}</span>
                </div>

                <!-- Reply Content - Markdown渲染 -->
                <div v-if="editingReplyId !== reply.id" class="mb-6">
                  <MarkdownRenderer :content="reply.content" />
                  <div v-if="reply.createdAt !== reply.updatedAt" class="text-xs text-gray-400 mt-2">
                    已编辑于 {{ formatDate(reply.updatedAt) }}
                  </div>
                </div>
                <!-- Edit Reply Form -->
                <div v-else class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-1">编辑回复 (支持Markdown)</label>
                  <MarkdownEditor
                    v-model="editReplyContent"
                    :rows="8"
                    placeholder="编辑回复内容... 支持Markdown格式编辑"
                  />
                </div>

                <!-- Reply Actions -->
                <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <template v-if="editingReplyId !== reply.id">
                    <button
                      @click="toggleReplyLike(reply.id)"
                      :class="[
                        'flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all',
                        reply.isLiked
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                      </svg>
                      赞 ({{ reply.likeCount || 0 }})
                    </button>
                    <button
                      @click="quoteReply(reply)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-all"
                    >
                      引用
                    </button>
                    <!-- Best Answer Button - Only for post author on question type posts -->
                    <button
                      v-if="post.type === 'question' && (post.author?.id === authStore.user?.id || canManage)"
                      @click="toggleBestAnswer(reply.id)"
                      :class="[
                        'flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all',
                        reply.isBestAnswer
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border hover:border-green-300'
                      ]"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      {{ reply.isBestAnswer ? '取消最佳答案' : '设为最佳答案' }}
                    </button>
                    <!-- Edit Button - Only for reply author or admin -->
                    <button
                      v-if="reply.author?.id === authStore.user?.id || canManage"
                      @click="startEditReply(reply)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                      编辑
                    </button>
                  </template>
                  <template v-else>
                    <button
                      @click="saveReplyEdit(reply.id)"
                      :disabled="isSavingReply"
                      class="px-4 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {{ isSavingReply ? '保存中...' : '保存' }}
                    </button>
                    <button
                      @click="cancelEditReply"
                      :disabled="isSavingReply"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                      取消
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Replies Message -->
        <div v-else class="bg-white border border-gray-300 rounded-lg p-12 text-center text-gray-500 mb-4">
          <div class="text-5xl mb-3">💬</div>
          <p class="text-lg">还没有回复，来抢沙发吧！</p>
        </div>

        <!-- Quick Reply Form -->
        <div class="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-gray-300">
            <h3 class="font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"/>
              </svg>
              快速回复
            </h3>
          </div>

          <!-- Locked Notice -->
          <div v-if="post.isLocked" class="p-6 bg-gray-50 border-b border-gray-200">
            <div class="flex items-center gap-3 text-gray-600">
              <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium">该帖子已被管理员锁定，无法添加新回复</span>
            </div>
          </div>

          <div v-else class="p-6">
            <MarkdownEditor
              ref="replyEditorRef"
              v-model="replyContent"
              :rows="8"
              placeholder="写下你的回复... 支持Markdown格式编辑"
            />
            <div class="flex items-center justify-between mt-4">
              <div class="text-sm text-gray-500">
                <span class="mr-4">💡 支持Markdown格式 | Ctrl+B 粗体 | Ctrl+I 斜体</span>
              </div>
              <button
                @click="submitReply"
                :disabled="!replyContent.trim() || isPosting"
                class="px-6 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
              >
                {{ isPosting ? '发送中...' : '发表回复' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const groupId = route.params.id
const postId = route.params.postId

const post = ref(null)
const replies = ref([])
const loading = ref(true)
const error = ref(null)
const replyContent = ref('')
const isPosting = ref(false)
const isTogglingPin = ref(false)
const isTogglingFeatured = ref(false)
const isTogglingLock = ref(false)
const replyFormRef = ref(null)
const replyEditorRef = ref(null)
const userRole = ref(null)
const newReplyId = ref(null)

// Edit states
const isEditingPost = ref(false)
const editPostTitle = ref('')
const editPostContent = ref('')
const isSavingPost = ref(false)

const editingReplyId = ref(null)
const editReplyContent = ref('')
const isSavingReply = ref(false)

// Computed property to check if user can manage posts
const canManage = computed(() => {
  return userRole.value && ['owner', 'admin', 'moderator'].includes(userRole.value)
})

onMounted(async () => {
  await authStore.init()
  await loadPost()
  await loadUserRole()
})

const loadPost = async () => {
  loading.value = true
  try {
    const data = await $fetch(`/api/study-groups/${groupId}/posts/${postId}`, {
      headers: authStore.getAuthHeader()
    })

    post.value = data
    replies.value = data.replies || []
  } catch (err) {
    error.value = err.message || '加载帖子失败'
  } finally {
    loading.value = false
  }
}

const toggleLike = async () => {
  try {
    console.log('[Post Like] 开始点赞操作, postId:', postId)
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/like`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })
    console.log('[Post Like] 点赞操作成功:', result)

    // Reload post to get updated like count
    await loadPost()
  } catch (error) {
    console.error('[Post Like] 点赞失败:', error)
    // Show error message to user
    if (error.statusCode === 401) {
      alert('请先登录')
    } else if (error.statusCode === 403) {
      alert('只有小组成员可以点赞')
    } else {
      alert('点赞失败，请重试')
    }
  }
}

const toggleReplyLike = async (replyId) => {
  try {
    console.log('[Reply Like] 开始点赞操作, replyId:', replyId)
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/replies/${replyId}/like`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })
    console.log('[Reply Like] 点赞操作成功:', result)

    // Reload post to get updated like count
    await loadPost()
  } catch (error) {
    console.error('[Reply Like] 点赞失败:', error)
    // Show error message to user
    if (error.statusCode === 401) {
      alert('请先登录')
    } else if (error.statusCode === 403) {
      alert('只有小组成员可以点赞')
    } else {
      alert('点赞失败，请重试')
    }
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return

  isPosting.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/replies`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        content: replyContent.value
      }
    })

    // 保存新回复的ID
    if (result && result.data && result.data.id) {
      newReplyId.value = result.data.id
    }

    // Clear form
    replyContent.value = ''

    // Reload post to get new reply
    await loadPost()

    // 滚动到新回复位置
    if (newReplyId.value) {
      nextTick(() => {
        const replyElement = document.getElementById(`reply-${newReplyId.value}`)
        if (replyElement) {
          setTimeout(() => {
            replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // 添加高亮效果
            replyElement.classList.add('highlight-reply')
            setTimeout(() => {
              replyElement.classList.remove('highlight-reply')
            }, 2000)
          }, 300)
        }
      })
    }
  } catch (error) {
    console.error('发送回复失败:', error)
    alert('发送失败，请重试')
  } finally {
    isPosting.value = false
  }
}

// Load user role in the group
const loadUserRole = async () => {
  try {
    const response = await $fetch(`/api/study-groups/${groupId}/members`, {
      headers: authStore.getAuthHeader()
    })

    if (response.data && authStore.user) {
      const membership = response.data.find(m => m.user.id === authStore.user.id)
      if (membership) {
        userRole.value = membership.role
      }
    }
  } catch (error) {
    console.error('加载用户角色失败:', error)
  }
}

// Toggle pin status
const togglePin = async () => {
  if (isTogglingPin.value) return

  isTogglingPin.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/pin`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    console.log('[Toggle Pin] 操作成功:', result)

    // Update local post state
    if (post.value) {
      post.value.isPinned = result.isPinned
    }

    // Show success message
    alert(result.message || (result.isPinned ? '帖子已置顶' : '已取消置顶'))
  } catch (error) {
    console.error('[Toggle Pin] 操作失败:', error)
    if (error.statusCode === 403) {
      alert('只有管理员可以置顶帖子')
    } else {
      alert('操作失败，请重试')
    }
  } finally {
    isTogglingPin.value = false
  }
}

// Toggle featured status
const toggleFeatured = async () => {
  if (isTogglingFeatured.value) return

  isTogglingFeatured.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/featured`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    console.log('[Toggle Featured] 操作成功:', result)

    // Update local post state
    if (post.value) {
      post.value.isFeatured = result.isFeatured
    }

    // Show success message
    alert(result.message || (result.isFeatured ? '已设为精华帖' : '已取消精华帖'))
  } catch (error) {
    console.error('[Toggle Featured] 操作失败:', error)
    if (error.statusCode === 403) {
      alert('只有管理员和版主可以设置精华帖')
    } else {
      alert('操作失败，请重试')
    }
  } finally {
    isTogglingFeatured.value = false
  }
}

const toggleLock = async () => {
  if (isTogglingLock.value) return

  isTogglingLock.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/lock`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    console.log('[Toggle Lock] 操作成功:', result)

    // Update local post state
    if (post.value) {
      post.value.isLocked = result.isLocked
      post.value.lockedAt = result.lockedAt
    }

    // Show success message
    alert(result.message || (result.isLocked ? '帖子已锁定' : '已解锁帖子'))
  } catch (error) {
    console.error('[Toggle Lock] 操作失败:', error)
    if (error.statusCode === 403) {
      alert('只有管理员才能锁定帖子')
    } else {
      alert('操作失败，请重试')
    }
  } finally {
    isTogglingLock.value = false
  }
}

// Toggle bookmark
const toggleBookmark = async () => {
  try {
    console.log('[Bookmark] 切换收藏状态, postId:', postId)
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    console.log('[Bookmark] 操作成功:', result)

    // Update local post state
    if (post.value) {
      post.value.isBookmarked = result.isBookmarked
    }
  } catch (error) {
    console.error('[Bookmark] 操作失败:', error)
    if (error.statusCode === 403) {
      alert('只有小组成员可以收藏帖子')
    } else {
      alert('收藏操作失败，请重试')
    }
  }
}

// Edit Post functions
const startEditPost = () => {
  isEditingPost.value = true
  editPostTitle.value = post.value.title || ''
  editPostContent.value = post.value.content || ''
}

const cancelEditPost = () => {
  isEditingPost.value = false
  editPostTitle.value = ''
  editPostContent.value = ''
}

const savePostEdit = async () => {
  if (!editPostContent.value.trim()) {
    alert('帖子内容不能为空')
    return
  }

  isSavingPost.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/edit`, {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: {
        title: editPostTitle.value,
        content: editPostContent.value,
        type: post.value.type
      }
    })

    console.log('[Edit Post] 编辑成功:', result)

    // Update local post state
    if (post.value && result.post) {
      post.value.title = result.post.title
      post.value.content = result.post.content
      post.value.updatedAt = result.post.updatedAt
    }

    isEditingPost.value = false
    alert(result.message || '帖子已更新')
  } catch (error) {
    console.error('[Edit Post] 编辑失败:', error)
    if (error.statusCode === 403) {
      alert('只有帖子作者或管理员可以编辑帖子')
    } else {
      alert('编辑失败，请重试')
    }
  } finally {
    isSavingPost.value = false
  }
}

// Edit Reply functions
const startEditReply = (reply) => {
  editingReplyId.value = reply.id
  editReplyContent.value = reply.content || ''
}

const cancelEditReply = () => {
  editingReplyId.value = null
  editReplyContent.value = ''
}

const saveReplyEdit = async (replyId) => {
  if (!editReplyContent.value.trim()) {
    alert('回复内容不能为空')
    return
  }

  isSavingReply.value = true
  try {
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/replies/${replyId}/edit`, {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: {
        content: editReplyContent.value
      }
    })

    console.log('[Edit Reply] 编辑成功:', result)

    // Update local reply state
    const replyIndex = replies.value.findIndex(r => r.id === replyId)
    if (replyIndex !== -1 && result.reply) {
      replies.value[replyIndex].content = result.reply.content
      replies.value[replyIndex].updatedAt = result.reply.updatedAt
    }

    editingReplyId.value = null
    editReplyContent.value = ''
    alert(result.message || '回复已更新')
  } catch (error) {
    console.error('[Edit Reply] 编辑失败:', error)
    if (error.statusCode === 403) {
      alert('只有回复作者或管理员可以编辑回复')
    } else {
      alert('编辑失败，请重试')
    }
  } finally {
    isSavingReply.value = false
  }
}

// Toggle best answer
const toggleBestAnswer = async (replyId) => {
  try {
    console.log('[Best Answer] 切换最佳答案, replyId:', replyId)
    const result = await $fetch(`/api/study-groups/${groupId}/posts/${postId}/replies/${replyId}/best-answer`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    console.log('[Best Answer] 操作成功:', result)

    // Reload post to get updated reply data and post status
    await loadPost()

    // Show success message
    alert(result.message || (result.isBestAnswer ? '已设为最佳答案' : '已取消最佳答案'))
  } catch (error) {
    console.error('[Best Answer] 操作失败:', error)
    if (error.statusCode === 403) {
      alert('只有帖子作者或管理员可以设置最佳答案')
    } else if (error.statusCode === 400) {
      alert(error.data?.message || '只有问题类型的帖子可以设置最佳答案')
    } else {
      alert('设置最佳答案失败，请重试')
    }
  }
}

// Quote post
const quotePost = () => {
  const author = post.value.author?.name || post.value.author?.email
  const content = post.value.content

  // 格式化引用文本，使用更简洁的BBS风格
  const lines = content.split('\n')
  const quotedContent = lines.map(line => `> ${line}`).join('\n')
  const quotedText = `引用来自 1楼 @${author}：\n${quotedContent}\n\n`

  replyContent.value = quotedText

  // Scroll to reply editor and focus
  nextTick(() => {
    if (replyEditorRef.value) {
      replyEditorRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 延迟聚焦，确保滚动完成
      setTimeout(() => {
        replyEditorRef.value.focus()
      }, 300)
    }
  })
}

// Quote reply
const quoteReply = (reply) => {
  const author = reply.author?.name || reply.author?.email || '未知用户'
  const content = reply.content
  const floorNumber = reply.floorNumber

  // 格式化引用文本，使用更简洁的BBS风格
  const lines = content.split('\n')
  const quotedContent = lines.map(line => `> ${line}`).join('\n')
  const quotedText = `引用来自 ${floorNumber}楼 @${author}：\n${quotedContent}\n\n`

  replyContent.value = quotedText

  // Scroll to reply editor and focus
  nextTick(() => {
    if (replyEditorRef.value) {
      replyEditorRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 延迟聚焦，确保滚动完成
      setTimeout(() => {
        replyEditorRef.value.focus()
      }, 300)
    }
  })
}

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

<style scoped>
/* 新回复高亮效果 */
.highlight-reply {
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(59, 130, 246, 0.3);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    transform: scale(1);
  }
}
</style>
