<template>
  <div>
    <!-- 考试选择器 -->
    <ExamSelector :showDescription="true" class="mb-8" />

    <h1 class="text-3xl font-bold mb-8">{{ examStore.currentExam.name }} 模拟考试</h1>

    <!-- 考试配置 -->
    <div v-if="!examStarted" class="bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">配置考试</h2>

      <div class="space-y-6">
        <!-- 基础配置 -->
        <div class="grid md:grid-cols-2 gap-4">
          <!-- 题目数量 -->
          <div>
            <label class="block font-semibold mb-2">题目数量</label>
            <input
              v-model.number="examConfig.questionCount"
              type="number"
              min="5"
              max="200"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">建议：30-50题</p>
          </div>

          <!-- 考试时长 -->
          <div>
            <label class="block font-semibold mb-2">考试时长（分钟）</label>
            <select
              v-model.number="examConfig.duration"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option :value="30">30 分钟</option>
              <option :value="45">45 分钟</option>
              <option :value="60">60 分钟（标准）</option>
              <option :value="90">90 分钟</option>
              <option :value="120">120 分钟</option>
            </select>
          </div>
        </div>

        <!-- 难度选择 -->
        <div>
          <label class="block font-semibold mb-2">难度等级</label>
          <select
            v-model="examConfig.difficulty"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">全部难度</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>

        <!-- 考试范围 - 改进版 -->
        <div>
          <label class="block font-semibold mb-2">考试范围</label>

          <!-- 快捷选择 -->
          <div class="flex gap-2 mb-3">
            <button
              @click="selectAllCategories"
              class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              全选
            </button>
            <button
              @click="clearCategories"
              class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              清空
            </button>
            <button
              @click="selectCategoryType('content')"
              class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              只选内容部分
            </button>
          </div>

          <!-- 分类多选 -->
          <div class="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div v-if="!categories || categories.length === 0" class="text-center text-gray-500 py-4">
              暂无分类数据
            </div>
            <div v-else class="space-y-3">
              <div v-for="category in categories" :key="category.id">
                <label class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    :value="category.id"
                    v-model="examConfig.selectedCategories"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                  />
                  <span class="ml-3 flex-1">
                    <span class="font-medium">{{ category.name }}</span>
                    <span class="text-sm text-gray-500 ml-2">
                      ({{ category._count?.questions || 0 }} 题)
                    </span>
                  </span>
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getTypeColor(category.type)"
                  >
                    {{ getTypeLabel(category.type) }}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <p class="text-sm text-gray-500 mt-2">
            已选择 {{ examConfig.selectedCategories.length }} 个分类
          </p>
        </div>

        <!-- 开始考试按钮 -->
        <button
          @click="startExam"
          :disabled="loading || examConfig.selectedCategories.length === 0"
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {{ loading ? '加载中...' : examConfig.selectedCategories.length === 0 ? '请至少选择一个分类' : '开始考试' }}
        </button>
      </div>
    </div>

    <!-- 考试进行中 -->
    <div v-else-if="examQuestions && examQuestions.length > 0">
      <!-- 考试信息栏 -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-6">
            <div>
              <span class="text-sm text-gray-600">进度</span>
              <div class="font-bold text-lg">
                {{ currentQuestionIndex + 1 }} / {{ examQuestions.length }}
              </div>
            </div>
            <div>
              <span class="text-sm text-gray-600">已答题</span>
              <div class="font-bold text-lg">{{ answeredCount }}</div>
            </div>
            <div>
              <span class="text-sm text-gray-600">剩余时间</span>
              <div class="font-bold text-lg" :class="timeRemaining < 300 ? 'text-red-600' : ''">
                {{ formatTime(timeRemaining) }}
              </div>
            </div>
          </div>

          <button
            @click="submitExam"
            class="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            提交考试
          </button>
        </div>

        <!-- 进度条 -->
        <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all"
            :style="{ width: `${(answeredCount / examQuestions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- 题目卡片 -->
      <div class="bg-white rounded-xl shadow-lg p-8 mb-6">
        <QuestionCard
          :question="examQuestions[currentQuestionIndex]"
          :showAnswer="false"
          @answer="handleAnswer"
        />
      </div>

      <!-- 导航按钮 -->
      <div class="flex justify-between mb-6">
        <button
          v-if="currentQuestionIndex > 0"
          @click="currentQuestionIndex--"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          上一题
        </button>
        <div v-else></div>

        <button
          v-if="currentQuestionIndex < examQuestions.length - 1"
          @click="currentQuestionIndex++"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          下一题
        </button>
      </div>

      <!-- 题目导航网格 -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="font-bold mb-4">答题卡</h3>
        <div class="grid grid-cols-10 gap-2">
          <button
            v-for="(q, index) in examQuestions"
            :key="q.id"
            @click="currentQuestionIndex = index"
            class="w-10 h-10 rounded-lg font-semibold transition-colors"
            :class="getQuestionCardClass(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
      </div>
    </div>

    <!-- 考试结果 -->
    <div v-if="examResult" class="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">考试完成！</h2>
        <div class="text-6xl font-bold mb-2"
          :class="examResult.accuracy >= 60 ? 'text-green-600' : 'text-red-600'">
          {{ examResult.accuracy }}%
        </div>
        <p class="text-gray-600">总分：{{ examResult.score }} / 100</p>
      </div>

      <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ examResult.total }}</div>
          <div class="text-gray-600">总题数</div>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ examResult.correct }}</div>
          <div class="text-gray-600">答对</div>
        </div>
        <div class="text-center p-4 bg-red-50 rounded-lg">
          <div class="text-2xl font-bold text-red-600">{{ examResult.wrong }}</div>
          <div class="text-gray-600">答错</div>
        </div>
      </div>

      <div class="flex gap-4">
        <button
          @click="reviewExam"
          class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          查看解析
        </button>
        <button
          @click="resetExam"
          class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          重新考试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const examStore = useExamStore()

// 创建响应式引用来避免 Pinia store 序列化问题
const currentExamType = computed(() => examStore.currentExamType)

// 获取所有分类（根据当前选择的考试类型）
const { data: categories, refresh: refreshCategories } = await useFetch('/api/categories', {
  key: () => `exam-categories-${currentExamType.value}`,
  query: computed(() => ({ examType: currentExamType.value }))
})

// 当考试类型改变时，重新获取分类并重置考试
watch(currentExamType, () => {
  refreshCategories()
  resetExam()
})

const examStarted = ref(false)
const examConfig = ref({
  questionCount: 30,
  difficulty: '',
  duration: 60, // 考试时长（分钟）
  selectedCategories: [] as string[] // 选中的分类ID
})

const loading = ref(false)
const examQuestions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const examAnswers = ref<Record<string, any>>({})
const examResult = ref<any>(null)

// 考试计时器
const examDuration = computed(() => examConfig.value.duration * 60) // 转换为秒
const timeRemaining = ref(examDuration.value)
let timer: any = null

const answeredCount = computed(() => {
  return Object.keys(examAnswers.value).length
})

// 分类选择辅助函数
const selectAllCategories = () => {
  examConfig.value.selectedCategories = categories.value?.map((c: any) => c.id) || []
}

const clearCategories = () => {
  examConfig.value.selectedCategories = []
}

const selectCategoryType = (type: string) => {
  examConfig.value.selectedCategories = categories.value
    ?.filter((c: any) => c.type === type)
    .map((c: any) => c.id) || []
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    organization: 'bg-blue-100 text-blue-700',
    content: 'bg-green-100 text-green-700',
    review: 'bg-purple-100 text-purple-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    organization: '组织',
    content: '内容',
    review: '复习'
  }
  return labels[type] || type
}

const startExam = async () => {
  loading.value = true

  try {
    // 构建查询参数
    const query: any = {
      limit: examConfig.value.questionCount,
      random: true,
      examType: currentExamType.value
    }

    // 使用选中的分类ID
    if (examConfig.value.selectedCategories.length > 0) {
      query.categoryIds = examConfig.value.selectedCategories.join(',')
    }

    if (examConfig.value.difficulty) {
      query.difficulty = examConfig.value.difficulty
    }

    const { data } = await useFetch('/api/questions', { query })

    if (data.value && data.value.length > 0) {
      examQuestions.value = data.value
      examStarted.value = true
      examAnswers.value = {}
      examResult.value = null
      currentQuestionIndex.value = 0

      // 开始计时
      startTimer()
    } else {
      alert('没有找到符合条件的题目，请调整筛选条件')
    }
  } catch (error) {
    alert('加载题目失败')
  } finally {
    loading.value = false
  }
}

const startTimer = () => {
  timeRemaining.value = examDuration.value
  timer = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      submitExam()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleAnswer = (answer: any) => {
  examAnswers.value[examQuestions.value[currentQuestionIndex.value].id] = answer

  // 自动跳转到下一题
  if (currentQuestionIndex.value < examQuestions.value.length - 1) {
    setTimeout(() => {
      currentQuestionIndex.value++
    }, 500)
  }
}

const getQuestionCardClass = (index: number) => {
  const questionId = examQuestions.value[index].id
  const isAnswered = !!examAnswers.value[questionId]
  const isCurrent = index === currentQuestionIndex.value

  if (isCurrent) {
    return 'bg-blue-600 text-white'
  } else if (isAnswered) {
    return 'bg-green-200 text-green-800'
  } else {
    return 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }
}

const submitExam = () => {
  if (answeredCount.value < examQuestions.value.length) {
    if (!confirm(`您还有 ${examQuestions.value.length - answeredCount.value} 道题未作答，确定提交吗？`)) {
      return
    }
  }

  stopTimer()

  // 计算成绩
  const correct = Object.values(examAnswers.value).filter(a => a.isCorrect).length
  const total = examQuestions.value.length
  const wrong = total - correct
  const accuracy = Math.round((correct / total) * 100)
  const score = Math.round((correct / total) * 100)

  examResult.value = {
    total,
    correct,
    wrong,
    accuracy,
    score
  }
}

const resetExam = () => {
  examStarted.value = false
  examQuestions.value = []
  examAnswers.value = {}
  examResult.value = null
  currentQuestionIndex.value = 0
  stopTimer()
}

const reviewExam = () => {
  examResult.value = null
  currentQuestionIndex.value = 0
}

// 初始化：默认选中所有分类
onMounted(() => {
  if (categories.value && categories.value.length > 0) {
    examConfig.value.selectedCategories = categories.value.map((c: any) => c.id)
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>
