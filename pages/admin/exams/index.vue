<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">考试记录管理</h1>
        <p class="text-gray-600 mt-2">查看和管理用户的考试记录</p>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-white mb-4">考试统计概览</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">总考试数</div>
          <div class="text-3xl font-bold text-white">{{ summary.totalExams || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">已完成</div>
          <div class="text-3xl font-bold text-white">{{ summary.completedExams || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">通过率</div>
          <div class="text-3xl font-bold text-white">{{ summary.passRate || 0 }}%</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">平均分</div>
          <div class="text-3xl font-bold text-white">{{ summary.avgScore || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">今日考试</div>
          <div class="text-3xl font-bold text-white">{{ summary.todayExams || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">考试类型</label>
          <select v-model="filters.examType" @change="loadExams" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="cale">CALE (加州)</option>
            <option value="nccaom">NCCAOM (全国)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
          <select v-model="filters.status" @change="loadExams" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="abandoned">已放弃</option>
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

    <!-- 考试列表 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">考试类型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">得分</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">正确/总题数</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用时</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">开始时间</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="exam in exams" :key="exam.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img v-if="exam.user.avatar" :src="exam.user.avatar" class="w-8 h-8 rounded-full" />
                <div v-else class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span class="text-purple-600 font-semibold text-sm">{{ exam.user.name?.[0] || 'U' }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ exam.user.name || exam.user.nickname || '未命名' }}</div>
                  <div class="text-sm text-gray-500">{{ exam.user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="exam.examType === 'cale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                {{ exam.examType === 'cale' ? 'CALE' : 'NCCAOM' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(exam.status)">
                {{ getStatusText(exam.status) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div v-if="exam.status === 'completed'">
                <div class="font-semibold" :class="exam.isPassed ? 'text-green-600' : 'text-red-600'">
                  {{ exam.score || 0 }}
                </div>
                <div class="text-xs text-gray-500">及格: {{ exam.passingScore || 0 }}</div>
              </div>
              <div v-else class="text-gray-400">-</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm">
                <span class="text-green-600 font-semibold">{{ exam.correctAnswers || 0 }}</span> /
                <span class="text-gray-600">{{ exam.totalQuestions || 0 }}</span>
              </div>
              <div v-if="exam.wrongAnswers" class="text-xs text-red-500">错误: {{ exam.wrongAnswers }}</div>
            </td>
            <td class="px-6 py-4">
              <div v-if="exam.duration" class="text-sm text-gray-900">
                {{ formatDuration(exam.duration) }}
              </div>
              <div v-else class="text-gray-400">-</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ formatDate(exam.startedAt || exam.createdAt) }}</div>
              <div v-if="exam.completedAt" class="text-xs text-gray-500">完成: {{ formatDate(exam.completedAt) }}</div>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="viewExamDetail(exam.id)" class="text-purple-600 hover:text-purple-800 font-medium text-sm">
                查看详情
              </button>
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

    <!-- 详情模态框 -->
    <div v-if="detailExam" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" @click.self="closeDetailModal">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl my-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">考试详情</h2>

        <!-- 基本信息 -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">用户</div>
              <div class="font-medium">{{ detailExam.user.name || detailExam.user.email }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">考试类型</div>
              <div class="font-medium">{{ detailExam.examType === 'cale' ? 'CALE' : 'NCCAOM' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">状态</div>
              <div class="font-medium">{{ getStatusText(detailExam.status) }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">得分</div>
              <div class="font-medium" :class="detailExam.isPassed ? 'text-green-600' : 'text-red-600'">
                {{ detailExam.score || 0 }} / {{ detailExam.passingScore || 0 }}
              </div>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="detailExam.stats" class="mb-4">
          <h3 class="font-semibold text-lg mb-3">答题统计</h3>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="bg-green-50 rounded-lg p-3">
              <div class="text-sm text-gray-600">正确</div>
              <div class="text-2xl font-bold text-green-600">{{ detailExam.stats.correctCount }}</div>
            </div>
            <div class="bg-red-50 rounded-lg p-3">
              <div class="text-sm text-gray-600">错误</div>
              <div class="text-2xl font-bold text-red-600">{{ detailExam.stats.wrongCount }}</div>
            </div>
            <div class="bg-blue-50 rounded-lg p-3">
              <div class="text-sm text-gray-600">总题数</div>
              <div class="text-2xl font-bold text-blue-600">{{ detailExam.stats.totalAnswers }}</div>
            </div>
          </div>

          <!-- 按难度统计 -->
          <div class="mb-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">难度分布</h4>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-gray-50 rounded p-2">
                <div class="text-xs text-gray-600">简单</div>
                <div class="text-sm">
                  {{ detailExam.stats.byDifficulty.easy.correct }} / {{ detailExam.stats.byDifficulty.easy.total }}
                </div>
              </div>
              <div class="bg-gray-50 rounded p-2">
                <div class="text-xs text-gray-600">中等</div>
                <div class="text-sm">
                  {{ detailExam.stats.byDifficulty.medium.correct }} / {{ detailExam.stats.byDifficulty.medium.total }}
                </div>
              </div>
              <div class="bg-gray-50 rounded p-2">
                <div class="text-xs text-gray-600">困难</div>
                <div class="text-sm">
                  {{ detailExam.stats.byDifficulty.hard.correct }} / {{ detailExam.stats.byDifficulty.hard.total }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button @click="closeDetailModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const authStore = useAuthStore()
const loading = ref(true)
const exams = ref<any[]>([])
const summary = ref<any>({})
const filters = ref({ examType: 'all', status: 'all', search: '' })
const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
const detailExam = ref<any>(null)

let searchTimeout: NodeJS.Timeout | null = null

const loadSummary = async () => {
  try {
    const response = await $fetch('/api/admin/exams/summary', {
      headers: authStore.getAuthHeader() as HeadersInit
    })
    if (response.success) {
      summary.value = response.data
    }
  } catch (error) {
    console.error('Failed to load summary:', error)
  }
}

const loadExams = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/exams/list', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: {
        ...pagination.value,
        ...filters.value
      }
    })
    if (response.success) {
      exams.value = response.exams
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('Failed to load exams:', error)
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    loadExams()
  }, 500)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    loadExams()
  }
}

const viewExamDetail = async (examId: string) => {
  try {
    const response = await $fetch(`/api/admin/exams/${examId}`, {
      headers: authStore.getAuthHeader() as HeadersInit
    })
    if (response.success) {
      detailExam.value = response.exam
    }
  } catch (error) {
    console.error('Failed to load exam detail:', error)
  }
}

const closeDetailModal = () => {
  detailExam.value = null
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'abandoned':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'in_progress':
      return '进行中'
    case 'abandoned':
      return '已放弃'
    default:
      return status
  }
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
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
  loadExams()
})
</script>
