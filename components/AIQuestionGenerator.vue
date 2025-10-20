<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      </div>
      <div>
        <h2 class="text-xl font-bold">AI 智能题目生成</h2>
        <p class="text-sm text-gray-600">使用AI自动生成高质量题目</p>
      </div>
    </div>

    <form @submit.prevent="generateQuestions" class="space-y-4">
      <!-- 生成模式选择 -->
      <div>
        <label class="block font-semibold mb-2">生成模式</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="config.mode = 'domain'"
            class="p-4 rounded-lg border-2 transition-all text-left"
            :class="config.mode === 'domain'
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'"
          >
            <div class="font-semibold mb-1">按领域生成</div>
            <div class="text-sm text-gray-600">选择特定Domain生成题目</div>
          </button>
          <button
            type="button"
            @click="config.mode = 'proportion'"
            class="p-4 rounded-lg border-2 transition-all text-left"
            :class="config.mode === 'proportion'
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'"
          >
            <div class="font-semibold mb-1">按考试比例生成</div>
            <div class="text-sm text-gray-600">按照官方考试比例分配</div>
          </button>
        </div>
      </div>

      <!-- 按领域生成 - 选择Domain -->
      <div v-if="config.mode === 'domain'">
        <label class="block font-semibold mb-2">选择领域</label>
        <select
          v-model="config.categoryId"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        >
          <option value="">请选择...</option>
          <option v-for="category in contentCategories" :key="category.id" :value="category.id">
            {{ category.name }} ({{ category.code }}) - 当前 {{ category._count?.questions || 0 }} 题
          </option>
        </select>
      </div>

      <!-- 题目数量选择 -->
      <div>
        <label class="block font-semibold mb-2">生成数量</label>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="count in [10, 20, 50, 100, 200]"
            :key="count"
            type="button"
            @click="config.count = count"
            class="py-3 px-4 rounded-lg font-semibold transition-all"
            :class="config.count === count
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ count }} 题
          </button>
        </div>
      </div>

      <!-- 难度分布 -->
      <div>
        <label class="block font-semibold mb-2">难度分布</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="preset in difficultyPresets"
            :key="preset.name"
            type="button"
            @click="config.difficultyDistribution = preset.value"
            class="p-3 rounded-lg border-2 transition-all text-left"
            :class="JSON.stringify(config.difficultyDistribution) === JSON.stringify(preset.value)
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'"
          >
            <div class="font-semibold text-sm mb-1">{{ preset.name }}</div>
            <div class="text-xs text-gray-600">
              简{{ preset.value.easy }}% 中{{ preset.value.medium }}% 难{{ preset.value.hard }}%
            </div>
          </button>
        </div>
      </div>

      <!-- 考试比例分布（仅在按比例模式显示） -->
      <div v-if="config.mode === 'proportion'" class="p-4 bg-blue-50 rounded-lg">
        <h3 class="font-semibold text-blue-900 mb-3">CALE 官方考试比例</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-blue-700">Domain 1 (Patient Assessment):</span>
            <span class="font-semibold text-blue-900">27% ≈ {{ Math.round(config.count * 0.27) }} 题</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Domain 2 (Diagnosis):</span>
            <span class="font-semibold text-blue-900">17% ≈ {{ Math.round(config.count * 0.17) }} 题</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Domain 3A (Acupuncture Selection):</span>
            <span class="font-semibold text-blue-900">16% ≈ {{ Math.round(config.count * 0.16) }} 题</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Domain 3B (Needling Technique):</span>
            <span class="font-semibold text-blue-900">8% ≈ {{ Math.round(config.count * 0.08) }} 题</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Domain 3C (Adjunctive):</span>
            <span class="font-semibold text-blue-900">5% ≈ {{ Math.round(config.count * 0.05) }} 题</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Domain 4 (Herbal):</span>
            <span class="font-semibold text-blue-900">15% ≈ {{ Math.round(config.count * 0.15) }} 题</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Domain 5 (Professional):</span>
            <span class="font-semibold text-blue-900">11% ≈ {{ Math.round(config.count * 0.11) }} 题</span>
          </div>
        </div>
      </div>

      <!-- 高级选项 -->
      <details class="border border-gray-200 rounded-lg">
        <summary class="px-4 py-3 cursor-pointer font-semibold hover:bg-gray-50 rounded-lg">
          高级选项
        </summary>
        <div class="p-4 space-y-3">
          <div class="flex items-center gap-2">
            <input
              v-model="config.avoidDuplicates"
              type="checkbox"
              id="avoidDuplicates"
              class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label for="avoidDuplicates" class="text-sm">避免与现有题目重复（AI会检查相似度）</label>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="config.includeExplanations"
              type="checkbox"
              id="includeExplanations"
              class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label for="includeExplanations" class="text-sm">生成详细答案解析</label>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="config.varyQuestionFormat"
              type="checkbox"
              id="varyQuestionFormat"
              class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label for="varyQuestionFormat" class="text-sm">变化题目问法（同一知识点不同表述）</label>
          </div>
        </div>
      </details>

      <!-- 提交按钮 -->
      <button
        type="submit"
        :disabled="generating || (config.mode === 'domain' && !config.categoryId)"
        class="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg v-if="generating" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <span>{{ generating ? `生成中... ${progress}%` : '开始生成题目' }}</span>
      </button>
    </form>

    <!-- 生成结果 -->
    <div v-if="result" class="mt-6 p-4 rounded-lg" :class="result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
      <div class="flex items-start gap-3">
        <svg v-if="result.success" class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <svg v-else class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div class="flex-1">
          <p class="font-semibold" :class="result.success ? 'text-green-900' : 'text-red-900'">
            {{ result.message }}
          </p>
          <div v-if="result.details" class="mt-2 text-sm" :class="result.success ? 'text-green-700' : 'text-red-700'">
            <p v-if="result.details.generated">生成题目：{{ result.details.generated }} 道</p>
            <p v-if="result.details.saved">成功保存：{{ result.details.saved }} 道</p>
            <p v-if="result.details.duplicates">去重过滤：{{ result.details.duplicates }} 道</p>
            <p v-if="result.details.errors && result.details.errors.length > 0">
              错误：{{ result.details.errors.join(', ') }}
            </p>
          </div>
          <!-- 操作按钮 -->
          <div v-if="result.success && result.details.saved > 0" class="mt-4 flex gap-3">
            <button
              @click="viewQuestionSets"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              查看题目集列表
            </button>
            <button
              @click="startPractice"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              立即练习
            </button>
            <button
              @click="result = null"
              class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categories?: any[]
}>()

const emit = defineEmits<{
  (e: 'generated'): void
}>()

const config = ref({
  mode: 'domain' as 'domain' | 'proportion',
  categoryId: '',
  count: 20,
  difficultyDistribution: {
    easy: 30,
    medium: 50,
    hard: 20
  },
  avoidDuplicates: true,
  includeExplanations: true,
  varyQuestionFormat: true
})

const generating = ref(false)
const progress = ref(0)
const result = ref<any>(null)

const difficultyPresets = [
  { name: '简单', value: { easy: 70, medium: 25, hard: 5 } },
  { name: '标准', value: { easy: 30, medium: 50, hard: 20 } },
  { name: '困难', value: { easy: 10, medium: 40, hard: 50 } }
]

const contentCategories = computed(() => {
  return props.categories?.filter(c => c.type === 'content') || []
})

const generateQuestions = async () => {
  generating.value = true
  progress.value = 0
  result.value = null

  try {
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 15
      }
    }, 500)

    const response = await $fetch('/api/ai/generate-questions', {
      method: 'POST',
      body: config.value
    })

    clearInterval(progressInterval)
    progress.value = 100

    result.value = {
      success: true,
      message: '题目生成成功！',
      details: response,
      questionIds: response.questionIds || [],
      categoryId: config.value.categoryId
    }

    // 通知父组件刷新数据
    emit('generated')
  } catch (error: any) {
    result.value = {
      success: false,
      message: '生成失败：' + (error.data?.message || error.message || '未知错误'),
      details: error.data
    }
  } finally {
    generating.value = false
  }
}

const viewQuestionSets = () => {
  const router = useRouter()
  router.push('/exam/question-sets')
}

const startPractice = async () => {
  const router = useRouter()

  try {
    // 直接使用刚创建的题目集ID
    if (result.value.questionSetId) {
      router.push(`/exam/${result.value.questionSetId}`)
    } else {
      // 如果没有questionSetId（老版本兼容），创建一个练习session
      const response = await $fetch('/api/practice/create', {
        method: 'POST',
        body: {
          userId: 'demo-user',
          questionIds: result.value.questionIds,
          categoryId: result.value.categoryId,
          mode: 'ai_generated',
          title: `AI生成练习 - ${result.value.details.saved}题`
        }
      })
      router.push(`/practice/${response.practiceId}`)
    }
  } catch (error: any) {
    alert('开始练习失败: ' + (error.data?.message || error.message || '未知错误'))
  }
}
</script>
