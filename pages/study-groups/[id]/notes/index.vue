<template>
  <div class="notes-page min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- 页头 -->
      <div class="mb-8">
        <!-- 返回按钮 -->
        <button
          @click="goBackToGroup"
          class="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="font-medium">返回学习小组</span>
        </button>

        <!-- 标题和操作按钮 -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">📝 学习笔记</h1>
            <p class="text-gray-600">共享知识，共同进步</p>
          </div>
          <button
            @click="goToCreate"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span class="text-xl">+</span>
            创建笔记
          </button>
        </div>
      </div>

      <!-- 筛选和搜索栏 -->
      <div class="bg-white rounded-xl shadow-md p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- 搜索框 -->
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索笔记标题、内容..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="loadNotes"
            />
          </div>

          <!-- 分类筛选 -->
          <select
            v-model="selectedCategory"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="loadNotes"
          >
            <option value="">全部分类</option>
            <option value="考点总结">📚 考点总结</option>
            <option value="错题整理">📋 错题整理</option>
            <option value="学习心得">💡 学习心得</option>
            <option value="知识脉络">🗺️ 知识脉络</option>
            <option value="记忆口诀">🎵 记忆口诀</option>
            <option value="临床案例">🏥 临床案例</option>
          </select>

          <!-- 排序 -->
          <select
            v-model="sortBy"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="loadNotes"
          >
            <option value="latest">最新发布</option>
            <option value="hot">最热门</option>
            <option value="mostLiked">最多点赞</option>
            <option value="mostViewed">最多浏览</option>
            <option value="mostFavorited">最多收藏</option>
          </select>

          <!-- 状态筛选 -->
          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="loadNotes"
          >
            <option value="published">已发布</option>
            <option value="my">我的笔记</option>
            <option value="draft">草稿</option>
          </select>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载笔记中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="notes.length === 0" class="bg-white rounded-xl shadow-md p-12 text-center">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-gray-500 text-lg mb-4">{{ searchQuery ? '没有找到匹配的笔记' : '还没有笔记，来创建第一篇吧！' }}</p>
        <button
          @click="goToCreate"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          创建笔记
        </button>
      </div>

      <!-- 笔记网格 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <NoteCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          :group-id="groupId"
          @updated="loadNotes"
        />
      </div>

      <!-- 分页 -->
      <div v-if="!loading && notes.length > 0" class="flex justify-center gap-2">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <span class="px-4 py-2 text-gray-700">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 页
        </span>
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
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

const notes = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('latest')
const statusFilter = ref('published')
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0
})

// 加载笔记列表
const loadNotes = async () => {
  loading.value = true
  try {
    const params = {
      groupId: groupId,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      sortBy: sortBy.value,
      status: statusFilter.value
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (selectedCategory.value) params.category = selectedCategory.value

    const queryString = new URLSearchParams(params).toString()

    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[NotesPage] 使用扁平路由 API 加载笔记')
    const result = await $fetch(`/api/study-notes?${queryString}`, {
      headers: authStore.getAuthHeader()
    })
    console.log('[NotesPage] API响应:', result)

    if (result.success) {
      notes.value = result.data.notes
      pagination.value = result.data.pagination
      console.log('[NotesPage] 加载到笔记数量:', notes.value.length)
    }
  } catch (error) {
    console.error('[NotesPage] 加载笔记失败:', error)
    if (error.statusCode === 403) {
      alert('需要加入小组才能查看笔记')
      router.push(`/study-groups/${groupId}`)
    }
  } finally {
    loading.value = false
  }
}

// 跳转页面
const goToPage = (page) => {
  pagination.value.page = page
  loadNotes()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 跳转到创建页面
const goToCreate = () => {
  router.push(`/study-groups/${groupId}/notes/new`)
}

const goBackToGroup = () => {
  router.push(`/study-groups/${groupId}`)
}

// 初始加载
onMounted(() => {
  loadNotes()
})

// 当从创建/编辑页面返回时重新加载
onActivated(() => {
  loadNotes()
})

// 监听路由变化，从子路由返回时重新加载
watch(() => route.fullPath, (newPath, oldPath) => {
  // 只在回到笔记列表页时重新加载
  const notesIndexPath = `/study-groups/${groupId}/notes`
  if (newPath === notesIndexPath && oldPath && oldPath !== newPath) {
    loadNotes()
  }
})
</script>

<style scoped>
/* 可以添加额外的样式 */
</style>
