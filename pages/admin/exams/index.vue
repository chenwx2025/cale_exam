<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">考试管理</h1>
      <p class="text-gray-600 mt-2">查看和管理所有考试类型的统计信息</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- 考试统计数据 -->
    <div v-else-if="examData" class="space-y-6">
      <!-- 总览卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-4xl font-bold">{{ examData.summary.totalExamTypes }}</div>
          <div class="text-sm text-blue-100 mt-2">考试类型</div>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-4xl font-bold">{{ examData.summary.totalUsers }}</div>
          <div class="text-sm text-purple-100 mt-2">总用户数</div>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-4xl font-bold">{{ examData.summary.totalQuestions }}</div>
          <div class="text-sm text-green-100 mt-2">总题目数</div>
        </div>
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-4xl font-bold">{{ examData.summary.totalExams }}</div>
          <div class="text-sm text-orange-100 mt-2">总考试数</div>
        </div>
      </div>

      <!-- 考试类型详细列表 -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">考试类型详情</h2>
        </div>

        <div class="divide-y divide-gray-200">
          <div
            v-for="exam in examData.exams"
            :key="exam.examType"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <!-- 考试头部信息 -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h3 class="text-2xl font-bold text-gray-900">{{ exam.name }}</h3>
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full uppercase">
                    {{ exam.examType }}
                  </span>
                </div>
                <p class="text-gray-600 mt-1">{{ exam.fullName }}</p>
                <p v-if="exam.description" class="text-gray-500 text-sm mt-2">{{ exam.description }}</p>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-2 ml-4">
                <NuxtLink
                  :to="`/admin/questions?examType=${exam.examType}`"
                  class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  管理题目
                </NuxtLink>
                <NuxtLink
                  :to="`/admin/categories?examType=${exam.examType}`"
                  class="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  管理分类
                </NuxtLink>
              </div>
            </div>

            <!-- 统计数据网格 -->
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <!-- 订阅用户数 -->
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-blue-600">{{ exam.stats.subscribedUsers }}</div>
                <div class="text-xs text-gray-600 mt-1">订阅用户</div>
              </div>

              <!-- 题目总数 -->
              <div class="bg-purple-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-purple-600">{{ exam.stats.totalQuestions }}</div>
                <div class="text-xs text-gray-600 mt-1">题目总数</div>
              </div>

              <!-- 已完成考试数 -->
              <div class="bg-green-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-green-600">{{ exam.stats.totalExamsCompleted }}</div>
                <div class="text-xs text-gray-600 mt-1">已完成考试</div>
              </div>

              <!-- 进行中考试数 -->
              <div class="bg-yellow-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-yellow-600">{{ exam.stats.totalExamsInProgress }}</div>
                <div class="text-xs text-gray-600 mt-1">进行中考试</div>
              </div>

              <!-- 分类数量 -->
              <div class="bg-indigo-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-indigo-600">{{ exam.stats.totalCategories }}</div>
                <div class="text-xs text-gray-600 mt-1">分类数量</div>
              </div>

              <!-- 平均分 -->
              <div class="bg-pink-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-pink-600">{{ exam.stats.averageScore }}%</div>
                <div class="text-xs text-gray-600 mt-1">平均分</div>
              </div>
            </div>

            <!-- 难度分布 -->
            <div v-if="exam.stats.questionsByDifficulty.length > 0" class="mt-4">
              <div class="text-sm font-medium text-gray-700 mb-2">题目难度分布:</div>
              <div class="flex gap-3">
                <div
                  v-for="diff in exam.stats.questionsByDifficulty"
                  :key="diff.difficulty"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getDifficultyClass(diff.difficulty)"
                >
                  {{ getDifficultyLabel(diff.difficulty) }}: {{ diff.count }}
                </div>
              </div>
            </div>

            <!-- 最近活动 -->
            <div v-if="exam.stats.recentActivityLast7Days > 0" class="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <span>最近7天有 <strong class="text-gray-900">{{ exam.stats.recentActivityLast7Days }}</strong> 次考试活动</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p class="text-red-600">加载考试数据失败，请刷新页面重试</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

// 类型定义
interface ExamStats {
  subscribedUsers: number
  totalQuestions: number
  questionsByDifficulty: Array<{ difficulty: string; count: number }>
  totalExamsCompleted: number
  totalExamsInProgress: number
  totalExams: number
  totalCategories: number
  recentActivityLast7Days: number
  averageScore: number
}

interface ExamData {
  examType: string
  name: string
  fullName: string
  description: string
  stats: ExamStats
}

interface ExamResponse {
  summary: {
    totalExamTypes: number
    totalUsers: number
    totalQuestions: number
    totalExams: number
  }
  exams: ExamData[]
}

// 状态
const authStore = useAuthStore()
const loading = ref(true)
const examData = ref<ExamResponse | null>(null)

// 加载考试数据
const loadExamData = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/exams', {
      headers: authStore.getAuthHeader()
    })

    if (response.success) {
      examData.value = response.data
    }
  } catch (error) {
    console.error('Failed to load exam data:', error)
  } finally {
    loading.value = false
  }
}

// 难度样式映射
const getDifficultyClass = (difficulty: string) => {
  const classes = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  }
  return classes[difficulty as keyof typeof classes] || 'bg-gray-100 text-gray-700'
}

// 难度标签映射
const getDifficultyLabel = (difficulty: string) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[difficulty as keyof typeof labels] || difficulty
}

// 生命周期
onMounted(() => {
  loadExamData()
})
</script>
