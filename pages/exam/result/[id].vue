<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">加载成绩中...</p>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="exam" class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
          :class="exam.passed ? 'bg-green-600' : 'bg-red-600'"
        >
          <svg v-if="exam.passed" class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h1 class="text-4xl font-bold mb-2" :class="exam.passed ? 'text-green-600' : 'text-red-600'">
          {{ exam.passed ? '恭喜通过！' : '未通过' }}
        </h1>
        <p class="text-gray-600">{{ exam.title }}</p>
      </div>

      <!-- Score Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <div class="grid md:grid-cols-4 gap-6 mb-8">
          <!-- Score -->
          <div class="text-center p-6 bg-blue-50 rounded-xl">
            <div class="text-5xl font-bold text-blue-600 mb-2">{{ exam.percentage?.toFixed(1) }}%</div>
            <div class="text-gray-600 font-semibold">得分</div>
          </div>

          <!-- Correct -->
          <div class="text-center p-6 bg-green-50 rounded-xl">
            <div class="text-5xl font-bold text-green-600 mb-2">{{ exam.score }}</div>
            <div class="text-gray-600 font-semibold">正确题数</div>
          </div>

          <!-- Wrong -->
          <div class="text-center p-6 bg-red-50 rounded-xl">
            <div class="text-5xl font-bold text-red-600 mb-2">{{ wrongCount }}</div>
            <div class="text-gray-600 font-semibold">错误题数</div>
          </div>

          <!-- Time -->
          <div class="text-center p-6 bg-purple-50 rounded-xl">
            <div class="text-5xl font-bold text-purple-600 mb-2">{{ formatTime(exam.timeSpent || 0) }}</div>
            <div class="text-gray-600 font-semibold">用时</div>
          </div>
        </div>

        <!-- Domain Breakdown -->
        <div v-if="domainStats.length > 0" class="border-t border-gray-200 pt-6">
          <h3 class="font-bold text-gray-900 mb-4">各领域得分分析</h3>
          <div class="space-y-3">
            <div v-for="stat in domainStats" :key="stat.domain" class="flex items-center gap-4">
              <div class="flex-1">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-semibold text-gray-700">{{ stat.domain }}</span>
                  <span class="text-sm font-semibold" :class="stat.percentage >= 60 ? 'text-green-600' : 'text-red-600'">
                    {{ stat.correct }}/{{ stat.total }} ({{ stat.percentage.toFixed(0) }}%)
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="stat.percentage >= 60 ? 'bg-green-500' : 'bg-red-500'"
                    :style="{ width: `${stat.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wrong Questions -->
      <div v-if="wrongQuestions.length > 0" class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">错题解析</h2>

        <div class="space-y-6">
          <div
            v-for="(item, index) in wrongQuestions"
            :key="item.id"
            class="border-l-4 border-red-500 bg-red-50 rounded-lg p-6"
          >
            <!-- Question -->
            <div class="mb-4">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold text-gray-900">第 {{ item.questionNumber }} 题</h3>
                <span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {{ item.question.category?.name }}
                </span>
              </div>
              <p class="text-gray-800">{{ item.question.question }}</p>
            </div>

            <!-- Options & Answers -->
            <div class="space-y-2 mb-4">
              <div v-for="option in parseOptions(item.question.options)" :key="option" class="flex items-start gap-2">
                <div
                  class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="{
                    'bg-green-500 text-white': option === item.question.correctAnswer,
                    'bg-red-500 text-white': option === item.userAnswer && option !== item.question.correctAnswer,
                    'bg-gray-200 text-gray-600': option !== item.question.correctAnswer && option !== item.userAnswer
                  }"
                >
                  <svg v-if="option === item.question.correctAnswer" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <svg v-else-if="option === item.userAnswer" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class="flex-1" :class="{
                  'text-green-700 font-semibold': option === item.question.correctAnswer,
                  'text-red-700': option === item.userAnswer && option !== item.question.correctAnswer,
                  'text-gray-700': option !== item.question.correctAnswer && option !== item.userAnswer
                }">
                  {{ option }}
                </span>
              </div>
            </div>

            <!-- Explanation -->
            <div v-if="item.question.explanation" class="bg-white rounded-lg p-4 border border-green-200">
              <h4 class="font-semibold text-green-800 mb-2">答案解析</h4>
              <p class="text-gray-700 text-sm whitespace-pre-line">{{ item.question.explanation }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-center gap-4">
        <NuxtLink
          v-if="wrongCount > 0"
          to="/wrong-questions"
          class="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          查看错题本 ({{ wrongCount }}题)
        </NuxtLink>

        <NuxtLink
          to="/exam/config"
          class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          再来一次
        </NuxtLink>

        <NuxtLink
          to="/"
          class="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          返回首页
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

const route = useRoute()
const authStore = useAuthStore()
const examId = route.params.id as string

const loading = ref(true)
const exam = ref<any>(null)

// Add wrong questions to wrong question book
const addWrongQuestionsToBook = async (wrongAnswers: any[]) => {
  // 从exam对象获取实际的用户ID
  const userId = exam.value?.userId

  if (!userId) {
    console.error('无法获取用户ID')
    return
  }

  for (const answer of wrongAnswers) {
    try {
      await $fetch('/api/wrong-questions/add', {
        method: 'POST',
        headers: authStore.getAuthHeader() as HeadersInit,
        body: {
          userId,
          questionId: answer.questionId
        }
      })
    } catch (error) {
      console.error('添加错题失败:', error)
    }
  }
}

// Load exam results
const loadResults = async () => {
  try {
    const response = await $fetch(`/api/exam/${examId}`)
    exam.value = response.exam

    // Redirect if exam is not completed
    if (exam.value.status !== 'completed') {
      navigateTo(`/exam/${examId}`)
      return
    }

    // Add wrong answers to wrong question book
    const wrongAnswers = exam.value.answers.filter((a: any) => !a.isCorrect)
    if (wrongAnswers.length > 0) {
      await addWrongQuestionsToBook(wrongAnswers)
    }

    loading.value = false
  } catch (error: any) {
    alert('加载成绩失败: ' + (error.data?.message || error.message))
    navigateTo('/exam/config')
  }
}

loadResults()

// Computed properties
const wrongCount = computed(() => {
  return exam.value.answers.filter((a: any) => !a.isCorrect).length
})

const wrongQuestions = computed(() => {
  return exam.value.answers
    .map((a: any, index: number) => ({
      ...a,
      questionNumber: index + 1
    }))
    .filter((a: any) => !a.isCorrect)
})

const domainStats = computed(() => {
  if (!exam.value) return []

  const stats: any = {}

  exam.value.answers.forEach((answer: any) => {
    const domain = answer.question.category?.name || '未分类'

    if (!stats[domain]) {
      stats[domain] = {
        domain,
        total: 0,
        correct: 0
      }
    }

    stats[domain].total++
    if (answer.isCorrect) {
      stats[domain].correct++
    }
  })

  return Object.values(stats).map((stat: any) => ({
    ...stat,
    percentage: (stat.correct / stat.total) * 100
  }))
})

// Methods
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

const parseOptions = (optionsJson: string) => {
  try {
    return JSON.parse(optionsJson || '[]')
  } catch {
    return []
  }
}
</script>
