<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      每日一题
    </h2>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600 text-sm">加载中...</p>
    </div>

    <!-- No Question Today -->
    <div v-else-if="!dailyQuestion" class="text-center py-8 bg-gray-50 rounded-lg">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p class="text-gray-500">今天还没有设置每日一题</p>
      <p v-if="canManage" class="text-sm text-gray-400 mt-2">作为管理员，你可以设置每日一题</p>
    </div>

    <!-- Question Display -->
    <div v-else>
      <!-- Question Info -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <p class="text-sm text-amber-700 mb-1">
          <span class="font-semibold">知识点:</span> {{ dailyQuestion.question.domain?.name || '未分类' }}
        </p>
        <p class="text-gray-900 font-medium">{{ dailyQuestion.question.questionText }}</p>
      </div>

      <!-- Already Answered -->
      <div v-if="dailyQuestion.hasAnswered" class="space-y-4">
        <div
          class="border-2 rounded-lg p-4"
          :class="dailyQuestion.userAnswer.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg
              v-if="dailyQuestion.userAnswer.isCorrect"
              class="w-6 h-6 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <svg
              v-else
              class="w-6 h-6 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span
              class="font-semibold"
              :class="dailyQuestion.userAnswer.isCorrect ? 'text-green-900' : 'text-red-900'"
            >
              {{ dailyQuestion.userAnswer.isCorrect ? '回答正确！' : '回答错误' }}
            </span>
          </div>
          <p
            class="text-sm"
            :class="dailyQuestion.userAnswer.isCorrect ? 'text-green-700' : 'text-red-700'"
          >
            你的答案: <span class="font-semibold">{{ dailyQuestion.userAnswer.answer }}</span>
          </p>
          <p v-if="!dailyQuestion.userAnswer.isCorrect" class="text-sm text-red-700 mt-1">
            正确答案: <span class="font-semibold">{{ dailyQuestion.question.correctAnswer }}</span>
          </p>
        </div>

        <!-- Explanation -->
        <div v-if="dailyQuestion.question.explanation" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm font-semibold text-blue-900 mb-1">解析:</p>
          <p class="text-sm text-blue-700">{{ dailyQuestion.question.explanation }}</p>
        </div>

        <!-- Stats -->
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">答题统计</p>
          <div class="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p class="text-lg font-bold text-gray-900">{{ dailyQuestion.stats.totalAnswers }}</p>
              <p class="text-xs text-gray-600">参与人数</p>
            </div>
            <div>
              <p class="text-lg font-bold text-green-600">{{ dailyQuestion.stats.correctAnswers }}</p>
              <p class="text-xs text-gray-600">答对人数</p>
            </div>
            <div>
              <p class="text-lg font-bold text-blue-600">{{ dailyQuestion.stats.correctRate }}%</p>
              <p class="text-xs text-gray-600">正确率</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Answer Form -->
      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">你的答案</label>
          <input
            v-model="userAnswer"
            type="text"
            placeholder="输入答案（如: A, B, C, D）"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            @keyup.enter="submitAnswer"
          />
          <p class="text-xs text-gray-500 mt-1">提示: 通常答案为单个字母（A/B/C/D）</p>
        </div>

        <button
          @click="submitAnswer"
          :disabled="!userAnswer.trim() || submitting"
          class="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? '提交中...' : '提交答案' }}
        </button>

        <!-- Current Stats Preview -->
        <div v-if="dailyQuestion.stats.totalAnswers > 0" class="text-center text-sm text-gray-500">
          已有 {{ dailyQuestion.stats.totalAnswers }} 人作答，正确率 {{ dailyQuestion.stats.correctRate }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  groupId: string
  canManage?: boolean
}>()

const authStore = useAuthStore()

// Data
const loading = ref(true)
const dailyQuestion = ref<any>(null)
const userAnswer = ref('')
const submitting = ref(false)

// Load daily question
const loadDailyQuestion = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/study-groups/${props.groupId}/daily-question`, {
      headers: authStore.getAuthHeader() as HeadersInit
    }) as any

    if (response.success) {
      dailyQuestion.value = response.data
    }
  } catch (error: any) {
    console.error('加载每日一题失败:', error)
  } finally {
    loading.value = false
  }
}

// Submit answer
const submitAnswer = async () => {
  if (!userAnswer.value.trim()) return

  try {
    submitting.value = true
    const response = await $fetch(`/api/study-groups/${props.groupId}/daily-question/answer`, {
      method: 'POST',
      headers: authStore.getAuthHeader() as HeadersInit,
      body: {
        answer: userAnswer.value.trim()
      }
    }) as any

    if (response.success) {
      // Reload question to show result
      await loadDailyQuestion()
      userAnswer.value = ''
    }
  } catch (error: any) {
    console.error('提交答案失败:', error)
    alert('提交答案失败: ' + (error.data?.message || error.message))
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadDailyQuestion()
})
</script>
