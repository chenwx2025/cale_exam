<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">📝 我的考试</h1>
            <p class="text-gray-600">管理您的所有考试记录</p>
          </div>
          <NuxtLink
            to="/exam/config"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            创建新考试
          </NuxtLink>
        </div>

        <!-- 筛选器 -->
        <div class="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <!-- 考试类型筛选 -->
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-3 block">🎯 考试类型</label>
            <div class="flex flex-wrap gap-2">
              <button
                @click="filterMode = 'all'"
                :class="filterMode === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all"
              >
                全部
              </button>
              <button
                @click="filterMode = 'ai_generated'"
                :class="filterMode === 'ai_generated'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <span>🟣</span> AI生成
              </button>
              <button
                @click="filterMode = 'mock'"
                :class="filterMode === 'mock'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <span>🟢</span> 全真模拟
              </button>
              <button
                @click="filterMode = 'manual'"
                :class="filterMode === 'manual'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <span>🟠</span> 手动配置
              </button>
              <button
                @click="filterMode = 'exam'"
                :class="filterMode === 'exam'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <span>🔵</span> 普通考试
              </button>
            </div>
          </div>

          <!-- 状态筛选 -->
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-3 block">📊 考试状态</label>
            <div class="flex flex-wrap gap-2">
              <button
                @click="filterStatus = 'all'"
                :class="filterStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all"
              >
                全部
              </button>
              <button
                @click="filterStatus = 'not_started'"
                :class="filterStatus === 'not_started'
                  ? 'bg-gray-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <span>⭕</span> 未开始
              </button>
              <button
                @click="filterStatus = 'in_progress'"
                :class="filterStatus === 'in_progress'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <span>🔄</span> 进行中
              </button>
              <button
                @click="filterStatus = 'completed'"
                :class="filterStatus === 'completed'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <span>✅</span> 已完成
              </button>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-xl p-4 shadow-md">
            <div class="text-sm text-gray-600 mb-1">总考试数</div>
            <div class="text-2xl font-bold text-blue-600">{{ allExams.length }}</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-md">
            <div class="text-sm text-gray-600 mb-1">未开始</div>
            <div class="text-2xl font-bold text-gray-600">{{ examsCountByStatus.not_started }}</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-md">
            <div class="text-sm text-gray-600 mb-1">进行中</div>
            <div class="text-2xl font-bold text-yellow-600">{{ examsCountByStatus.in_progress }}</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-md">
            <div class="text-sm text-gray-600 mb-1">已完成</div>
            <div class="text-2xl font-bold text-green-600">{{ examsCountByStatus.completed }}</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">加载中...</p>
      </div>

      <!-- Exams List -->
      <div v-else-if="filteredExams.length > 0" class="space-y-4">
        <div
          v-for="exam in filteredExams"
          :key="exam.id"
          class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border-l-4"
          :class="getExamBorderColor(exam)"
        >
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-gray-900">{{ exam.title }}</h3>

                  <!-- Type Badge -->
                  <span
                    v-if="exam.mode === 'ai_generated'"
                    class="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full"
                  >
                    🟣 AI生成
                  </span>
                  <span
                    v-else-if="exam.mode === 'mock'"
                    class="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full"
                  >
                    🟢 全真模拟
                  </span>
                  <span
                    v-else-if="exam.mode === 'manual'"
                    class="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full"
                  >
                    🟠 手动配置
                  </span>
                  <span
                    v-else
                    class="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full"
                  >
                    🔵 普通考试
                  </span>

                  <!-- Status Badge -->
                  <span
                    v-if="exam.status === 'not_started'"
                    class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full"
                  >
                    ⭕ 未开始
                  </span>
                  <span
                    v-else-if="exam.status === 'in_progress'"
                    class="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full animate-pulse"
                  >
                    🔄 进行中
                  </span>
                  <span
                    v-else-if="exam.status === 'completed'"
                    class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
                  >
                    ✅ 已完成
                  </span>
                </div>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="text-xs text-blue-600 font-semibold mb-1">题目数量</div>
                <div class="text-xl font-bold text-blue-700">{{ exam.questionCount }}</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-3">
                <div class="text-xs text-purple-600 font-semibold mb-1">考试时长</div>
                <div class="text-xl font-bold text-purple-700">{{ exam.duration }}分</div>
              </div>
              <div
                v-if="exam.status === 'completed' && exam.score !== null"
                class="bg-green-50 rounded-lg p-3"
              >
                <div class="text-xs text-green-600 font-semibold mb-1">分数</div>
                <div class="text-xl font-bold text-green-700">{{ exam.score }}/{{ exam.questionCount }}</div>
              </div>
              <div
                v-if="exam.status === 'completed' && exam.score !== null"
                class="bg-orange-50 rounded-lg p-3"
              >
                <div class="text-xs text-orange-600 font-semibold mb-1">正确率</div>
                <div class="text-xl font-bold text-orange-700">{{ getAccuracy(exam) }}%</div>
              </div>
              <div
                v-if="exam.status === 'in_progress'"
                class="bg-yellow-50 rounded-lg p-3"
              >
                <div class="text-xs text-yellow-600 font-semibold mb-1">答题进度</div>
                <div class="text-xl font-bold text-yellow-700">{{ exam.answeredCount || 0 }}/{{ exam.questionCount }}</div>
              </div>
            </div>

            <!-- Time Info -->
            <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>创建: {{ formatDate(exam.createdAt) }}</span>
              </div>
              <div v-if="exam.completedAt" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>完成: {{ formatDate(exam.completedAt) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                v-if="exam.status === 'not_started'"
                @click="startExam(exam.id)"
                class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                开始考试
              </button>

              <button
                v-if="exam.status === 'in_progress'"
                @click="continueExam(exam.id)"
                class="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                </svg>
                继续考试
              </button>

              <button
                v-if="exam.status === 'completed'"
                @click="viewResult(exam.id)"
                class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                查看结果
              </button>

              <button
                @click="deleteExam(exam.id)"
                class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                title="删除考试"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">暂无考试记录</h3>
        <p class="text-gray-600 mb-6">
          {{ filterMode !== 'all' || filterStatus !== 'all'
            ? '当前筛选条件下没有考试记录'
            : '还没有任何考试记录，创建您的第一个考试吧！'
          }}
        </p>
        <NuxtLink
          to="/exam/config"
          class="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          创建新考试
        </NuxtLink>
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
const examStore = useExamStore()
const router = useRouter()
const dialog = useDialog()

interface Exam {
  id: string
  title: string
  questionCount: number
  duration: number
  mode: string | null
  status: string
  score: number | null
  createdAt: string
  completedAt: string | null
  answeredCount?: number
}

const allExams = ref<Exam[]>([])
const loading = ref(true)
const filterMode = ref<'all' | 'ai_generated' | 'mock' | 'manual' | 'exam'>('all')
const filterStatus = ref<'all' | 'not_started' | 'in_progress' | 'completed'>('all')

// 筛选后的考试列表
const filteredExams = computed(() => {
  let exams = allExams.value

  // 按类型筛选
  if (filterMode.value !== 'all') {
    exams = exams.filter(exam => exam.mode === filterMode.value)
  }

  // 按状态筛选
  if (filterStatus.value !== 'all') {
    exams = exams.filter(exam => exam.status === filterStatus.value)
  }

  return exams
})

// 统计各状态的考试数量
const examsCountByStatus = computed(() => {
  return {
    not_started: allExams.value.filter(e => e.status === 'not_started').length,
    in_progress: allExams.value.filter(e => e.status === 'in_progress').length,
    completed: allExams.value.filter(e => e.status === 'completed').length
  }
})

// 获取考试边框颜色
const getExamBorderColor = (exam: Exam) => {
  if (exam.status === 'completed') return 'border-green-500'
  if (exam.status === 'in_progress') return 'border-yellow-500'
  return 'border-gray-300'
}

// 计算正确率
const getAccuracy = (exam: Exam) => {
  if (!exam.score || !exam.questionCount) return 0
  return Math.round((exam.score / exam.questionCount) * 100)
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取考试列表
const fetchExams = async () => {
  try {
    loading.value = true
    const headers = authStore.getAuthHeader()
    const requestOptions: any = {
      method: 'GET',
      query: {
        examType: examStore.currentExamType,
        // 添加时间戳防止缓存
        _t: Date.now()
      }
    }

    if (headers.Authorization) {
      requestOptions.headers = { Authorization: headers.Authorization }
    }

    const response = await $fetch<{ success: boolean, questionSets: Exam[] }>('/api/question-sets/list', requestOptions)

    if (response.success) {
      allExams.value = response.questionSets
    }
  } catch (error: any) {
    console.error('Failed to fetch exams:', error)

    // 检查是否是认证错误
    if (error.statusCode === 401) {
      await dialog.alert({
        message: '您的登录已过期，请重新登录',
        type: 'warning',
        title: '需要登录'
      })
      router.push('/login')
    } else {
      await dialog.alert({
        message: '获取考试列表失败: ' + (error.data?.message || error.message),
        type: 'error',
        title: '加载失败'
      })
    }
  } finally {
    loading.value = false
  }
}

// 开始考试
const startExam = (examId: string) => {
  router.push(`/exam/${examId}`)
}

// 继续考试
const continueExam = (examId: string) => {
  router.push(`/exam/${examId}`)
}

// 查看结果
const viewResult = (examId: string) => {
  router.push(`/exam/result/${examId}`)
}

// 删除考试
const deleteExam = async (examId: string) => {
  const exam = allExams.value.find(e => e.id === examId)
  const examTitle = exam ? exam.title : '此考试'

  const confirmed = await dialog.confirm({
    message: `确定要删除"${examTitle}"吗？删除后无法恢复。`,
    type: 'danger',
    title: '删除确认',
    confirmText: '删除',
    cancelText: '取消'
  })

  if (!confirmed) {
    return
  }

  try {
    const headers = authStore.getAuthHeader()
    const requestOptions: any = {
      method: 'POST',
      body: {
        examIds: [examId]
      }
    }

    if (headers.Authorization) {
      requestOptions.headers = { Authorization: headers.Authorization }
    }

    console.log('发送删除请求:', { examId, examTitle })
    const response: any = await $fetch('/api/question-sets/delete', requestOptions)

    console.log('删除响应:', response)

    // 显示成功消息
    await dialog.alert({
      message: `成功删除"${examTitle}"`,
      type: 'success',
      title: '删除成功'
    })

    // 重新获取列表，确保数据一致性
    await fetchExams()
  } catch (error: any) {
    console.error('Delete error:', error)

    // 检查错误状态码
    if (error.statusCode === 401) {
      await dialog.alert({
        message: '您的登录已过期，请重新登录后再试',
        type: 'warning',
        title: '需要登录'
      })
      // 跳转到登录页
      router.push('/login')
    } else if (error.statusCode === 403) {
      await dialog.alert({
        message: '您无权删除此考试\n\n可能原因：\n1. 此考试不属于您的账号\n2. 请确认您已登录正确的账号',
        type: 'error',
        title: '删除失败'
      })
    } else if (error.statusCode === 404) {
      await dialog.alert({
        message: '找不到此考试（可能已被删除）\n\n页面将自动刷新...',
        type: 'warning',
        title: '考试不存在'
      })
      // 刷新列表
      await fetchExams()
    } else {
      await dialog.alert({
        message: '删除失败: ' + (error.data?.message || error.message || '未知错误'),
        type: 'error',
        title: '删除失败'
      })
    }
  }
}

onMounted(() => {
  fetchExams()
})

// 监听考试类型变化
watch(() => examStore.currentExamType, () => {
  fetchExams()
})
</script>
