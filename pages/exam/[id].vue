<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">加载中...</p>
      </div>
    </div>

    <!-- Exam Interface -->
    <div v-else-if="exam">
      <!-- Header with Timer -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ exam.title }}</h1>
              <p class="text-sm text-gray-600">
                题目 {{ currentQuestionIndex + 1 }} / {{ exam.answers.length }}
              </p>
            </div>

            <!-- Timer -->
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-2xl font-bold" :class="timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'">
                  {{ formatTime(timeRemaining) }}
                </div>
                <div class="text-xs text-gray-600">剩余时间</div>
              </div>
              <button
                @click="showSubmitConfirm = true"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                提交考试
              </button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid lg:grid-cols-4 gap-6">
          <!-- Question Area -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-xl shadow-md p-8">
              <!-- Question -->
              <div class="mb-8">
                <div class="flex items-start justify-between mb-4">
                  <h2 class="text-lg font-semibold text-gray-900">
                    第 {{ currentQuestionIndex + 1 }} 题
                  </h2>
                  <button
                    @click="toggleMark"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                    :class="currentAnswer.isMarked
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    <svg class="w-4 h-4" :class="currentAnswer.isMarked ? 'fill-current' : 'fill-none'" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    <span class="text-sm font-semibold">{{ currentAnswer.isMarked ? '已标记' : '标记' }}</span>
                  </button>
                </div>

                <div class="prose max-w-none">
                  <p class="text-gray-800 text-lg leading-relaxed">{{ currentQuestion.question }}</p>
                </div>
              </div>

              <!-- Options -->
              <div class="space-y-3">
                <div
                  v-for="(option, index) in currentOptions"
                  :key="index"
                  @click="selectAnswer(option)"
                  class="p-4 border-2 rounded-xl cursor-pointer transition-all"
                  :class="currentAnswer.userAnswer === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5"
                      :class="currentAnswer.userAnswer === option
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'"
                    >
                      <div v-if="currentAnswer.userAnswer === option" class="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span class="flex-1 text-gray-800">{{ option }}</span>
                  </div>
                </div>
              </div>

              <!-- Navigation -->
              <div class="mt-8 flex items-center justify-between">
                <button
                  @click="previousQuestion"
                  :disabled="currentQuestionIndex === 0"
                  class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  上一题
                </button>

                <button
                  v-if="currentQuestionIndex < exam.answers.length - 1"
                  @click="nextQuestion"
                  class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  下一题
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                <button
                  v-else
                  @click="showSubmitConfirm = true"
                  class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  提交考试
                </button>
              </div>
            </div>
          </div>

          <!-- Answer Sheet Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 class="font-bold text-gray-900 mb-4">答题卡</h3>

              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="(answer, index) in exam.answers"
                  :key="answer.id"
                  @click="goToQuestion(index)"
                  class="aspect-square rounded-lg font-semibold text-sm transition-all relative"
                  :class="{
                    'bg-blue-600 text-white': index === currentQuestionIndex,
                    'bg-green-100 text-green-700': index !== currentQuestionIndex && answer.userAnswer,
                    'bg-gray-100 text-gray-600': index !== currentQuestionIndex && !answer.userAnswer
                  }"
                >
                  {{ index + 1 }}
                  <div
                    v-if="answer.isMarked"
                    class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"
                  ></div>
                </button>
              </div>

              <div class="mt-6 space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 bg-green-100 rounded"></div>
                  <span class="text-gray-600">已答 {{ answeredCount }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 bg-gray-100 rounded"></div>
                  <span class="text-gray-600">未答 {{ unansweredCount }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 bg-yellow-100 rounded relative">
                    <div class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <span class="text-gray-600">已标记 {{ markedCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <div
      v-if="showSubmitConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showSubmitConfirm = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">确认提交考试？</h3>
          <p class="text-gray-600 mb-4">
            你已完成 {{ answeredCount }} / {{ exam.answers.length }} 题
          </p>
          <p v-if="unansweredCount > 0" class="text-yellow-700 text-sm bg-yellow-50 rounded-lg p-3">
            还有 {{ unansweredCount }} 题未作答，确定要提交吗？
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="showSubmitConfirm = false"
            class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            继续答题
          </button>
          <button
            @click="submitExam"
            :disabled="submitting"
            class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="submitting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ submitting ? '提交中...' : '确认提交' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const examId = route.params.id as string

const loading = ref(true)
const exam = ref<any>(null)
const currentQuestionIndex = ref(0)
const timeRemaining = ref(0)
const showSubmitConfirm = ref(false)
const submitting = ref(false)
const startTime = ref(Date.now())

// Load exam data
const loadExam = async () => {
  try {
    const response = await $fetch(`/api/exam/${examId}`)
    exam.value = response.exam

    // Initialize timer
    const duration = exam.value.duration * 60 // Convert to seconds
    const elapsed = exam.value.startedAt
      ? Math.floor((Date.now() - new Date(exam.value.startedAt).getTime()) / 1000)
      : 0
    timeRemaining.value = Math.max(0, duration - elapsed)

    loading.value = false

    // Start timer countdown
    const interval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        clearInterval(interval)
        // Auto submit when time is up
        submitExam()
      }
    }, 1000)

    // Clean up interval on unmount
    onUnmounted(() => clearInterval(interval))
  } catch (error: any) {
    alert('加载考试失败: ' + (error.data?.message || error.message))
    router.push('/exam/config')
  }
}

loadExam()

// Computed properties
const currentAnswer = computed(() => exam.value.answers[currentQuestionIndex.value])
const currentQuestion = computed(() => currentAnswer.value.question)
const currentOptions = computed(() => {
  try {
    return JSON.parse(currentQuestion.value.options || '[]')
  } catch {
    return []
  }
})

const answeredCount = computed(() => {
  return exam.value.answers.filter((a: any) => a.userAnswer).length
})

const unansweredCount = computed(() => {
  return exam.value.answers.length - answeredCount.value
})

const markedCount = computed(() => {
  return exam.value.answers.filter((a: any) => a.isMarked).length
})

const progress = computed(() => {
  return (answeredCount.value / exam.value.answers.length) * 100
})

// Methods
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const selectAnswer = async (option: string) => {
  const answer = currentAnswer.value
  answer.userAnswer = option

  // Save answer
  await $fetch(`/api/exam/${examId}/answer`, {
    method: 'POST',
    body: {
      answerId: answer.id,
      userAnswer: option
    }
  })
}

const toggleMark = async () => {
  const answer = currentAnswer.value
  answer.isMarked = !answer.isMarked

  // Save mark status
  await $fetch(`/api/exam/${examId}/answer`, {
    method: 'POST',
    body: {
      answerId: answer.id,
      isMarked: answer.isMarked
    }
  })
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < exam.value.answers.length - 1) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const goToQuestion = (index: number) => {
  currentQuestionIndex.value = index
}

const submitExam = async () => {
  submitting.value = true

  try {
    const totalTime = Math.floor((Date.now() - startTime.value) / 1000)

    const response = await $fetch(`/api/exam/${examId}/submit`, {
      method: 'POST',
      body: {
        timeSpent: totalTime
      }
    })

    // Navigate to results page
    router.push(`/exam/result/${examId}`)
  } catch (error: any) {
    alert('提交失败: ' + (error.data?.message || error.message))
  } finally {
    submitting.value = false
    showSubmitConfirm.value = false
  }
}
</script>
