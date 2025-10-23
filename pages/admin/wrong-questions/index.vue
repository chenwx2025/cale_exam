<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">错题数据分析</h1>
      <p class="text-gray-600 mt-2">查看和分析用户错题数据</p>
    </div>

    <!-- 统计摘要 -->
    <div class="mb-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-white mb-4">错题统计概览</h2>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">总错题数</div>
          <div class="text-3xl font-bold text-white">{{ summary.totalWrongQuestions || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">独立题目</div>
          <div class="text-3xl font-bold text-white">{{ summary.uniqueQuestionCount || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">错题用户</div>
          <div class="text-3xl font-bold text-white">{{ summary.uniqueUserCount || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">人均错题</div>
          <div class="text-3xl font-bold text-white">{{ summary.avgWrongQuestionsPerUser || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">30天新增</div>
          <div class="text-3xl font-bold text-white">{{ summary.recentWrongQuestions || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">已掌握</div>
          <div class="text-3xl font-bold text-white">{{ summary.masteredCount || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 错题分布图表 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <!-- 按考试类型 -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">考试类型分布</h3>
        <div class="space-y-3">
          <div v-for="stat in summary.examTypeStats" :key="stat.examType" class="flex items-center justify-between">
            <span class="text-gray-700">{{ stat.examType === 'cale' ? 'CALE' : 'NCCAOM' }}</span>
            <span class="font-semibold text-gray-900">{{ stat.count }}</span>
          </div>
        </div>
      </div>

      <!-- 按难度 -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">难度分布</h3>
        <div class="space-y-3">
          <div v-for="stat in summary.difficultyStats" :key="stat.difficulty" class="flex items-center justify-between">
            <span class="text-gray-700">{{ getDifficultyText(stat.difficulty) }}</span>
            <span class="font-semibold text-gray-900">{{ stat.count }}</span>
          </div>
        </div>
      </div>

      <!-- 按领域（前5名） -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">高频领域 Top 5</h3>
        <div class="space-y-3">
          <div v-for="stat in topDomains" :key="stat.domain" class="flex items-center justify-between">
            <span class="text-gray-700 text-sm truncate">{{ stat.domain }}</span>
            <span class="font-semibold text-gray-900">{{ stat.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 错题最多的题目 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">错误最多的题目 Top 10</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">题目</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">领域</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">难度</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">考试类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">错误次数</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">错误人数</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in summary.topWrongQuestions" :key="item.questionId" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white" :class="getRankClass(index)">
                  {{ index + 1 }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900 line-clamp-2">{{ item.question?.chineseQuestion || '题目已删除' }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-700">{{ item.question?.domain || '-' }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getDifficultyClass(item.question?.difficulty)">
                  {{ getDifficultyText(item.question?.difficulty) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="item.question?.examType === 'cale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                  {{ item.question?.examType === 'cale' ? 'CALE' : 'NCCAOM' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-lg font-bold text-red-600">{{ item.totalErrors }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-700">{{ item.userCount }} 人</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">考试类型</label>
          <select v-model="filters.examType" @change="loadWrongQuestions" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="cale">CALE (加州)</option>
            <option value="nccaom">NCCAOM (全国)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">领域</label>
          <select v-model="filters.domain" @change="loadWrongQuestions" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="domain1">Domain 1</option>
            <option value="domain2">Domain 2</option>
            <option value="domain3">Domain 3</option>
            <option value="domain3a">Domain 3A</option>
            <option value="domain3b">Domain 3B</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">排序</label>
          <select v-model="filters.sortBy" @change="loadWrongQuestions" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="errorCount">错误次数</option>
            <option value="lastErrorDate">最近错误时间</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索用户</label>
          <input
            v-model="filters.search"
            @input="onSearchInput"
            type="text"
            placeholder="用户名/邮箱"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>

    <!-- 错题列表 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">题目</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">领域</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">难度</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">错误次数</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最近错误</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="wq in wrongQuestions" :key="wq.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img v-if="wq.user.avatar" :src="wq.user.avatar" class="w-8 h-8 rounded-full" />
                <div v-else class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span class="text-red-600 font-semibold text-sm">{{ wq.user.name?.[0] || 'U' }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ wq.user.name || wq.user.nickname || '未命名' }}</div>
                  <div class="text-sm text-gray-500">{{ wq.user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 line-clamp-2 max-w-md">{{ wq.question.chineseQuestion }}</div>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm text-gray-700">{{ wq.question.domain }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getDifficultyClass(wq.question.difficulty)">
                {{ getDifficultyText(wq.question.difficulty) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="text-lg font-bold text-red-600">{{ wq.errorCount }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ formatDate(wq.lastErrorDate) }}</div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="wq.isMastered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                {{ wq.isMastered ? '已掌握' : '未掌握' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页控件 -->
      <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
        <div class="text-sm text-gray-700">
          共 {{ pagination.total }} 条记录，第 {{ pagination.page }} / {{ pagination.totalPages }} 页
        </div>
        <div class="flex gap-2">
          <button
            @click="goToPage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            @click="goToPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const authStore = useAuthStore()
const loading = ref(true)
const wrongQuestions = ref<any[]>([])
const summary = ref<any>({})
const filters = ref({ examType: 'all', domain: 'all', sortBy: 'errorCount', search: '' })
const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })

let searchTimeout: NodeJS.Timeout | null = null

const topDomains = computed(() => {
  if (!summary.value.domainStats) return []
  return summary.value.domainStats
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5)
})

const loadSummary = async () => {
  try {
    const response = await $fetch('/api/admin/wrong-questions/summary', {
      headers: authStore.getAuthHeader() as HeadersInit
    })
    if (response.success) {
      summary.value = response.data
    }
  } catch (error) {
    console.error('Failed to load summary:', error)
  }
}

const loadWrongQuestions = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/wrong-questions/list', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: {
        ...pagination.value,
        ...filters.value
      }
    })
    if (response.success) {
      wrongQuestions.value = response.wrongQuestions
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('Failed to load wrong questions:', error)
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    loadWrongQuestions()
  }, 500)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    loadWrongQuestions()
  }
}

const getDifficultyClass = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'hard':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return difficulty || '-'
  }
}

const getRankClass = (index: number) => {
  if (index === 0) return 'bg-yellow-500'
  if (index === 1) return 'bg-gray-400'
  if (index === 2) return 'bg-orange-600'
  return 'bg-red-500'
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadSummary()
  loadWrongQuestions()
})
</script>
