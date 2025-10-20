<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">📊 学习统计</h1>
        <p class="text-gray-600">查看您的学习进度和掌握情况</p>
      </div>

      <!-- 考试选择器 -->
      <ExamSelector :showDescription="false" class="mb-6" />

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <div v-else>
        <!-- 概览统计卡片 -->
        <div class="grid md:grid-cols-4 gap-6 mb-8">
          <!-- 学习时长 -->
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <span class="text-blue-100">总学习时长</span>
              <span class="text-3xl">⏱️</span>
            </div>
            <div class="text-3xl font-bold">{{ stats.studyTime.totalHours }}h</div>
            <div class="text-sm text-blue-100 mt-2">
              共 {{ stats.studyTime.sessionsCount }} 次学习
            </div>
          </div>

          <!-- 练习题数 -->
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <span class="text-green-100">练习题数</span>
              <span class="text-3xl">📝</span>
            </div>
            <div class="text-3xl font-bold">{{ stats.practice.totalQuestions }}</div>
            <div class="text-sm text-green-100 mt-2">
              答对 {{ stats.practice.correctAnswers }} 题
            </div>
          </div>

          <!-- 正确率 -->
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <span class="text-purple-100">总体正确率</span>
              <span class="text-3xl">🎯</span>
            </div>
            <div class="text-3xl font-bold">{{ stats.practice.accuracy }}%</div>
            <div class="text-sm text-purple-100 mt-2">
              最近30天数据
            </div>
          </div>

          <!-- 错题本 -->
          <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <span class="text-orange-100">错题本</span>
              <span class="text-3xl">📚</span>
            </div>
            <div class="text-3xl font-bold">{{ stats.wrongQuestions.remaining }}</div>
            <div class="text-sm text-orange-100 mt-2">
              已掌握 {{ stats.wrongQuestions.mastered }} / {{ stats.wrongQuestions.total }}
            </div>
          </div>
        </div>

        <!-- 知识点掌握度 -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">📌 知识点掌握度</h2>

          <div v-if="stats.categoryStats.length === 0" class="text-center py-8 text-gray-500">
            暂无数据
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="category in stats.categoryStats"
              :key="category.code"
              class="border-b last:border-b-0 pb-4 last:pb-0"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                  <div class="text-sm text-gray-600 mt-1">
                    练习: {{ category.totalAttempted }} 题 |
                    错题: {{ category.wrongCount }} 题 |
                    已掌握: {{ category.masteredCount }} 题
                  </div>
                </div>
                <div class="text-right ml-4">
                  <div class="text-2xl font-bold" :class="getAccuracyColor(category.accuracy)">
                    {{ category.accuracy }}%
                  </div>
                  <div class="text-xs text-gray-500">正确率</div>
                </div>
              </div>

              <!-- 进度条 -->
              <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="getAccuracyBarColor(category.accuracy)"
                  :style="{ width: category.accuracy + '%' }"
                ></div>
              </div>

              <!-- 掌握度标签 -->
              <div class="flex items-center gap-2 mt-2">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    getMasteryLevelClass(category.accuracy)
                  ]"
                >
                  {{ getMasteryLevelText(category.accuracy) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习建议 -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">💡 学习建议</h2>
          <div class="space-y-3">
            <div v-if="stats.practice.accuracy < 60" class="flex items-start gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <p class="font-semibold text-gray-900">加强基础练习</p>
                <p class="text-sm text-gray-600">
                  您的正确率偏低，建议先从简单题目开始，逐步提升。
                </p>
              </div>
            </div>

            <div v-if="stats.wrongQuestions.remaining > 20" class="flex items-start gap-3">
              <span class="text-2xl">📚</span>
              <div>
                <p class="font-semibold text-gray-900">复习错题</p>
                <p class="text-sm text-gray-600">
                  您有 {{ stats.wrongQuestions.remaining }} 道错题待复习，建议每天复习 10-15 道。
                </p>
              </div>
            </div>

            <div v-if="weakestCategory" class="flex items-start gap-3">
              <span class="text-2xl">🎯</span>
              <div>
                <p class="font-semibold text-gray-900">重点突破</p>
                <p class="text-sm text-gray-600">
                  "{{ weakestCategory.name }}" 是您的薄弱环节（正确率: {{ weakestCategory.accuracy }}%），
                  建议加强此部分的学习。
                </p>
              </div>
            </div>

            <div v-if="stats.studyTime.totalHours < 10" class="flex items-start gap-3">
              <span class="text-2xl">⏰</span>
              <div>
                <p class="font-semibold text-gray-900">增加学习时间</p>
                <p class="text-sm text-gray-600">
                  建议每天学习至少 1-2 小时，保持学习的连续性。
                </p>
              </div>
            </div>

            <div v-if="stats.practice.accuracy >= 80 && stats.wrongQuestions.remaining < 10" class="flex items-start gap-3">
              <span class="text-2xl">🎉</span>
              <div>
                <p class="font-semibold text-gray-900">准备充分</p>
                <p class="text-sm text-gray-600">
                  您的学习效果很好！继续保持，可以尝试更多模拟考试来检验学习成果。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useExamStore } from '~/stores/exam'

const examStore = useExamStore()
const userId = 'demo-user'

const stats = ref({
  studyTime: {
    total: 0,
    totalHours: '0',
    sessionsCount: 0
  },
  practice: {
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0
  },
  wrongQuestions: {
    total: 0,
    mastered: 0,
    remaining: 0,
    masteryRate: '0'
  },
  categoryStats: []
})

const loading = ref(false)

const weakestCategory = computed(() => {
  if (stats.value.categoryStats.length === 0) return null

  const categoriesWithAttempts = stats.value.categoryStats.filter(
    (c: any) => c.totalAttempted > 0
  )

  if (categoriesWithAttempts.length === 0) return null

  return categoriesWithAttempts.reduce((min: any, curr: any) =>
    parseFloat(curr.accuracy) < parseFloat(min.accuracy) ? curr : min
  )
})

const loadStats = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/stats/overview', {
      method: 'GET',
      params: {
        userId,
        examType: examStore.currentExam
      }
    })

    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

const getAccuracyColor = (accuracy: string) => {
  const acc = parseFloat(accuracy)
  if (acc >= 80) return 'text-green-600'
  if (acc >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getAccuracyBarColor = (accuracy: string) => {
  const acc = parseFloat(accuracy)
  if (acc >= 80) return 'bg-green-500'
  if (acc >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getMasteryLevelClass = (accuracy: string) => {
  const acc = parseFloat(accuracy)
  if (acc >= 80) return 'bg-green-100 text-green-700'
  if (acc >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const getMasteryLevelText = (accuracy: string) => {
  const acc = parseFloat(accuracy)
  if (acc >= 90) return '精通'
  if (acc >= 80) return '熟练'
  if (acc >= 70) return '良好'
  if (acc >= 60) return '及格'
  return '需加强'
}

onMounted(() => {
  loadStats()
})
</script>
