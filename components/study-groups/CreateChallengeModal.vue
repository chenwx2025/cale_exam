<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="close">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">创建小组挑战</h2>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitChallenge" class="space-y-6">
          <!-- Challenge Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">挑战名称 *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="例如：30天答题马拉松"
            />
          </div>

          <!-- Challenge Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">挑战类型 *</label>
            <select
              v-model="formData.type"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">请选择挑战类型</option>
              <option value="daily_questions">每日答题 - 每天完成指定数量的题目</option>
              <option value="total_questions">总题数目标 - 在期限内完成总题数</option>
              <option value="accuracy_target">正确率目标 - 达到指定正确率</option>
              <option value="knowledge_mastery">知识点掌握 - 掌握指定数量的知识点</option>
              <option value="study_streak">学习连续性 - 连续学习指定天数</option>
            </select>
          </div>

          <!-- Target -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              目标值 *
              <span class="text-gray-500 text-xs">({{ getTargetHint() }})</span>
            </label>
            <input
              v-model.number="formData.target"
              type="number"
              required
              min="1"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :placeholder="getTargetPlaceholder()"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">挑战描述</label>
            <textarea
              v-model="formData.description"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="详细描述这个挑战的目标和规则..."
            ></textarea>
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">开始日期 *</label>
              <input
                v-model="formData.startDate"
                type="date"
                required
                :min="today"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">结束日期 *</label>
              <input
                v-model="formData.endDate"
                type="date"
                required
                :min="formData.startDate || today"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Preview -->
          <div v-if="formData.type" class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div class="text-sm font-medium text-purple-900 mb-2">挑战预览</div>
            <div class="text-sm text-purple-700">
              <p class="mb-1">
                <strong>{{ formData.name || '挑战名称' }}</strong>
              </p>
              <p class="mb-1">
                {{ getChallengeTypeLabel(formData.type) }}：{{ formData.target || 0 }} {{ getTargetUnit(formData.type) }}
              </p>
              <p v-if="formData.startDate && formData.endDate">
                时间：{{ formData.startDate }} 至 {{ formData.endDate }}
                ({{ calculateDuration() }} 天)
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="close"
              class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {{ isSubmitting ? '创建中...' : '创建挑战' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  groupId: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    default: 'cale'
  }
})

const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()

const formData = ref({
  name: '',
  type: '',
  target: null,
  description: '',
  startDate: '',
  endDate: ''
})

const isSubmitting = ref(false)

const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// Reset form
function resetForm() {
  formData.value = {
    name: '',
    type: '',
    target: null,
    description: '',
    startDate: '',
    endDate: ''
  }
}

// Close modal
function close() {
  emit('close')
}

// Submit challenge
async function submitChallenge() {
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[CreateChallenge] 使用扁平路由 API 创建挑战')
    const response = await $fetch(`/api/study-group-challenges`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        groupId: props.groupId,
        name: formData.value.name,
        examType: props.examType,
        targetType: formData.value.type,
        targetValue: formData.value.target,
        description: formData.value.description,
        startDate: new Date(formData.value.startDate).toISOString(),
        endDate: new Date(formData.value.endDate + 'T23:59:59').toISOString()
      }
    })
    console.log('[CreateChallenge] 挑战创建响应:', response)

    if (response && response.success) {
      console.log('[CreateChallenge] 挑战创建成功:', response.data.id)
      emit('created', response.data)
      close()
    }
  } catch (err) {
    console.error('[CreateChallenge] 创建挑战异常:', err)
    alert('创建挑战失败: ' + (err.data?.message || err.message || '未知错误'))
  } finally {
    isSubmitting.value = false
  }
}

// Get target hint
function getTargetHint() {
  const hints = {
    'daily_questions': '每天需要完成的题目数量',
    'total_questions': '挑战期间需要完成的总题数',
    'accuracy_target': '需要达到的正确率百分比 (1-100)',
    'knowledge_mastery': '需要掌握的知识点数量',
    'study_streak': '需要连续学习的天数'
  }
  return hints[formData.value.type] || '请选择挑战类型'
}

// Get target placeholder
function getTargetPlaceholder() {
  const placeholders = {
    'daily_questions': '例如：10',
    'total_questions': '例如：300',
    'accuracy_target': '例如：85',
    'knowledge_mastery': '例如：50',
    'study_streak': '例如：30'
  }
  return placeholders[formData.value.type] || '请输入目标值'
}

// Get challenge type label
function getChallengeTypeLabel(type) {
  const labels = {
    'daily_questions': '每日答题',
    'total_questions': '总题数',
    'accuracy_target': '正确率',
    'knowledge_mastery': '知识点',
    'study_streak': '连续学习'
  }
  return labels[type] || type
}

// Get target unit
function getTargetUnit(type) {
  const units = {
    'daily_questions': '题/天',
    'total_questions': '题',
    'accuracy_target': '%',
    'knowledge_mastery': '个',
    'study_streak': '天'
  }
  return units[type] || ''
}

// Calculate duration
function calculateDuration() {
  if (!formData.value.startDate || !formData.value.endDate) return 0
  const start = new Date(formData.value.startDate)
  const end = new Date(formData.value.endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays
}
</script>
