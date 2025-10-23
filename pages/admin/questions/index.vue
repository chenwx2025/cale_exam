<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">题目管理</h1>
      <p class="text-gray-600 mt-2">管理系统中的所有题目（含统计摘要）</p>
    </div>

    <!-- 考试类型选择 - 置顶 -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="bg-white/20 rounded-lg p-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <label class="block text-sm font-semibold text-white/90 mb-2">选择考试类型</label>
            <select v-model="filters.examType" @change="handleExamTypeChange" class="px-4 py-2 bg-white border-2 border-white/30 rounded-lg text-gray-900 font-semibold focus:ring-2 focus:ring-white focus:border-white min-w-[200px]">
              <option value="cale">🇺🇸 CALE 考试</option>
              <option value="nccaom">🌐 NCCAOM 考试</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/admin/ai-generate" class="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 font-semibold flex items-center gap-2 transition-all">
            <span>🤖</span>
            <span>AI 生成</span>
          </NuxtLink>
          <NuxtLink to="/admin/questions/import" class="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 font-semibold flex items-center gap-2 transition-all">
            <span>📥</span>
            <span>批量导入</span>
          </NuxtLink>
          <NuxtLink to="/admin/questions/create" class="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-semibold transition-all">
            ➕ 创建题目
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 搜索过滤器 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索</label>
          <input v-model="filters.search" @input="debouncedSearch" type="text" placeholder="搜索题目内容..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <select v-model="filters.categoryId" @change="loadQuestions" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">难度</label>
          <select v-model="filters.difficulty" @change="loadQuestions" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">全部难度</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 统计摘要面板 -->
    <div v-if="summary" class="mb-6">
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            题目统计概览
          </h2>
          <button @click="showSummary = !showSummary" class="text-white hover:text-blue-100 transition-colors">
            <svg class="w-6 h-6 transition-transform" :class="{ 'rotate-180': !showSummary }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        <div v-show="showSummary">
          <!-- 总体统计卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div class="text-white/80 text-sm mb-1">总题目数</div>
              <div class="text-3xl font-bold text-white">{{ summary.totalQuestions }}</div>
              <div class="text-white/60 text-xs mt-1">{{ summary.examType.toUpperCase() }} 考试</div>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div class="text-white/80 text-sm mb-1">最近新增</div>
              <div class="text-3xl font-bold text-white">{{ summary.recentQuestions }}</div>
              <div class="text-white/60 text-xs mt-1">最近 30 天</div>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div class="text-white/80 text-sm mb-1">分类数量</div>
              <div class="text-3xl font-bold text-white">{{ summary.categoryStats.length }}</div>
              <div class="text-white/60 text-xs mt-1">知识点分类</div>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div class="text-white/80 text-sm mb-1">Domain 数量</div>
              <div class="text-3xl font-bold text-white">{{ summary.domainStats.length }}</div>
              <div class="text-white/60 text-xs mt-1">考试域</div>
            </div>
          </div>

          <!-- 详细统计表格 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Domain 统计 -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 class="font-semibold text-gray-900">按 Domain 分布</h3>
              </div>
              <div class="max-h-64 overflow-y-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">题目数</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">占比</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="stat in summary.domainStats" :key="stat.domain" class="hover:bg-gray-50">
                      <td class="px-4 py-2 text-sm text-gray-900">{{ stat.domain }}</td>
                      <td class="px-4 py-2 text-sm text-gray-600 text-right font-semibold">{{ stat.count }}</td>
                      <td class="px-4 py-2 text-sm text-gray-500 text-right">{{ ((stat.count / summary.totalQuestions) * 100).toFixed(1) }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 难度统计 -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 class="font-semibold text-gray-900">按难度分布</h3>
              </div>
              <div class="p-4">
                <div v-for="stat in summary.difficultyStats" :key="stat.difficulty" class="mb-4 last:mb-0">
                  <div class="flex items-center justify-between mb-1">
                    <span :class="['px-2 py-1 rounded text-xs font-semibold', getDifficultyClass(stat.difficulty)]">
                      {{ getDifficultyText(stat.difficulty) }}
                    </span>
                    <span class="text-sm font-semibold text-gray-900">{{ stat.count }} 题 ({{ ((stat.count / summary.totalQuestions) * 100).toFixed(1) }}%)</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="getDifficultyBarClass(stat.difficulty)"
                      :style="{ width: `${(stat.count / summary.totalQuestions) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分类树统计 -->
          <div class="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">按分类详细统计</h3>
              <span class="text-xs text-gray-500">共 {{ summary.categoryStats.length }} 个分类</span>
            </div>
            <div class="max-h-96 overflow-y-auto p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                  v-for="cat in sortedCategories"
                  :key="cat.id"
                  class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  :style="{ borderLeftWidth: '4px', borderLeftColor: cat.color || '#3B82F6' }"
                >
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ cat.name }}</div>
                    <div class="text-xs text-gray-500">{{ cat.code }}</div>
                  </div>
                  <div class="ml-3 flex-shrink-0">
                    <div class="text-lg font-bold text-gray-900">{{ cat.questionCount }}</div>
                    <div class="text-xs text-gray-500 text-right">题</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="questions.length > 0" class="space-y-4">
      <!-- 题目卡片列表 -->
      <div v-for="q in questions" :key="q.id" class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        <div class="p-6">
          <!-- 头部信息 -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3 flex-1">
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{{ q.examType.toUpperCase() }}</span>
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getDifficultyClass(q.difficulty)]">{{ getDifficultyText(q.difficulty) }}</span>
              <span class="text-sm text-gray-600">{{ q.category?.name || '-' }}</span>
              <span v-if="q.category?.code" class="text-sm text-gray-500">{{ q.category.code }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button @click="viewQuestion(q.id)" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors">
                📋 查看详情
              </button>
              <NuxtLink :to="`/admin/questions/edit/${q.id}`" class="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors">
                ✏️ 编辑
              </NuxtLink>
              <button @click="deleteQuestion(q.id)" class="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors">
                🗑️ 删除
              </button>
            </div>
          </div>

          <!-- 题目内容 -->
          <div class="mb-4">
            <div class="text-gray-900 font-medium mb-2">{{ q.chineseQuestion || q.question }}</div>
            <div v-if="q.englishQuestion" class="text-gray-600 text-sm italic">{{ q.englishQuestion }}</div>
          </div>

          <!-- 选项列表 -->
          <div class="space-y-2 mb-4">
            <div v-for="(option, index) in (q.chineseOptions || [])" :key="index"
                 :class="['flex items-start gap-3 p-3 rounded-lg border-2 transition-all',
                          q.correctAnswer === String.fromCharCode(65 + index)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50']">
              <span class="font-bold text-gray-700 min-w-[24px]">{{ String.fromCharCode(65 + index) }}.</span>
              <div class="flex-1">
                <div class="text-gray-900">{{ option }}</div>
                <div v-if="q.englishOptions && q.englishOptions[index]" class="text-gray-600 text-sm mt-1">{{ q.englishOptions[index] }}</div>
              </div>
              <span v-if="q.correctAnswer === String.fromCharCode(65 + index)" class="text-green-600 font-bold text-sm whitespace-nowrap">✓ 正确</span>
            </div>
          </div>

          <!-- 底部统计信息 -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="flex items-center gap-6 text-sm">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-gray-600">答题次数: <span class="font-semibold text-gray-900">{{ q.stats.totalAnswers }}</span></span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-600">正确率: <span class="font-semibold text-green-600">{{ q.stats.accuracy }}%</span></span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span class="text-gray-600">错误次数: <span class="font-semibold text-red-600">{{ q.stats.wrongAnswers }}</span></span>
              </div>
            </div>
            <div class="text-xs text-gray-400">
              ID: {{ q.id.slice(0, 8) }}...
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.totalPages > 1" class="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          共 <span class="font-semibold text-gray-900">{{ pagination.total }}</span> 条题目，
          当前第 <span class="font-semibold text-gray-900">{{ pagination.page }}</span> / {{ pagination.totalPages }} 页
        </div>
        <div class="flex gap-2">
          <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1"
                  class="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
            ← 上一页
          </button>
          <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages"
                  class="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
            下一页 →
          </button>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
      <h3 class="text-xl font-semibold text-gray-900 mb-2">未找到题目</h3>
      <p class="text-gray-600">尝试调整搜索条件或创建新题目</p>
    </div>

    <!-- 题目详情模态框 -->
    <div v-if="detailQuestion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4" @click.self="detailQuestion = null">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">题目详情</h2>
            <button @click="detailQuestion = null" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 max-h-[70vh] overflow-y-auto">
          <!-- 基本信息 -->
          <div class="mb-6 grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-500">考试类型:</span>
              <span class="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{{ detailQuestion.examType.toUpperCase() }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-500">难度:</span>
              <span :class="['ml-2 px-3 py-1 rounded-full text-xs font-semibold', getDifficultyClass(detailQuestion.difficulty)]">
                {{ getDifficultyText(detailQuestion.difficulty) }}
              </span>
            </div>
            <div>
              <span class="text-sm text-gray-500">Domain:</span>
              <span class="ml-2 font-medium">{{ detailQuestion.domain }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-500">分类:</span>
              <span class="ml-2 font-medium">{{ detailQuestion.category?.name || '-' }}</span>
            </div>
          </div>

          <!-- 中文题目 -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-2">中文题目</h3>
            <div class="bg-gray-50 rounded-lg p-4 text-gray-800">{{ detailQuestion.chineseQuestion }}</div>
          </div>

          <!-- 英文题目 -->
          <div class="mb-6" v-if="detailQuestion.englishQuestion">
            <h3 class="font-semibold text-gray-900 mb-2">English Question</h3>
            <div class="bg-gray-50 rounded-lg p-4 text-gray-800">{{ detailQuestion.englishQuestion }}</div>
          </div>

          <!-- 选项 -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-2">选项</h3>
            <div class="space-y-2">
              <div v-for="(option, index) in detailQuestion.chineseOptions" :key="index"
                   :class="['p-3 rounded-lg border-2', detailQuestion.correctAnswer === String.fromCharCode(65 + index) ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white']">
                <div class="flex items-start gap-2">
                  <span class="font-semibold text-gray-700">{{ String.fromCharCode(65 + index) }}.</span>
                  <span class="flex-1">{{ option }}</span>
                  <span v-if="detailQuestion.correctAnswer === String.fromCharCode(65 + index)" class="text-green-600 font-semibold text-sm">✓ 正确答案</span>
                </div>
                <div v-if="detailQuestion.englishOptions && detailQuestion.englishOptions[index]" class="mt-1 ml-6 text-sm text-gray-600">
                  {{ detailQuestion.englishOptions[index] }}
                </div>
              </div>
            </div>
          </div>

          <!-- 解析 -->
          <div class="mb-6" v-if="detailQuestion.chineseExplanation || detailQuestion.englishExplanation">
            <h3 class="font-semibold text-gray-900 mb-2">答案解析</h3>
            <div v-if="detailQuestion.chineseExplanation" class="bg-blue-50 rounded-lg p-4 mb-2">
              <div class="text-sm text-gray-600 mb-1">中文解析:</div>
              <div class="text-gray-800">{{ detailQuestion.chineseExplanation }}</div>
            </div>
            <div v-if="detailQuestion.englishExplanation" class="bg-blue-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-1">English Explanation:</div>
              <div class="text-gray-800">{{ detailQuestion.englishExplanation }}</div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-2">答题统计</h3>
            <div class="grid grid-cols-4 gap-4">
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-sm text-gray-600">总答题次数</div>
                <div class="text-2xl font-bold text-gray-900">{{ detailQuestion.stats.totalAnswers }}</div>
              </div>
              <div class="bg-green-50 rounded-lg p-3">
                <div class="text-sm text-gray-600">正确次数</div>
                <div class="text-2xl font-bold text-green-600">{{ detailQuestion.stats.correctAnswers }}</div>
              </div>
              <div class="bg-red-50 rounded-lg p-3">
                <div class="text-sm text-gray-600">错误次数</div>
                <div class="text-2xl font-bold text-red-600">{{ detailQuestion.stats.wrongAnswers }}</div>
              </div>
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="text-sm text-gray-600">正确率</div>
                <div class="text-2xl font-bold text-blue-600">{{ detailQuestion.stats.accuracy }}%</div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button @click="detailQuestion = null" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">关闭</button>
          <NuxtLink :to="`/admin/questions/edit/${detailQuestion.id}`" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">编辑题目</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const authStore = useAuthStore()
const loading = ref(true)
const questions = ref<any[]>([])
const categories = ref<any[]>([])
const filters = ref({ search: '', examType: 'cale', categoryId: '', difficulty: '' })
const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
const summary = ref<any>(null)
const showSummary = ref(true)
const detailQuestion = ref<any>(null)

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await $fetch('/api/admin/categories/list', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: { examType: filters.value.examType, pageSize: 1000 }
    }) as any
    if (response.success) {
      categories.value = response.categories
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

// 处理考试类型变化
const handleExamTypeChange = () => {
  // 重置分类过滤器
  filters.value.categoryId = ''
  // 重新加载分类和题目
  loadCategories()
  loadSummary()
  loadQuestions()
}

// 加载统计数据
const loadSummary = async () => {
  try {
    const response = await $fetch('/api/admin/questions/summary', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: { examType: filters.value.examType }
    })
    if (response.success) {
      summary.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load summary:', error)
  }
}

const loadQuestions = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/questions/list', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: {
        ...pagination.value,
        ...filters.value
      }
    })
    if (response.success) {
      questions.value = response.questions
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('Failed to load questions:', error)
  } finally {
    loading.value = false
  }
}

let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadQuestions()
  }, 500)
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadQuestions()
}

const viewQuestion = async (id: string) => {
  try {
    const response = await $fetch(`/api/admin/questions/${id}`, {
      headers: authStore.getAuthHeader() as HeadersInit
    }) as any
    if (response.success) {
      detailQuestion.value = response.question
    }
  } catch (error) {
    console.error('Failed to load question detail:', error)
    alert('加载题目详情失败')
  }
}

const deleteQuestion = async (id: string) => {
  if (!confirm('确定要删除这道题目吗？')) return
  try {
    await $fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeader() as HeadersInit
    })
    alert('题目已删除')
    loadQuestions()
    loadSummary()
  } catch (error) {
    console.error('Failed to delete question:', error)
    alert('删除失败')
  }
}

const getDifficultyClass = (d: string) => ({ easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }[d] || '')
const getDifficultyText = (d: string) => ({ easy: '简单', medium: '中等', hard: '困难' }[d] || d)
const getDifficultyBarClass = (d: string) => ({ easy: 'bg-green-500', medium: 'bg-yellow-500', hard: 'bg-red-500' }[d] || 'bg-blue-500')

// 按题目数量排序分类
const sortedCategories = computed(() => {
  if (!summary.value) return []
  return [...summary.value.categoryStats].sort((a, b) => b.questionCount - a.questionCount)
})

// 页面加载时自动加载数据
onMounted(() => {
  loadCategories()
  loadSummary()
  loadQuestions()
})
</script>
