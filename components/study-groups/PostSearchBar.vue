<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
    <!-- 搜索输入框 -->
    <div class="flex gap-3 mb-4">
      <div class="flex-1 relative">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索帖子标题或内容..."
          class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="handleSearch"
        />
        <svg
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <button
        @click="handleSearch"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        搜索
      </button>
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        清除
      </button>
    </div>

    <!-- 高级筛选 -->
    <div class="flex items-center gap-2 mb-3">
      <button
        @click="showAdvanced = !showAdvanced"
        class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
            clip-rule="evenodd"
          />
        </svg>
        {{ showAdvanced ? '收起筛选' : '高级筛选' }}
      </button>
    </div>

    <!-- 筛选选项 -->
    <div v-if="showAdvanced" class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <!-- 帖子类型 -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">帖子类型</label>
        <select
          v-model="filters.type"
          class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部类型</option>
          <option value="discussion">💬 讨论</option>
          <option value="question">❓ 问题</option>
          <option value="resource">📚 资源</option>
          <option value="announcement">📢 公告</option>
        </select>
      </div>

      <!-- 帖子状态 -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">问题状态</label>
        <select
          v-model="filters.status"
          class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部状态</option>
          <option value="pending">🔵 待解决</option>
          <option value="solved">✅ 已解决</option>
        </select>
      </div>

      <!-- 特殊标记 -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">特殊标记</label>
        <select
          v-model="filters.special"
          class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部帖子</option>
          <option value="featured">⭐️ 精华帖</option>
          <option value="pinned">📌 置顶帖</option>
        </select>
      </div>

      <!-- 排序方式 -->
      <div>
        <label class="block text-xs text-gray-600 mb-1">排序方式</label>
        <select
          v-model="filters.sortBy"
          class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="latest">最新发布</option>
          <option value="hot">最多回复</option>
          <option value="views">最多浏览</option>
          <option value="likes">最多点赞</option>
        </select>
      </div>
    </div>

    <!-- 活动筛选标签 -->
    <div v-if="hasActiveFilters && !showAdvanced" class="flex flex-wrap gap-2 mt-3">
      <span
        v-if="searchKeyword"
        class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
      >
        关键词: "{{ searchKeyword }}"
        <button @click="searchKeyword = ''; handleSearch()" class="hover:text-blue-900">×</button>
      </span>
      <span
        v-if="filters.type !== 'all'"
        class="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
      >
        类型: {{ getTypeLabel(filters.type) }}
        <button @click="filters.type = 'all'; handleSearch()" class="hover:text-purple-900">×</button>
      </span>
      <span
        v-if="filters.status !== 'all'"
        class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
      >
        状态: {{ getStatusLabel(filters.status) }}
        <button @click="filters.status = 'all'; handleSearch()" class="hover:text-green-900">×</button>
      </span>
      <span
        v-if="filters.special !== 'all'"
        class="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
      >
        {{ getSpecialLabel(filters.special) }}
        <button @click="filters.special = 'all'; handleSearch()" class="hover:text-amber-900">×</button>
      </span>
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

const emit = defineEmits(['search'])

const searchKeyword = ref('')
const showAdvanced = ref(false)
const filters = ref({
  type: 'all',
  status: 'all',
  special: 'all',
  sortBy: 'latest'
})

const hasActiveFilters = computed(() => {
  return (
    searchKeyword.value ||
    filters.value.type !== 'all' ||
    filters.value.status !== 'all' ||
    filters.value.special !== 'all'
  )
})

const handleSearch = () => {
  const searchParams = {
    keyword: searchKeyword.value,
    type: filters.value.type,
    status: filters.value.status,
    sortBy: filters.value.sortBy
  }

  // 处理特殊标记
  if (filters.value.special === 'featured') {
    searchParams.isFeatured = 'true'
  } else if (filters.value.special === 'pinned') {
    searchParams.isPinned = 'true'
  }

  emit('search', searchParams)
}

const clearFilters = () => {
  searchKeyword.value = ''
  filters.value = {
    type: 'all',
    status: 'all',
    special: 'all',
    sortBy: 'latest'
  }
  handleSearch()
}

const getTypeLabel = (type) => {
  const labels = {
    discussion: '💬 讨论',
    question: '❓ 问题',
    resource: '📚 资源',
    announcement: '📢 公告'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '🔵 待解决',
    solved: '✅ 已解决'
  }
  return labels[status] || status
}

const getSpecialLabel = (special) => {
  const labels = {
    featured: '⭐️ 精华帖',
    pinned: '📌 置顶帖'
  }
  return labels[special] || special
}

// 监听筛选变化
watch(filters, () => {
  if (showAdvanced.value) {
    handleSearch()
  }
}, { deep: true })
</script>
