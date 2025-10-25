<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Back Button -->
      <button
        @click="goBackToGroup"
        class="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
      >
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        <span class="font-medium">返回学习小组</span>
      </button>

      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">学习资料库</h1>
              <p class="text-sm text-gray-500">共享学习资料，共同进步</p>
            </div>
          </div>
          <button
            @click="showUploadModal = true"
            class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            上传资料
          </button>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="搜索资料标题或描述..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                @input="debouncedSearch"
              />
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <select
            v-model="filters.category"
            @change="loadResources"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">所有分类</option>
            <option value="textbook">教材</option>
            <option value="note">笔记</option>
            <option value="practice">练习题</option>
            <option value="video">视频教程</option>
            <option value="reference">参考资料</option>
            <option value="other">其他</option>
          </select>

          <!-- Type Filter -->
          <select
            v-model="filters.type"
            @change="loadResources"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">所有类型</option>
            <option value="document">文档</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="link">链接</option>
            <option value="archive">压缩包</option>
          </select>
        </div>

        <!-- Sort Options -->
        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <span class="text-sm text-gray-600">排序：</span>
          <button
            v-for="sort in sortOptions"
            :key="sort.value"
            @click="setSortBy(sort.value)"
            :class="[
              'px-3 py-1 rounded-lg text-sm font-medium transition-all',
              filters.sortBy === sort.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ sort.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载资料中...</p>
      </div>

      <!-- Resources Grid -->
      <div v-else-if="resources.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div
          v-for="resource in resources"
          :key="resource.id"
          class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
          @click="viewResource(resource.id)"
        >
          <!-- Thumbnail -->
          <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            <img
              v-if="resource.thumbnailUrl"
              :src="resource.thumbnailUrl"
              :alt="resource.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="resource.type === 'document'" fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                <path v-else-if="resource.type === 'video'" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                <path v-else-if="resource.type === 'link'" d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                <path v-else d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <!-- Type Badge -->
            <div class="absolute top-3 right-3 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded-full font-medium">
              {{ getTypeLabel(resource.type) }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
              {{ resource.title }}
            </h3>
            <p v-if="resource.description" class="text-sm text-gray-600 mb-3 line-clamp-2">
              {{ resource.description }}
            </p>

            <!-- Uploader -->
            <div class="flex items-center gap-2 mb-3">
              <div v-if="resource.uploader.avatar" class="w-6 h-6 rounded-full overflow-hidden">
                <img :src="resource.uploader.avatar" :alt="resource.uploader.name" class="w-full h-full object-cover"/>
              </div>
              <div v-else class="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                {{ resource.uploader.name?.charAt(0) || 'U' }}
              </div>
              <span class="text-xs text-gray-500">{{ resource.uploader.name }}</span>
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                {{ resource.viewCount }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                {{ resource.downloadCount }}
              </span>
              <span v-if="resource.averageRating" class="flex items-center gap-1">
                <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                {{ resource.averageRating.toFixed(1) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">📚</div>
        <p class="text-xl text-gray-600 mb-2">暂无资料</p>
        <p class="text-gray-500 mb-6">成为第一个上传资料的人吧！</p>
        <button
          @click="showUploadModal = true"
          class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
        >
          上传资料
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <span class="text-gray-600">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 页
        </span>
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>

      <!-- Upload Modal -->
      <ResourceUploadModal
        v-if="showUploadModal"
        :group-id="groupId"
        @close="showUploadModal = false"
        @uploaded="handleUploadSuccess"
      />
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const groupId = route.params.id

const loading = ref(true)
const resources = ref([])
const showUploadModal = ref(false)

const filters = ref({
  search: '',
  category: 'all',
  type: 'all',
  sortBy: 'createdAt'
})

const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0
})

const sortOptions = [
  { value: 'createdAt', label: '最新上传' },
  { value: 'downloadCount', label: '下载最多' },
  { value: 'averageRating', label: '评分最高' },
  { value: 'viewCount', label: '浏览最多' }
]

// Load resources
const loadResources = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      groupId,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      sortBy: filters.value.sortBy,
      sortOrder: 'desc'
    })

    if (filters.value.category !== 'all') {
      params.append('category', filters.value.category)
    }
    if (filters.value.type !== 'all') {
      params.append('type', filters.value.type)
    }
    if (filters.value.search) {
      params.append('search', filters.value.search)
    }

    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[ResourcesPage] 使用扁平路由 API 加载资料列表')
    const result = await $fetch(`/api/study-resources?${params}`, {
      headers: authStore.getAuthHeader()
    })

    if (result.success) {
      resources.value = result.data.resources
      pagination.value = result.data.pagination
      console.log('[ResourcesPage] 加载到资料数量:', resources.value.length)
    }
  } catch (error) {
    console.error('加载资料失败:', error)
  } finally {
    loading.value = false
  }
}

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadResources()
  }, 500)
}

// Set sort by
const setSortBy = (sortBy) => {
  filters.value.sortBy = sortBy
  pagination.value.page = 1
  loadResources()
}

// Go to page
const goToPage = (page) => {
  pagination.value.page = page
  loadResources()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// View resource
const viewResource = (resourceId) => {
  router.push(`/study-groups/${groupId}/resources/${resourceId}`)
}

// Handle upload success
const handleUploadSuccess = () => {
  showUploadModal.value = false
  pagination.value.page = 1
  loadResources()
}

// Go back to group
const goBackToGroup = () => {
  router.push(`/study-groups/${groupId}`)
}

// Get type label
const getTypeLabel = (type) => {
  const labels = {
    document: '文档',
    image: '图片',
    video: '视频',
    link: '链接',
    archive: '压缩包'
  }
  return labels[type] || '其他'
}

// Load resources on mount
onMounted(() => {
  loadResources()
})

// Reload when navigating back to this page
onActivated(() => {
  loadResources()
})

// Watch route to reload when coming back from resource detail page
watch(() => route.fullPath, (newPath, oldPath) => {
  const resourcesIndexPath = `/study-groups/${groupId}/resources`
  if (newPath === resourcesIndexPath && oldPath && oldPath !== newPath) {
    loadResources()
  }
})
</script>
