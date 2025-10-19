<template>
  <div>
    <!-- 题目信息头部 -->
    <div class="mb-6 pb-4 border-b border-gray-200">
      <div class="flex items-center gap-2 mb-2">
        <span
          class="px-3 py-1 rounded-full text-sm font-semibold"
          :class="getCategoryTypeColor(question.category.type)"
        >
          {{ question.category.code }}
        </span>
        <span class="text-gray-600">{{ question.category.name }}</span>
        <span
          class="ml-auto px-3 py-1 rounded-full text-sm"
          :class="getDifficultyColor(question.difficulty)"
        >
          {{ getDifficultyLabel(question.difficulty) }}
        </span>
      </div>
    </div>

    <!-- 题目内容 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">{{ question.question }}</h2>

      <!-- 选项 -->
      <div v-if="question.options" class="space-y-3">
        <div
          v-for="(option, index) in parseOptions(question.options)"
          :key="index"
          @click="selectOption(option)"
          class="p-4 border-2 rounded-lg cursor-pointer transition-all"
          :class="getOptionClass(option)"
        >
          <div class="flex items-center">
            <div
              class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center"
              :class="getOptionIndicatorClass(option)"
            >
              <div
                v-if="selectedAnswer === option"
                class="w-3 h-3 rounded-full"
                :class="showAnswer && isCorrectOption(option) ? 'bg-green-600' : 'bg-blue-600'"
              ></div>
            </div>
            <span class="flex-1">{{ option }}</span>

            <!-- 正确/错误图标 -->
            <div v-if="showAnswer && selectedAnswer === option">
              <svg
                v-if="isCorrectOption(option)"
                class="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <svg
                v-else
                class="w-6 h-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <button
        v-if="!showAnswer && selectedAnswer"
        @click="submitAnswer"
        class="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        提交答案
      </button>
    </div>

    <!-- 答案解析 -->
    <div v-if="showAnswer" class="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
      <div class="mb-4">
        <div class="flex items-center mb-2">
          <svg
            v-if="isCorrect"
            class="w-6 h-6 text-green-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <svg
            v-else
            class="w-6 h-6 text-red-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <h3 class="font-bold text-lg">
            {{ isCorrect ? '回答正确！' : '回答错误' }}
          </h3>
        </div>
        <p class="text-gray-700">
          <strong>正确答案：</strong>{{ question.correctAnswer }}
        </p>
      </div>

      <div v-if="question.explanation" class="border-t border-blue-200 pt-4">
        <h4 class="font-semibold mb-2">答案解析：</h4>
        <p class="text-gray-700">{{ question.explanation }}</p>
      </div>

      <!-- 知识点关联提示 -->
      <div class="mt-4 p-4 bg-white rounded-lg">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <p class="font-semibold text-sm">所属考试大纲</p>
            <p class="text-sm text-gray-600">
              {{ question.category.name }} ({{ getTypeLabel(question.category.type) }})
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Question {
  id: string
  type: string
  question: string
  options: string | null
  correctAnswer: string
  explanation: string | null
  difficulty: string
  category: {
    id: string
    name: string
    code: string
    type: string
  }
}

const props = defineProps<{
  question: Question
  showAnswer: boolean
}>()

const emit = defineEmits<{
  answer: [value: { userAnswer: string; isCorrect: boolean; timeSpent: number }]
}>()

const selectedAnswer = ref<string | null>(null)
const startTime = ref(Date.now())

const isCorrect = computed(() => {
  return selectedAnswer.value?.trim() === props.question.correctAnswer.trim()
})

const parseOptions = (options: string | null) => {
  if (!options) return []
  try {
    return JSON.parse(options)
  } catch {
    return options.split('\n').filter(o => o.trim())
  }
}

const selectOption = (option: string) => {
  if (props.showAnswer) return
  selectedAnswer.value = option
}

const submitAnswer = () => {
  if (!selectedAnswer.value) return

  const timeSpent = Math.floor((Date.now() - startTime.value) / 1000)

  emit('answer', {
    userAnswer: selectedAnswer.value,
    isCorrect: isCorrect.value,
    timeSpent
  })
}

const isCorrectOption = (option: string) => {
  return option.trim() === props.question.correctAnswer.trim()
}

const getOptionClass = (option: string) => {
  if (!props.showAnswer) {
    return selectedAnswer.value === option
      ? 'border-blue-600 bg-blue-50'
      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
  }

  if (isCorrectOption(option)) {
    return 'border-green-600 bg-green-50'
  }

  if (selectedAnswer.value === option && !isCorrectOption(option)) {
    return 'border-red-600 bg-red-50'
  }

  return 'border-gray-300'
}

const getOptionIndicatorClass = (option: string) => {
  if (!props.showAnswer) {
    return selectedAnswer.value === option ? 'border-blue-600' : 'border-gray-300'
  }

  if (isCorrectOption(option)) {
    return 'border-green-600'
  }

  if (selectedAnswer.value === option) {
    return 'border-red-600'
  }

  return 'border-gray-300'
}

const getCategoryTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    organization: 'bg-blue-100 text-blue-700',
    content: 'bg-green-100 text-green-700',
    review: 'bg-purple-100 text-purple-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  }
  return colors[difficulty] || 'bg-gray-100 text-gray-700'
}

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[difficulty] || difficulty
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    organization: '考试组织部分',
    content: '考试内容部分',
    review: '考试复习部分'
  }
  return labels[type] || type
}

// 重置状态当题目改变时
watch(() => props.question.id, () => {
  selectedAnswer.value = null
  startTime.value = Date.now()
})
</script>
