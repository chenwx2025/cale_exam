<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">学习小组</h1>
          <p class="text-gray-600">加入学习小组，与同学一起备考</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/study-groups/invitations"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-lg transition-all border-2 border-blue-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            我的邀请
          </NuxtLink>
          <NuxtLink
            to="/study-groups/create"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            创建小组
          </NuxtLink>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索CALE小组名称..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          <div class="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-semibold whitespace-nowrap">
            CALE 考试
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <!-- Groups Grid -->
      <div v-else-if="groups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="group in groups"
          :key="group.id"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-blue-500"
        >
          <!-- Group Header -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ group.name }}</h3>
                <div class="flex items-center gap-2 mb-3">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="{
                      'bg-blue-100 text-blue-700': group.examType === 'cale',
                      'bg-green-100 text-green-700': group.examType === 'nccaom'
                    }"
                  >
                    {{ group.examType === 'cale' ? 'CALE' : 'NCCAOM' }}
                  </span>
                  <span
                    v-if="group.isPrivate"
                    class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full"
                  >
                    🔒 私密
                  </span>
                </div>
              </div>
            </div>

            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ group.description || '暂无描述' }}
            </p>

            <!-- Group Stats -->
            <div class="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <span>{{ group.memberCount }}/{{ group.maxMembers }} 成员</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
                <span>{{ group.postCount }} 帖子</span>
              </div>
            </div>

            <!-- Member Status Badge -->
            <div v-if="group.isMember" class="mb-4">
              <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                已加入
              </span>
            </div>

            <!-- Action Button -->
            <NuxtLink
              :to="`/study-groups/${group.id}`"
              class="block w-full text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ group.isMember ? '进入小组' : '查看详情' }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">暂无学习小组</h3>
        <p class="text-gray-500 mb-4">{{ searchQuery ? '没有找到匹配的小组' : '还没有人创建学习小组' }}</p>
        <NuxtLink
          to="/study-groups/create"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          创建第一个小组
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <span class="text-gray-600">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 页
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['exam-access' as any],
  layout: 'exam'
})

const authStore = useAuthStore()

// Data
const groups = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedExamType = ref('cale')
const pagination = ref(null)
const currentPage = ref(1)

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadGroups()
  }, 500)
}

// Load groups
const loadGroups = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/study-groups', {
      headers: authStore.getAuthHeader() as HeadersInit,
      query: {
        examType: selectedExamType.value,
        search: searchQuery.value,
        page: currentPage.value,
        pageSize: 12
      }
    }) as any

    if (response.success) {
      groups.value = response.data
      pagination.value = response.pagination
    }
  } catch (error: any) {
    console.error('加载学习小组失败:', error)
    alert('加载学习小组失败: ' + (error.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

// Change page
const changePage = (page: number) => {
  currentPage.value = page
  loadGroups()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Load on mount
onMounted(() => {
  loadGroups()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
