<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">配置模拟考试</h1>
        <p class="text-gray-600">选择考试参数，开始你的模拟测试</p>
      </div>

      <!-- Exam Type Selector -->
      <ExamSelector :showDescription="true" class="mb-8" />

      <!-- Quick Mock Exam Button (CALE Only) -->
      <div v-if="examStore.currentExamType === 'cale'" class="mb-8">
        <button
          @click="createMockExam"
          :disabled="creatingMock"
          class="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!creatingMock" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <svg v-else class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div class="text-left">
            <div class="text-lg">{{ creatingMock ? '生成中...' : '一键生成 CALE 全真模拟考试' }}</div>
            <div class="text-xs text-green-100 font-normal">200题 · 300分钟 (5小时) · 按官方比例分配</div>
          </div>
        </button>
        <p class="mt-2 text-sm text-gray-600 text-center">
          完全按照CALE官方考试标准：200道题，300分钟 (5小时)，各Domain按官方占比自动分配
        </p>
      </div>

      <!-- Quick Action Button -->
      <div class="mb-8">
        <NuxtLink
          to="/exam/question-sets"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          查看已生成的题目集
        </NuxtLink>
      </div>

      <!-- Configuration Form -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form @submit.prevent="createExam" class="space-y-6">
          <!-- Exam Title -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              考试标题
            </label>
            <input
              v-model="config.title"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="例如: Domain 1-2 综合练习"
            />
          </div>

          <!-- Category/Domain Selection -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              选择考试范围
            </label>
            <select
              v-model="config.categoryId"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option :value="null">全部领域（完整模拟考试）</option>
              <option v-for="category in contentCategories" :key="category.id" :value="category.id">
                {{ category.name }} ({{ category.code }})
                <span v-if="category._count?.questions"> - {{ category._count.questions }} 题</span>
              </option>
            </select>
            <p class="mt-2 text-sm text-gray-500">
              选择特定领域进行针对性练习，或选择全部领域进行完整模拟
            </p>
          </div>

          <!-- Question Count -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              题目数量: {{ config.questionCount }}
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="count in [20, 50, 100, 150]"
                :key="count"
                type="button"
                @click="config.questionCount = count"
                class="py-3 px-4 rounded-xl font-semibold transition-all"
                :class="config.questionCount === count
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ count }} 题
              </button>
            </div>
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              考试时长: {{ config.duration }} 分钟
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="time in [30, 60, 90, 120]"
                :key="time"
                type="button"
                @click="config.duration = time"
                class="py-3 px-4 rounded-xl font-semibold transition-all"
                :class="config.duration === time
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ time }} 分钟
              </button>
            </div>
          </div>

          <!-- Difficulty -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              难度等级
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="level in difficulties"
                :key="level.value"
                type="button"
                @click="config.difficulty = level.value"
                class="py-3 px-4 rounded-xl font-semibold transition-all"
                :class="config.difficulty === level.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ level.label }}
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 class="font-semibold text-blue-900 mb-3">考试配置总览</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-blue-700">考试类型:</span>
                <span class="font-semibold text-blue-900">{{ examStore.currentExam.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">考试范围:</span>
                <span class="font-semibold text-blue-900">
                  {{ selectedCategory?.name || '全部领域' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">题目数量:</span>
                <span class="font-semibold text-blue-900">{{ config.questionCount }} 题</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">考试时长:</span>
                <span class="font-semibold text-blue-900">{{ config.duration }} 分钟</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">难度等级:</span>
                <span class="font-semibold text-blue-900">
                  {{ difficulties.find(d => d.value === config.difficulty)?.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="creating || !availableQuestions || availableQuestions < config.questionCount"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="creating" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ creating ? '创建中...' : '开始考试' }}</span>
          </button>

          <!-- Warning if not enough questions -->
          <div v-if="availableQuestions && availableQuestions < config.questionCount" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div>
                <p class="font-semibold text-yellow-900">题目不足</p>
                <p class="text-sm text-yellow-700 mt-1">
                  当前范围仅有 {{ availableQuestions }} 道题目，请减少题目数量或选择其他范围
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Back Button -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const examStore = useExamStore()
const router = useRouter()

const config = ref({
  title: `${examStore.currentExam.name} 模拟考试 - ${new Date().toLocaleDateString('zh-CN')}`,
  categoryId: null as string | null,
  questionCount: 50,
  duration: 60,
  difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed'
})

const creating = ref(false)
const creatingMock = ref(false)

const difficulties = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
  { value: 'mixed', label: '混合' }
]

// Create CALE Mock Exam
const createMockExam = async () => {
  creatingMock.value = true

  try {
    const response = await $fetch('/api/exam/create-mock', {
      method: 'POST',
      body: {
        userId: 'demo-user'  // TODO: 替换为实际用户ID
      }
    })

    if (response.success) {
      // 显示成功提示
      alert(`模拟考试创建成功！\n\n总题数: ${response.config.totalQuestions} 题\n考试时长: ${response.config.duration} 分钟\n\n题目分配:\n${Object.entries(response.config.domainBreakdown).map(([domain, count]) => `- ${domain}: ${count}题`).join('\n')}`)

      // 跳转到考试页面
      router.push(`/exam/${response.examId}`)
    }
  } catch (error: any) {
    console.error('Create mock exam error:', error)
    alert(error.data?.message || '创建模拟考试失败，请稍后重试')
  } finally {
    creatingMock.value = false
  }
}

// Fetch categories
const { data: categories } = await useFetch('/api/categories', {
  query: computed(() => ({ examType: examStore.currentExamType }))
})

// Filter content categories
const contentCategories = computed(() => {
  return categories.value?.filter((c: any) => c.type === 'content') || []
})

// Selected category
const selectedCategory = computed(() => {
  return contentCategories.value.find((c: any) => c.id === config.value.categoryId)
})

// Calculate available questions
const availableQuestions = computed(() => {
  if (!config.value.categoryId) {
    // All categories
    return contentCategories.value.reduce((sum: number, c: any) => sum + (c._count?.questions || 0), 0)
  } else {
    // Specific category
    return selectedCategory.value?._count?.questions || 0
  }
})

// Watch exam type changes
watch(() => examStore.currentExamType, () => {
  config.value.categoryId = null
  config.value.title = `${examStore.currentExam.name} 模拟考试 - ${new Date().toLocaleDateString('zh-CN')}`
})

const createExam = async () => {
  creating.value = true

  try {
    const response = await $fetch('/api/exam/create', {
      method: 'POST',
      body: {
        userId: 'demo-user', // TODO: Replace with actual user ID when auth is implemented
        examType: examStore.currentExamType,
        title: config.value.title,
        categoryId: config.value.categoryId,
        questionCount: config.value.questionCount,
        duration: config.value.duration,
        difficulty: config.value.difficulty
      }
    })

    // Navigate to exam page
    router.push(`/exam/${response.examId}`)
  } catch (error: any) {
    alert('创建考试失败: ' + (error.data?.message || error.message || '未知错误'))
  } finally {
    creating.value = false
  }
}
</script>
