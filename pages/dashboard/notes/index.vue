<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <!-- 返回按钮 -->
        <button
          @click="goBackToDashboard"
          class="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="font-medium">返回学习中心</span>
        </button>

        <h1 class="text-4xl font-bold text-gray-900 mb-2">我的学习笔记</h1>
        <p class="text-gray-600">记录你的学习心得，随时分享到小组</p>
      </div>

      <!-- Toolbar -->
      <div class="bg-white rounded-xl shadow-md p-4 mb-6">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Search Box -->
            <div class="flex-1">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索笔记标题、内容..."
                  @keyup.enter="loadNotes"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            <!-- Category Filter -->
            <select
              v-model="selectedCategory"
              @change="handleFilterChange"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部分类</option>
              <option value="考点总结">📚 考点总结</option>
              <option value="错题整理">📋 错题整理</option>
              <option value="学习心得">💡 学习心得</option>
              <option value="知识脉络">🗺️ 知识脉络</option>
              <option value="记忆口诀">🎵 记忆口诀</option>
              <option value="临床案例">🏥 临床案例</option>
            </select>

            <!-- Status Filter -->
            <select
              v-model="selectedStatus"
              @change="handleFilterChange"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部状态</option>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>

            <!-- Exam Type Filter -->
            <select
              v-model="selectedExamType"
              @change="handleFilterChange"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部考试</option>
              <option value="cale">CALE</option>
              <option value="nccaom">NCCAOM</option>
            </select>

            <!-- Sort -->
            <select
              v-model="sortBy"
              @change="handleFilterChange"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="latest">最新创建</option>
              <option value="updated">最近更新</option>
              <option value="oldest">最早创建</option>
              <option value="title">标题排序</option>
            </select>
          </div>

          <!-- Quick Filters -->
          <div class="flex items-center gap-2">
            <button
              @click="toggleFavoriteFilter"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isFavoriteFilter
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              ⭐ 收藏的
            </button>
            <button
              @click="togglePinnedFilter"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isPinnedFilter
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              📌 置顶的
            </button>
          </div>
        </div>
      </div>

      <!-- Create Note Button -->
      <button
        @click="goToCreate"
        class="w-full mb-6 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        创建新笔记
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载笔记中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="notes.length === 0" class="bg-white rounded-xl shadow-md p-12 text-center">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-gray-500 text-lg mb-4">
          {{ searchQuery || selectedCategory || selectedStatus ? '没有找到匹配的笔记' : '还没有笔记，来创建第一篇吧！' }}
        </p>
        <button
          v-if="!searchQuery && !selectedCategory && !selectedStatus"
          @click="goToCreate"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          创建笔记
        </button>
      </div>

      <!-- Notes Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PersonalNoteCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @updated="loadNotes"
          @edit="goToEdit"
          @delete="handleDelete"
        />
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-4 mt-8">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          上一页
        </button>
        <span class="text-gray-700 font-medium">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 页
        </span>
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const authStore = useAuthStore()

const notes = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedExamType = ref('')
const sortBy = ref('latest')
const isFavoriteFilter = ref(false)
const isPinnedFilter = ref(false)
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0
})

// Load notes
const loadNotes = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      pageSize: pagination.value.pageSize.toString()
    })

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (selectedCategory.value) params.append('category', selectedCategory.value)
    if (selectedStatus.value) params.append('status', selectedStatus.value)
    if (selectedExamType.value) params.append('examType', selectedExamType.value)
    if (sortBy.value) params.append('sortBy', sortBy.value)
    if (isFavoriteFilter.value) params.append('isFavorite', 'true')

    const result = await $fetch(`/api/personal-notes?${params.toString()}`, {
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      notes.value = result.data.notes
      pagination.value = result.data.pagination
    }
  } catch (error) {
    console.error('加载笔记失败:', error)
  } finally {
    loading.value = false
  }
}

// Navigate to page
const goToPage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.page = page
  loadNotes()
}

// Navigate to create note
const goToCreate = () => {
  router.push('/dashboard/notes/new')
}

// Navigate to edit note
const goToEdit = (noteId) => {
  router.push(`/dashboard/notes/${noteId}/edit`)
}

// Handle delete
const handleDelete = async (noteId) => {
  if (!confirm('确定要删除这篇笔记吗？')) return

  try {
    await $fetch(`/api/personal-notes/${noteId}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeader()
    })
    loadNotes()
  } catch (error) {
    console.error('删除笔记失败:', error)
    alert('删除笔记失败')
  }
}

// Handle filter change
const handleFilterChange = () => {
  pagination.value.page = 1
  loadNotes()
}

// Toggle favorite filter
const toggleFavoriteFilter = () => {
  isFavoriteFilter.value = !isFavoriteFilter.value
  handleFilterChange()
}

// Toggle pinned filter
const togglePinnedFilter = () => {
  isPinnedFilter.value = !isPinnedFilter.value
  handleFilterChange()
}

// Navigate back to dashboard
const goBackToDashboard = () => {
  router.push('/dashboard')
}

// Watch for search changes
watch([searchQuery], () => {
  pagination.value.page = 1
})

// Initial load
onMounted(() => {
  loadNotes()
})

// Reload when navigating back to this page
onActivated(() => {
  loadNotes()
})

// Watch route to reload when coming back from create/edit page
const route = useRoute()
watch(() => route.fullPath, (newPath, oldPath) => {
  // Only reload if we're on the notes index page
  if (newPath === '/dashboard/notes' && oldPath && oldPath !== newPath) {
    loadNotes()
  }
})
</script>
