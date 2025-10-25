<template>
  <div class="space-y-6">
    <!-- Toolbar: Search, Filter, Sort -->
    <div class="bg-white rounded-xl shadow-md p-4">
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
            @change="loadNotes"
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

          <!-- Sort -->
          <select
            v-model="sortBy"
            @change="loadNotes"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="latest">最新发布</option>
            <option value="hot">最热门</option>
            <option value="mostLiked">最多点赞</option>
            <option value="mostViewed">最多浏览</option>
            <option value="mostFavorited">最多收藏</option>
          </select>

          <!-- View Mode -->
          <select
            v-model="viewMode"
            @change="loadNotes"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">已发布</option>
            <option value="my">我的笔记</option>
            <option value="draft">我的草稿</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Create Note Button -->
    <button
      @click="goToCreate"
      class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      创建学习笔记
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-4 text-gray-600">加载笔记中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="notes.length === 0" class="bg-white rounded-xl shadow-md p-12 text-center">
      <div class="text-6xl mb-4">📝</div>
      <p class="text-gray-500 text-lg">{{ searchQuery ? '没有找到匹配的笔记' : '还没有笔记，来创建第一篇吧！' }}</p>
    </div>

    <!-- Notes Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :group-id="groupId"
        @updated="loadNotes"
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

const notes = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('latest')
const viewMode = ref('')
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

    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    if (selectedCategory.value) {
      params.append('category', selectedCategory.value)
    }
    if (sortBy.value) {
      params.append('sortBy', sortBy.value)
    }
    if (viewMode.value) {
      params.append('status', viewMode.value)
    }

    const result = await $fetch(`/api/study-groups/${props.groupId}/notes?${params.toString()}`, {
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
  router.push(`/study-groups/${props.groupId}/notes/new`)
}

// Watch for changes
watch([searchQuery], () => {
  pagination.value.page = 1
})

// Initial load
onMounted(() => {
  loadNotes()
})
</script>

<style scoped>
/* Styles inherited from global */
</style>
