<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🤖 {{ examStore.currentExam.name }} - AI 学习助手</h1>
        <p class="text-gray-600">智能分析您的学习情况，提供个性化学习建议</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">AI 正在分析您的学习数据...</p>
      </div>

      <!-- 学习路径推荐 -->
      <div v-else-if="learningPath" class="space-y-6">
        <!-- 学习概况 -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📊 学习概况</h2>
          <div class="grid md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-3xl font-bold text-blue-600">{{ learningPath.analysis.totalQuestions }}</div>
              <div class="text-sm text-gray-600 mt-1">累计答题</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-3xl font-bold text-green-600">{{ learningPath.analysis.overallAccuracy }}%</div>
              <div class="text-sm text-gray-600 mt-1">总体正确率</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-3xl font-bold text-purple-600">{{ learningPath.analysis.studyDaysLast7 }}</div>
              <div class="text-sm text-gray-600 mt-1">最近7天学习</div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-3xl font-bold" :class="getTrendColor(learningPath.analysis.trend)">
                {{ getTrendIcon(learningPath.analysis.trend) }}
              </div>
              <div class="text-sm text-gray-600 mt-1">学习趋势</div>
            </div>
          </div>
        </div>

        <!-- AI 推荐学习路径 -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">🎯 AI 推荐学习路径</h2>

          <div v-if="learningPath.recommendations.length === 0" class="text-center py-8 text-gray-500">
            暂无推荐，继续学习即可获得个性化建议
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(rec, index) in learningPath.recommendations"
              :key="index"
              class="border-l-4 p-4 rounded-r-lg"
              :class="getPriorityBorderClass(rec.priority)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getPriorityBadgeClass(rec.priority)">
                      {{ getPriorityText(rec.priority) }}
                    </span>
                    <h3 class="text-lg font-semibold text-gray-900">{{ rec.title }}</h3>
                  </div>
                  <p class="text-gray-600 text-sm mb-3">{{ rec.description }}</p>
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <span v-if="rec.estimatedTime" class="flex items-center gap-1">
                      ⏱️ 约 {{ rec.estimatedTime }} 分钟
                    </span>
                    <span class="flex items-center gap-1">
                      {{ getTypeIcon(rec.type) }} {{ getTypeText(rec.type) }}
                    </span>
                  </div>
                </div>
                <button
                  @click="takeAction(rec)"
                  class="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex-shrink-0"
                >
                  {{ rec.action }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 薄弱知识点 -->
        <div v-if="learningPath.analysis.weakCategories.length > 0" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">⚠️ 薄弱知识点</h2>
          <div class="space-y-3">
            <div
              v-for="cat in learningPath.analysis.weakCategories.slice(0, 5)"
              :key="cat.categoryId"
              class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
            >
              <div class="flex-1">
                <div class="font-semibold text-gray-900">{{ cat.categoryName }}</div>
                <div class="text-sm text-gray-600 mt-1">
                  练习: {{ cat.total }} 题 | 答对: {{ cat.correct }} 题 | 答错: {{ cat.wrong }} 题
                </div>
              </div>
              <div class="text-right ml-4">
                <div class="text-2xl font-bold text-red-600">{{ cat.accuracy.toFixed(1) }}%</div>
                <div class="text-xs text-gray-500">正确率</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 优势知识点 -->
        <div v-if="learningPath.analysis.strongCategories.length > 0" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">✨ 优势知识点</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div
              v-for="cat in learningPath.analysis.strongCategories.slice(0, 4)"
              :key="cat.categoryId"
              class="p-4 bg-green-50 rounded-lg"
            >
              <div class="font-semibold text-gray-900">{{ cat.categoryName }}</div>
              <div class="text-2xl font-bold text-green-600 mt-2">{{ cat.accuracy.toFixed(1) }}%</div>
              <div class="text-sm text-gray-600 mt-1">练习 {{ cat.total }} 题</div>
            </div>
          </div>
        </div>

        <!-- 错题分析 -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">🔍 错题分析</h2>
          <button
            @click="loadWrongAnalysis"
            :disabled="loadingWrongAnalysis"
            class="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
          >
            {{ loadingWrongAnalysis ? '分析中...' : '分析我的错题模式' }}
          </button>

          <div v-if="wrongAnalysis" class="mt-6">
            <div class="grid md:grid-cols-3 gap-4 mb-6">
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-3xl font-bold text-orange-600">{{ wrongAnalysis.totalWrongQuestions }}</div>
                <div class="text-sm text-gray-600 mt-1">错题总数</div>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <div class="text-xl font-bold text-red-600">{{ wrongAnalysis.topErrorCategory || 'N/A' }}</div>
                <div class="text-sm text-gray-600 mt-1">错误最多分类</div>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <div class="text-3xl font-bold text-yellow-600">{{ wrongAnalysis.patterns.length }}</div>
                <div class="text-sm text-gray-600 mt-1">识别的模式</div>
              </div>
            </div>

            <div v-if="wrongAnalysis.patterns.length > 0" class="space-y-3">
              <h3 class="font-semibold text-gray-900 mb-3">识别的错题模式:</h3>
              <div
                v-for="(pattern, index) in wrongAnalysis.patterns"
                :key="index"
                class="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg"
              >
                <div class="font-semibold text-gray-900 mb-1">{{ pattern.description }}</div>
                <div class="text-sm text-gray-600">💡 建议: {{ pattern.suggestion }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习报告 -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📈 学习报告</h2>
          <div class="flex gap-2 mb-4">
            <button
              @click="loadStudyReport('week')"
              :disabled="loadingReport"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              周报
            </button>
            <button
              @click="loadStudyReport('month')"
              :disabled="loadingReport"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
            >
              月报
            </button>
          </div>

          <div v-if="studyReport" class="space-y-4">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-3">{{ studyReport.period }}学习总结</h3>
              <div class="grid md:grid-cols-3 gap-4">
                <div>
                  <div class="text-2xl font-bold text-blue-600">{{ studyReport.summary.totalQuestions }}</div>
                  <div class="text-sm text-gray-600">累计答题</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-green-600">{{ studyReport.summary.accuracy }}%</div>
                  <div class="text-sm text-gray-600">正确率</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-purple-600">{{ studyReport.summary.studyDays }}</div>
                  <div class="text-sm text-gray-600">学习天数</div>
                </div>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-2">进步分析</h4>
              <div class="flex items-center gap-4">
                <div>
                  <span class="text-sm text-gray-600">前半周期: </span>
                  <span class="font-bold">{{ studyReport.progress.firstHalfAccuracy }}%</span>
                </div>
                <div class="text-2xl">→</div>
                <div>
                  <span class="text-sm text-gray-600">后半周期: </span>
                  <span class="font-bold">{{ studyReport.progress.secondHalfAccuracy }}%</span>
                </div>
                <div class="ml-auto">
                  <span class="px-3 py-1 rounded-full text-sm font-semibold"
                    :class="getProgressBadgeClass(studyReport.progress.trend)">
                    {{ getProgressText(studyReport.progress.trend) }}
                    ({{ studyReport.progress.improvement > 0 ? '+' : '' }}{{ studyReport.progress.improvement }}%)
                  </span>
                </div>
              </div>
            </div>

            <div v-if="studyReport.suggestions.length > 0" class="p-4 bg-blue-50 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-2">AI 建议</h4>
              <ul class="space-y-2">
                <li
                  v-for="(suggestion, index) in studyReport.suggestions"
                  :key="index"
                  class="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span>💡</span>
                  <span>{{ suggestion }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useExamStore } from '~/stores/exam'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const examStore = useExamStore()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const learningPath = ref<any>(null)
const wrongAnalysis = ref<any>(null)
const studyReport = ref<any>(null)
const loadingWrongAnalysis = ref(false)
const loadingReport = ref(false)

// 加载学习路径
const loadLearningPath = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/ai/learning-path', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        examType: examStore.currentExam
      }
    })

    if (response.success) {
      learningPath.value = response.data
    }
  } catch (error) {
    console.error('加载学习路径失败:', error)
    alert('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载错题分析
const loadWrongAnalysis = async () => {
  loadingWrongAnalysis.value = true
  try {
    const response = await $fetch('/api/ai/wrong-question-analysis', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        examType: examStore.currentExam
      }
    })

    if (response.success) {
      wrongAnalysis.value = response.data
    }
  } catch (error) {
    console.error('错题分析失败:', error)
    alert('分析失败，请稍后重试')
  } finally {
    loadingWrongAnalysis.value = false
  }
}

// 加载学习报告
const loadStudyReport = async (period: 'week' | 'month') => {
  loadingReport.value = true
  try {
    const response = await $fetch('/api/ai/study-report', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        examType: examStore.currentExam,
        period
      }
    })

    if (response.success) {
      studyReport.value = response.data
    }
  } catch (error) {
    console.error('生成报告失败:', error)
    alert('生成失败，请稍后重试')
  } finally {
    loadingReport.value = false
  }
}

// 执行推荐行动
const takeAction = (rec: any) => {
  if (rec.type === 'weak_category' && rec.categoryId) {
    router.push(`/practice?category=${rec.categoryId}`)
  } else if (rec.type === 'review_wrong') {
    router.push('/wrong-questions')
  } else if (rec.type === 'practice_more') {
    router.push('/practice')
  } else if (rec.type === 'challenge' && rec.categoryId) {
    router.push(`/practice?category=${rec.categoryId}&difficulty=hard`)
  }
}

// 获取趋势图标
const getTrendIcon = (trend: string) => {
  if (trend === 'improving') return '📈'
  if (trend === 'declining') return '📉'
  return '➡️'
}

const getTrendColor = (trend: string) => {
  if (trend === 'improving') return 'text-green-600'
  if (trend === 'declining') return 'text-red-600'
  return 'text-gray-600'
}

// 获取优先级样式
const getPriorityBorderClass = (priority: string) => {
  if (priority === 'high') return 'border-red-500 bg-red-50'
  if (priority === 'medium') return 'border-yellow-500 bg-yellow-50'
  return 'border-blue-500 bg-blue-50'
}

const getPriorityBadgeClass = (priority: string) => {
  if (priority === 'high') return 'bg-red-100 text-red-700'
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-700'
  return 'bg-blue-100 text-blue-700'
}

const getPriorityText = (priority: string) => {
  if (priority === 'high') return '高优先级'
  if (priority === 'medium') return '中优先级'
  return '低优先级'
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    weak_category: '⚠️',
    review_wrong: '📚',
    practice_more: '💪',
    challenge: '🎯',
    rest: '😌'
  }
  return icons[type] || '📝'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    weak_category: '薄弱知识点',
    review_wrong: '错题复习',
    practice_more: '加强练习',
    challenge: '挑战难题',
    rest: '适当休息'
  }
  return texts[type] || '学习建议'
}

const getProgressBadgeClass = (trend: string) => {
  if (trend === 'improving') return 'bg-green-100 text-green-700'
  if (trend === 'declining') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

const getProgressText = (trend: string) => {
  if (trend === 'improving') return '进步中'
  if (trend === 'declining') return '需加强'
  return '保持稳定'
}

onMounted(() => {
  loadLearningPath()
})
</script>
