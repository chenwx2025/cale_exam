<template>
  <div>
    <!-- 标题 -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <NuxtLink to="/admin/questions" class="text-gray-600 hover:text-gray-900">
          <span class="text-2xl">←</span>
        </NuxtLink>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">🤖 AI 题目生成</h1>
          <p class="text-gray-600 mt-1">使用 AI 智能生成高质量题目</p>
        </div>
      </div>
    </div>

    <!-- 生成配置表单 -->
    <div class="bg-white rounded-xl shadow-md p-8 mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-6">生成配置</h2>

      <form @submit.prevent="generateQuestions" class="space-y-6">
        <!-- 考试类型 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            考试类型 <span class="text-red-500">*</span>
          </label>
          <select v-model="form.examType" class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%236b7280%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 1.5em 1.5em;" required>
            <option value="">请选择考试类型</option>
            <option value="cale">CALE (加州中医执照考试)</option>
            <option value="nccaom">NCCAOM (全国中医执照考试)</option>
          </select>
        </div>

        <!-- 分类选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            题目分类 <span class="text-red-500">*</span>
          </label>
          <select v-model="form.categoryId" class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%236b7280%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 1.5em 1.5em;" required :disabled="!form.examType || loadingCategories">
            <option value="">{{ loadingCategories ? '加载中...' : '请选择分类' }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }} ({{ cat.code }})
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">先选择考试类型后才能选择分类</p>
        </div>

        <!-- 题目数量 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            生成数量 <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.count"
            type="number"
            min="1"
            max="50"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="输入要生成的题目数量"
            required
          />
          <p class="text-xs text-gray-500 mt-1">建议每次生成 5-20 道题目，最多 50 道</p>
        </div>

        <!-- 难度分布 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            难度分布 <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border border-gray-200 rounded-lg p-4">
              <label class="flex items-center gap-3">
                <input
                  v-model="form.difficulty"
                  type="radio"
                  value="easy"
                  class="w-5 h-5 text-blue-600"
                />
                <div>
                  <div class="font-semibold text-gray-900">简单</div>
                  <div class="text-xs text-gray-500">适合初学者</div>
                </div>
              </label>
            </div>
            <div class="border border-gray-200 rounded-lg p-4">
              <label class="flex items-center gap-3">
                <input
                  v-model="form.difficulty"
                  type="radio"
                  value="medium"
                  class="w-5 h-5 text-blue-600"
                />
                <div>
                  <div class="font-semibold text-gray-900">中等</div>
                  <div class="text-xs text-gray-500">推荐难度</div>
                </div>
              </label>
            </div>
            <div class="border border-gray-200 rounded-lg p-4">
              <label class="flex items-center gap-3">
                <input
                  v-model="form.difficulty"
                  type="radio"
                  value="hard"
                  class="w-5 h-5 text-blue-600"
                />
                <div>
                  <div class="font-semibold text-gray-900">困难</div>
                  <div class="text-xs text-gray-500">高级挑战</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- 高级选项 -->
        <div class="border-t border-gray-200 pt-6">
          <button
            type="button"
            @click="showAdvanced = !showAdvanced"
            class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <span>{{ showAdvanced ? '隐藏' : '显示' }}高级选项</span>
            <span>{{ showAdvanced ? '▲' : '▼' }}</span>
          </button>

          <div v-if="showAdvanced" class="mt-4 space-y-4">
            <!-- 包含解析 -->
            <div class="flex items-center gap-3">
              <input
                v-model="form.includeExplanation"
                type="checkbox"
                id="includeExplanation"
                class="w-5 h-5 text-blue-600 rounded"
              />
              <label for="includeExplanation" class="text-sm text-gray-700">
                包含详细解析（推荐）
              </label>
            </div>

            <!-- 题目类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">题目类型</label>
              <select v-model="form.questionType" class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%236b7280%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 1.5em 1.5em;">
                <option value="multiple_choice">选择题</option>
                <option value="true_false">判断题</option>
                <option value="case_study">案例题</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="flex items-center gap-4 pt-6">
          <button
            type="submit"
            :disabled="generating || !form.examType || !form.categoryId || !form.count"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            <span v-if="generating">⏳</span>
            <span v-else>🤖</span>
            <span>{{ generating ? '生成中...' : '开始生成' }}</span>
          </button>

          <NuxtLink
            to="/admin/questions"
            class="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            取消
          </NuxtLink>
        </div>
      </form>
    </div>

    <!-- 生成进度 -->
    <div v-if="generating" class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div class="flex items-center gap-4 mb-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div>
          <div class="font-semibold text-blue-900">正在生成题目...</div>
          <div class="text-sm text-blue-700">{{ progress.current }} / {{ progress.total }}</div>
        </div>
      </div>
      <div class="w-full bg-blue-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(progress.current / progress.total) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- 生成结果 -->
    <div v-if="generatedQuestions.length > 0" class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">
          ✅ 生成成功！共 {{ generatedQuestions.length }} 道题目
        </h2>
        <button
          @click="viewAllQuestions"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          查看全部题目
        </button>
      </div>

      <!-- 题目预览 -->
      <div class="space-y-4">
        <div
          v-for="(q, index) in generatedQuestions.slice(0, 3)"
          :key="index"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <div class="text-gray-900 font-medium mb-2">{{ q.question }}</div>
              <div class="flex items-center gap-3 text-sm text-gray-600">
                <span class="px-2 py-1 bg-gray-100 rounded">{{ q.difficulty }}</span>
                <span>{{ q.category?.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="generatedQuestions.length > 3" class="text-center text-sm text-gray-600 py-4">
          还有 {{ generatedQuestions.length - 3 }} 道题目...
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div v-if="!generating && generatedQuestions.length === 0" class="bg-purple-50 border border-purple-200 rounded-xl p-6 mt-6">
      <h3 class="font-semibold text-purple-900 mb-3">💡 使用提示</h3>
      <ul class="text-sm text-purple-800 space-y-2">
        <li>• AI 会根据所选分类和难度智能生成相关题目</li>
        <li>• 建议每次生成 5-20 道题目以确保质量</li>
        <li>• 生成的题目会自动保存到题库中</li>
        <li>• 您可以在"题目管理"中查看和编辑生成的题目</li>
        <li>• 建议开启"包含详细解析"以提供更好的学习体验</li>
      </ul>
    </div>

    <!-- 生成历史 -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">📚 生成历史</h2>
        <button
          @click="loadHistory"
          class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          刷新
        </button>
      </div>

      <!-- 加载中 -->
      <div v-if="loadingHistory" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- 历史记录列表 -->
      <div v-else-if="history.length > 0" class="space-y-4">
        <div
          v-for="set in history"
          :key="set.id"
          class="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <!-- 题目集头部 -->
          <div
            @click="toggleSet(set.id)"
            class="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-gray-900">{{ set.title }}</h3>
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                    {{ set.questionCount }} 道题
                  </span>
                  <span class="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                    {{ set.examType === 'cale' ? 'CALE' : 'NCCAOM' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  生成时间：{{ formatDate(set.createdAt) }}
                </p>
              </div>
              <svg
                class="w-6 h-6 text-gray-400 transition-transform"
                :class="{ 'rotate-180': expandedSets.includes(set.id) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- 题目列表（展开时显示） -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[10000px] opacity-100"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="max-h-[10000px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-if="expandedSets.includes(set.id)" class="border-t border-gray-200 bg-gray-50">
              <div class="p-6 space-y-4">
                <div
                  v-for="(question, qIndex) in set.questions"
                  :key="question.id"
                  class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <!-- 题目编号和难度 -->
                  <div class="flex items-center gap-3 mb-3">
                    <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {{ qIndex + 1 }}
                    </div>
                    <span
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-700': question.difficulty === 'easy',
                        'bg-yellow-100 text-yellow-700': question.difficulty === 'medium',
                        'bg-red-100 text-red-700': question.difficulty === 'hard'
                      }"
                    >
                      {{ question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难' }}
                    </span>
                    <span class="text-sm text-gray-600">{{ question.category?.name }}</span>
                  </div>

                  <!-- 题目内容 -->
                  <div class="mb-4">
                    <p class="text-gray-900 font-medium leading-relaxed">{{ question.question }}</p>
                  </div>

                  <!-- 选项列表 -->
                  <div class="space-y-2 mb-4">
                    <div
                      v-for="(option, optIndex) in question.chineseOptions"
                      :key="optIndex"
                      class="flex items-start gap-3 p-3 rounded-lg border-2 transition-all"
                      :class="
                        question.correctAnswer === String.fromCharCode(65 + optIndex)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      "
                    >
                      <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold"
                        :class="
                          question.correctAnswer === String.fromCharCode(65 + optIndex)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        "
                      >
                        {{ String.fromCharCode(65 + optIndex) }}
                      </span>
                      <span class="flex-1 text-gray-900">{{ option }}</span>
                      <svg
                        v-if="question.correctAnswer === String.fromCharCode(65 + optIndex)"
                        class="flex-shrink-0 w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>

                  <!-- 解析 -->
                  <div v-if="question.explanation" class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div class="flex items-start gap-2">
                      <svg class="flex-shrink-0 w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div class="flex-1">
                        <p class="font-semibold text-blue-900 mb-1">答案解析</p>
                        <p class="text-sm text-blue-800 leading-relaxed">{{ question.explanation }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无生成记录</h3>
        <p class="text-gray-600">开始生成题目后，历史记录将显示在这里</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const authStore = useAuthStore()

// 表单数据
const form = ref({
  examType: '',
  categoryId: '',
  count: 10,
  difficulty: 'medium',
  includeExplanation: true,
  questionType: 'multiple_choice'
})

const showAdvanced = ref(false)
const generating = ref(false)
const loadingCategories = ref(false)
const loadingHistory = ref(false)
const categories = ref<any[]>([])
const generatedQuestions = ref<any[]>([])
const history = ref<any[]>([])
const expandedSets = ref<string[]>([])

const progress = ref({
  current: 0,
  total: 0
})

// 监听考试类型变化，加载对应分类
watch(() => form.value.examType, async (newType) => {
  if (newType) {
    await loadCategories(newType)
  } else {
    categories.value = []
    form.value.categoryId = ''
  }
})

// 加载分类
const loadCategories = async (examType: string) => {
  loadingCategories.value = true
  try {
    const response = await $fetch('/api/categories', {
      params: { examType }
    })
    // API directly returns an array of categories
    if (Array.isArray(response)) {
      categories.value = response
      console.log(`✅ 加载了 ${response.length} 个分类`)
    } else {
      console.error('Unexpected response format:', response)
      alert('加载分类失败：数据格式错误')
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
    alert('加载分类失败')
  } finally {
    loadingCategories.value = false
  }
}

// 生成题目
const generateQuestions = async () => {
  if (!confirm(`确定要生成 ${form.value.count} 道题目吗？`)) {
    return
  }

  generating.value = true
  progress.value = { current: 0, total: form.value.count }
  generatedQuestions.value = []

  try {
    // 根据难度级别计算难度分布
    const difficultyDistribution = form.value.difficulty === 'easy'
      ? { easy: 70, medium: 20, hard: 10 }
      : form.value.difficulty === 'hard'
      ? { easy: 10, medium: 30, hard: 60 }
      : { easy: 20, medium: 60, hard: 20 } // medium (default)

    const response = await $fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        mode: 'domain',
        categoryId: form.value.categoryId,
        count: form.value.count,
        difficultyDistribution: difficultyDistribution,
        avoidDuplicates: true
      }
    })

    if (response.success) {
      // API返回的是 { success, generated, saved, duplicates, questionIds, questionSetId, message }
      // 而不是 { success, data: { questions } }
      progress.value.current = response.saved

      // 显示成功消息
      alert(`✅ ${response.message}`)

      // 如果需要显示题目列表，需要重新获取
      if (response.questionIds && response.questionIds.length > 0) {
        // 可以在这里调用API获取题目详情
        // 暂时先设置一个空数组，用户可以去题目管理页面查看
        generatedQuestions.value = []
      }
    } else {
      alert('生成失败: ' + (response.message || '未知错误'))
    }
  } catch (error: any) {
    console.error('Failed to generate questions:', error)
    alert('生成失败: ' + (error.data?.message || error.message || '网络错误'))
  } finally {
    generating.value = false
  }
}

// 查看所有题目
const viewAllQuestions = () => {
  navigateTo('/admin/questions')
}

// 加载生成历史
const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const response = await $fetch('/api/admin/ai-history', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: { pageSize: 20 }
    }) as any

    if (response.success) {
      history.value = response.sets || []
    }
  } catch (error: any) {
    console.error('Failed to load history:', error)
    alert('加载历史记录失败')
  } finally {
    loadingHistory.value = false
  }
}

// 切换题目集展开状态
const toggleSet = (setId: string) => {
  const index = expandedSets.value.indexOf(setId)
  if (index > -1) {
    expandedSets.value.splice(index, 1)
  } else {
    expandedSets.value.push(setId)
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面加载时获取历史记录
onMounted(() => {
  loadHistory()
})
</script>
