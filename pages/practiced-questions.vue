<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ examStore.currentExam.name }} - 已做题目</h1>
        <p class="text-gray-600">复习您做过的所有题目</p>
      </div>

      <!-- 统计卡片 -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">已做题目总数</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">正确题目</p>
              <p class="text-3xl font-bold text-green-600 mt-1">{{ stats.correct }}</p>
              <p class="text-xs text-gray-500 mt-1">
                正确率: {{ stats.total > 0 ? Math.round(stats.correct / stats.total * 100) : 0 }}%
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">错误题目</p>
              <p class="text-3xl font-bold text-red-600 mt-1">{{ stats.wrong }}</p>
              <p class="text-xs text-gray-500 mt-1">
                错误率: {{ stats.total > 0 ? Math.round(stats.wrong / stats.total * 100) : 0 }}%
              </p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="flex flex-wrap gap-4">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="selectedFilter = filter.value; loadQuestions()"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedFilter === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- 题目列表 -->
      <div v-else-if="questions.length > 0" class="space-y-4 mb-8">
        <div
          v-for="item in questions"
          :key="item.questionId"
          class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div class="p-6">
            <!-- 题目头部 -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    item.isCorrect
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  ]">
                    {{ item.isCorrect ? '✓ 正确' : '✗ 错误' }}
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ item.question.category?.name || '未分类' }}
                  </span>
                  <span class="text-sm text-gray-500">
                    答题时间: {{ formatDate(item.answeredAt) }}
                  </span>
                </div>
                <div class="text-lg text-gray-900 font-medium" v-html="item.question.question"></div>
              </div>
            </div>

            <!-- 选项 -->
            <div class="space-y-2 mb-4">
              <div
                v-for="(option, index) in parseOptions(item.question.options)"
                :key="index"
                :class="[
                  'p-3 rounded-lg border-2',
                  option === item.question.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : option === item.userAnswer && !item.isCorrect
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200'
                ]"
              >
                <div class="flex items-center">
                  <span class="font-medium mr-2">{{ String.fromCharCode(65 + index) }}.</span>
                  <span>{{ option }}</span>
                  <span v-if="option === item.question.correctAnswer" class="ml-auto text-green-600 text-sm">
                    ✓ 正确答案
                  </span>
                  <span v-else-if="option === item.userAnswer" class="ml-auto text-red-600 text-sm">
                    ✗ 您的答案
                  </span>
                </div>
              </div>
            </div>

            <!-- 解析 -->
            <div v-if="item.question.explanation" class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p class="text-sm font-semibold text-blue-900 mb-1">解析</p>
              <p class="text-sm text-blue-800">{{ item.question.explanation }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-white rounded-xl shadow-lg p-12 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="text-xl font-bold text-gray-900 mb-2">还没有做过题目</h3>
        <p class="text-gray-600 mb-6">开始练习来记录您的进度吧</p>
        <NuxtLink
          to="/exam/config"
          class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          开始练习
        </NuxtLink>
      </div>

      <!-- 分页 -->
      <div v-if="pagination && pagination.totalPages > 1" class="flex justify-center gap-2 mt-8">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <div class="flex items-center gap-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              page === pagination.page
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'exam',
  middleware: ['exam-access' as any]
})

// 状态
const authStore = useAuthStore()
const examStore = useExamStore()
const selectedFilter = ref('all')
const loading = ref(false)
const questions = ref<any[]>([])
const stats = ref<any>(null)
const pagination = ref<any>(null)
const currentPage = ref(1)

// 筛选选项
const filters = [
  { label: '全部题目', value: 'all' },
  { label: '正确题目', value: 'correct' },
  { label: '错误题目', value: 'wrong' }
]

// 加载题目
const loadQuestions = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/questions/practiced', {
      params: {
        examType: examStore.currentExamType,
        page: currentPage.value,
        limit: 20,
        filter: selectedFilter.value
      },
      headers: authStore.getAuthHeader() as Record<string, string>
    })

    if (response.success) {
      questions.value = response.data.questions
      stats.value = response.data.stats
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Failed to load practiced questions:', error)
  } finally {
    loading.value = false
  }
}

// 换页
const changePage = (page: number) => {
  currentPage.value = page
  loadQuestions()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 计算可见页码
const visiblePages = computed(() => {
  if (!pagination.value) return []

  const total = pagination.value.totalPages
  const current = pagination.value.page
  const delta = 2
  const pages = []

  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.push(i)
  }

  return pages
})

// 解析选项
const parseOptions = (options: string) => {
  try {
    return JSON.parse(options)
  } catch {
    return []
  }
}

// 格式化日期
const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}

// 初始化
onMounted(() => {
  loadQuestions()
})
</script>
