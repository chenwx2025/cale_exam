<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">题目集列表</h1>
        <p class="text-gray-600">选择已生成的题目集或创建新的考试</p>
      </div>

      <!-- Exam Type Selector -->
      <ExamSelector :showDescription="true" class="mb-8" />

      <!-- Action Buttons -->
      <div class="flex gap-4 mb-8">
        <NuxtLink
          to="/exam/config"
          class="flex-1 bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          手动配置新考试
        </NuxtLink>
      </div>

      <!-- Batch Actions Bar (shown when items selected) -->
      <div v-if="selectedIds.length > 0" class="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="font-semibold text-gray-900">已选择 {{ selectedIds.length }} 个题目集</span>
        </div>
        <div class="flex gap-3">
          <button
            @click="clearSelection"
            class="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg border border-gray-300 transition-all duration-200"
          >
            取消选择
          </button>
          <button
            @click="confirmBatchDelete"
            :disabled="deleting"
            class="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            {{ deleting ? '删除中...' : '批量删除' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">加载中...</p>
      </div>

      <!-- Question Sets List -->
      <div v-else-if="questionSets.length > 0" class="space-y-4">
        <div
          v-for="set in questionSets"
          :key="set.id"
          class="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
          :class="{ 'ring-2 ring-blue-500': selectedIds.includes(set.id) }"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <!-- Checkbox -->
              <div class="flex items-start gap-4 flex-1">
                <label class="flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(set.id)"
                    @change="toggleSelection(set.id)"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                </label>
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-bold text-gray-900">{{ set.title }}</h3>
                    <span
                      v-if="set.mode === 'ai_generated'"
                      class="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full"
                    >
                      AI生成
                    </span>
                    <span
                      v-else-if="set.mode === 'mock'"
                      class="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full"
                    >
                      全真模拟
                    </span>
                    <span
                      v-else
                      class="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full"
                    >
                      手动配置
                    </span>
                  </div>
                  <p class="text-sm text-gray-500">
                    创建时间: {{ formatDate(set.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="text-xs text-blue-600 font-semibold mb-1">题目数量</div>
                <div class="text-2xl font-bold text-blue-700">{{ set.questionCount }}</div>
              </div>
              <div class="bg-green-50 rounded-lg p-3">
                <div class="text-xs text-green-600 font-semibold mb-1">考试时长</div>
                <div class="text-2xl font-bold text-green-700">{{ set.duration }}分</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-3">
                <div class="text-xs text-purple-600 font-semibold mb-1">简单题</div>
                <div class="text-2xl font-bold text-purple-700">{{ set.difficulties.easy }}</div>
              </div>
              <div class="bg-orange-50 rounded-lg p-3">
                <div class="text-xs text-orange-600 font-semibold mb-1">困难题</div>
                <div class="text-2xl font-bold text-orange-700">{{ set.difficulties.hard }}</div>
              </div>
            </div>

            <!-- Difficulty Distribution Bar -->
            <div class="mb-4">
              <div class="text-xs text-gray-600 font-semibold mb-2">难度分布</div>
              <div class="flex h-3 rounded-full overflow-hidden bg-gray-100">
                <div
                  v-if="set.difficulties.easy > 0"
                  :style="{ width: `${(set.difficulties.easy / set.questionCount) * 100}%` }"
                  class="bg-green-400"
                  :title="`简单: ${set.difficulties.easy}题`"
                ></div>
                <div
                  v-if="set.difficulties.medium > 0"
                  :style="{ width: `${(set.difficulties.medium / set.questionCount) * 100}%` }"
                  class="bg-yellow-400"
                  :title="`中等: ${set.difficulties.medium}题`"
                ></div>
                <div
                  v-if="set.difficulties.hard > 0"
                  :style="{ width: `${(set.difficulties.hard / set.questionCount) * 100}%` }"
                  class="bg-red-400"
                  :title="`困难: ${set.difficulties.hard}题`"
                ></div>
              </div>
            </div>

            <!-- Generation Info -->
            <div v-if="set.mode === 'ai_generated'" class="mb-4 text-sm text-gray-600">
              <span class="font-semibold">生成方式:</span>
              <span v-if="set.generatedBy === 'domain'" class="ml-2">按领域生成</span>
              <span v-else-if="set.generatedBy === 'proportion'" class="ml-2">按考试比例生成</span>
            </div>

            <!-- Action Button -->
            <button
              @click="startPractice(set.id)"
              class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              开始练习
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">暂无题目集</h3>
        <p class="text-gray-600 mb-6">还没有生成任何题目集，请先在管理后台生成题目或手动配置考试</p>
        <div class="flex gap-4 justify-center">
          <NuxtLink
            to="/admin"
            class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            前往管理后台
          </NuxtLink>
          <NuxtLink
            to="/exam/config"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            手动配置考试
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '~/stores/exam'

const router = useRouter()
const examStore = useExamStore()

interface QuestionSet {
  id: string
  title: string
  questionCount: number
  duration: number
  mode: string
  generatedBy: string | null
  categoryId: string | null
  status: string
  createdAt: string
  difficulties: {
    easy: number
    medium: number
    hard: number
  }
}

const questionSets = ref<QuestionSet[]>([])
const loading = ref(true)
const selectedIds = ref<string[]>([])
const deleting = ref(false)

const fetchQuestionSets = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/question-sets/list', {
      method: 'GET',
      query: {
        userId: 'demo-user',
        examType: examStore.currentExamType
      }
    })
    questionSets.value = response.questionSets
  } catch (error: any) {
    console.error('Failed to fetch question sets:', error)
    alert('获取题目集列表失败: ' + (error.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const startPractice = (setId: string) => {
  router.push(`/exam/${setId}`)
}

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

const toggleSelection = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const clearSelection = () => {
  selectedIds.value = []
}

const confirmBatchDelete = () => {
  const count = selectedIds.value.length
  if (confirm(`确定要删除选中的 ${count} 个题目集吗？\n\n此操作不可恢复，所有相关的答题记录也会被删除。`)) {
    batchDelete()
  }
}

const batchDelete = async () => {
  try {
    deleting.value = true
    const response = await $fetch('/api/question-sets/delete', {
      method: 'POST',
      body: {
        examIds: selectedIds.value
      }
    })

    if (response.success) {
      alert(response.message)
      selectedIds.value = []
      await fetchQuestionSets()
    } else {
      alert('删除失败: ' + response.message)
    }
  } catch (error: any) {
    console.error('Delete error:', error)
    alert('删除失败: ' + (error.data?.message || error.message))
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchQuestionSets()
})

// 监听考试类型变化
watch(() => examStore.currentExamType, () => {
  fetchQuestionSets()
  selectedIds.value = [] // 切换考试类型时清空选择
})
</script>
