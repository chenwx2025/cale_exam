<template>
  <div>
    <!-- 返回按钮 -->
    <button
      @click="$router.back()"
      class="mb-6 flex items-center text-gray-600 hover:text-gray-900"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
      返回大纲
    </button>

    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载题目中...</p>
    </div>

    <!-- 题目列表 -->
    <div v-else-if="questions && questions.length > 0">
      <!-- 进度条 -->
      <div class="mb-6 bg-white rounded-xl p-6 shadow-md">
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold">练习进度</span>
          <span class="text-sm text-gray-600">
            {{ currentQuestionIndex + 1 }} / {{ questions.length }}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all"
            :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- 当前题目 -->
      <div class="bg-white rounded-xl shadow-lg p-8">
        <QuestionCard
          :question="currentQuestion"
          :showAnswer="showAnswer"
          @answer="handleAnswer"
        />

        <!-- 操作按钮 -->
        <div class="mt-6 flex justify-between">
          <button
            v-if="currentQuestionIndex > 0"
            @click="previousQuestion"
            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            上一题
          </button>
          <div v-else></div>

          <button
            v-if="currentQuestionIndex < questions.length - 1"
            @click="nextQuestion"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            下一题
          </button>
          <button
            v-else
            @click="finishPractice"
            class="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            完成练习
          </button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div v-if="stats.total > 0" class="mt-6 bg-white rounded-xl p-6 shadow-md">
        <h3 class="font-bold text-lg mb-4">本次练习统计</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
            <div class="text-gray-600 text-sm">已答题目</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ stats.correct }}</div>
            <div class="text-gray-600 text-sm">答对题目</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">
              {{ stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0 }}%
            </div>
            <div class="text-gray-600 text-sm">正确率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12 bg-white rounded-xl">
      <p class="text-gray-600">该分类暂无题目</p>
      <button
        @click="$router.back()"
        class="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        返回大纲
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const examStore = useExamStore()
const route = useRoute()
const categoryId = route.query.category as string

// 创建响应式引用来避免 Pinia store 序列化问题
const currentExamType = computed(() => examStore.currentExamType)

// 获取题目（根据当前选择的考试类型）
const { data: questions, pending } = await useFetch(`/api/questions`, {
  key: () => `questions-${categoryId}-${currentExamType.value}`,
  query: computed(() => ({
    categoryId,
    examType: currentExamType.value
  }))
})

const currentQuestionIndex = ref(0)
const showAnswer = ref(false)
const userAnswers = ref<Record<string, any>>({})

const stats = computed(() => {
  const answered = Object.values(userAnswers.value)
  return {
    total: answered.length,
    correct: answered.filter(a => a.isCorrect).length
  }
})

const currentQuestion = computed(() => {
  if (!questions.value || questions.value.length === 0) return null
  return questions.value[currentQuestionIndex.value]
})

const handleAnswer = (answer: any) => {
  showAnswer.value = true
  userAnswers.value[currentQuestion.value!.id] = answer

  // 可以在这里保存到后端
  // await $fetch('/api/users/answers', {
  //   method: 'POST',
  //   body: {
  //     userId: 'demo-user',
  //     questionId: currentQuestion.value!.id,
  //     userAnswer: answer.userAnswer,
  //     timeSpent: answer.timeSpent
  //   }
  // })
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value!.length - 1) {
    currentQuestionIndex.value++
    showAnswer.value = false
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    showAnswer.value = !!userAnswers.value[questions.value![currentQuestionIndex.value].id]
  }
}

const finishPractice = () => {
  alert(`练习完成！\n总题数：${stats.value.total}\n答对：${stats.value.correct}\n正确率：${((stats.value.correct / stats.value.total) * 100).toFixed(1)}%`)
}
</script>
