<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    @click.self="close"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">⚙️ 每日一题设置</h2>
          <button
            @click="close"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载配置中...</p>
      </div>

      <!-- Content -->
      <div v-else class="p-6 space-y-6">
        <!-- Enable/Disable Toggle -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">启用自动生成</h3>
              <p class="text-sm text-gray-600 mt-1">每天自动为小组选择一道智能题目</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="config.enabled"
                class="sr-only peer"
              >
              <div class="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <!-- Generate Time -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">生成时间</label>
          <input
            type="time"
            v-model="config.generateTime"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="00:00"
          >
          <p class="text-xs text-gray-500">每天在这个时间自动生成新题目</p>
        </div>

        <!-- Difficulty Selection -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">难度偏好</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="diff in difficultyOptions"
              :key="diff.value"
              @click="config.difficulty = diff.value"
              :class="[
                'px-4 py-3 rounded-lg border-2 transition-all font-medium',
                config.difficulty === diff.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-400 text-gray-700'
              ]"
            >
              {{ diff.label }}
            </button>
          </div>
        </div>

        <!-- Exclude Recent Days -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">排除最近出现的题目</label>
          <input
            type="number"
            v-model.number="config.excludeRecent"
            min="1"
            max="30"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <p class="text-xs text-gray-500">排除最近 {{ config.excludeRecent }} 天内出现过的题目</p>
        </div>

        <!-- Prioritize Weak Areas -->
        <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-5">
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              v-model="config.prioritizeWeak"
              class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            >
            <div>
              <h3 class="text-sm font-semibold text-gray-800">优先选择组员薄弱领域</h3>
              <p class="text-xs text-gray-600 mt-1">
                根据组员的错题统计，优先从错误率高的领域出题
              </p>
            </div>
          </div>
        </div>

        <!-- Focus Domains (Optional) -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">
            关注领域 <span class="text-gray-400 font-normal">(可选)</span>
          </label>
          <div class="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4">
            <div v-if="categories.length === 0" class="text-center py-4 text-gray-500 text-sm">
              暂无分类数据
            </div>
            <div v-else class="space-y-2">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="category.name"
                  v-model="selectedCategories"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                >
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800">{{ category.name }}</div>
                  <div v-if="category.description" class="text-xs text-gray-500">{{ category.description }}</div>
                </div>
              </label>
            </div>
          </div>
          <p class="text-xs text-gray-500">
            已选择 {{ selectedCategories.length }} 个领域，留空则从所有领域选择
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex gap-3">
        <button
          @click="close"
          class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          取消
        </button>
        <button
          @click="save"
          :disabled="saving"
          class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  show: Boolean,
  groupId: String,
  examType: String
})

const emit = defineEmits(['close', 'saved'])

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const categories = ref([])
const selectedCategories = ref([])

const config = ref({
  enabled: false,
  generateTime: '00:00',
  difficulty: 'mixed',
  focusDomains: null,
  excludeRecent: 7,
  prioritizeWeak: true
})

const difficultyOptions = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
  { value: 'mixed', label: '混合' }
]

// Watch show prop to load config and categories
watch(() => props.show, async (newVal) => {
  if (newVal) {
    await Promise.all([
      loadCategories(),
      loadConfig()
    ])
  }
})

// Load categories for the exam type
async function loadCategories() {
  if (!props.examType) return

  try {
    const response = await $fetch(`/api/categories/${props.examType}`)

    if (response.success && response.data) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('[DailyQuestionSettings] 加载分类失败:', error)
  }
}

// Load configuration
async function loadConfig() {
  if (!props.groupId) return

  loading.value = true
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/daily-question-config`, {
      headers: authStore.getAuthHeader()
    })

    if (response.success && response.data) {
      config.value = {
        enabled: response.data.enabled || false,
        generateTime: response.data.generateTime || '00:00',
        difficulty: response.data.difficulty || 'mixed',
        focusDomains: response.data.focusDomains,
        excludeRecent: response.data.excludeRecent || 7,
        prioritizeWeak: response.data.prioritizeWeak !== false
      }

      // Parse focus domains (category names) from config
      if (config.value.focusDomains) {
        try {
          const domains = JSON.parse(config.value.focusDomains)
          selectedCategories.value = Array.isArray(domains) ? domains : []
        } catch (e) {
          selectedCategories.value = []
        }
      } else {
        selectedCategories.value = []
      }
    }
  } catch (error) {
    console.error('[DailyQuestionSettings] 加载配置失败:', error)
  } finally {
    loading.value = false
  }
}

// Save configuration
async function save() {
  if (!props.groupId) return

  saving.value = true
  try {
    // Prepare focus domains from selected categories
    let focusDomains = null
    if (selectedCategories.value.length > 0) {
      focusDomains = JSON.stringify(selectedCategories.value)
    }

    const response = await $fetch(`/api/study-groups/${props.groupId}/daily-question-config`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        enabled: config.value.enabled,
        generateTime: config.value.generateTime,
        difficulty: config.value.difficulty,
        focusDomains,
        excludeRecent: config.value.excludeRecent,
        prioritizeWeak: config.value.prioritizeWeak
      }
    })

    if (response.success) {
      console.log('[DailyQuestionSettings] 配置保存成功')
      emit('saved')
      close()
    }
  } catch (error) {
    console.error('[DailyQuestionSettings] 保存配置失败:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// Close modal
function close() {
  emit('close')
}
</script>
