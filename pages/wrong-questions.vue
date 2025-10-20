<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">📚 我的错题本</h1>
        <p class="text-gray-600">复习错题，巩固知识，提升考试通过率</p>
      </div>

      <!-- 考试选择器 -->
      <ExamSelector :showDescription="false" class="mb-6" />

      <!-- 统计卡片 -->
      <div class="grid md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div class="text-sm text-gray-600 mb-1">总错题数</div>
          <div class="text-3xl font-bold text-gray-900">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div class="text-sm text-gray-600 mb-1">已掌握</div>
          <div class="text-3xl font-bold text-gray-900">{{ stats.mastered }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div class="text-sm text-gray-600 mb-1">待复习</div>
          <div class="text-3xl font-bold text-gray-900">{{ stats.remaining }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div class="text-sm text-gray-600 mb-1">掌握率</div>
          <div class="text-3xl font-bold text-gray-900">{{ stats.masteryRate }}%</div>
        </div>
      </div>

      <!-- 筛选和操作 -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">筛选状态</label>
            <select
              v-model="filterMastered"
              @change="loadWrongQuestions"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">全部错题</option>
              <option value="false">未掌握</option>
              <option value="true">已掌握</option>
            </select>
          </div>

          <button
            v-if="wrongQuestions.length > 0"
            @click="startPractice"
            class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            🎯 开始练习错题
          </button>
        </div>
      </div>

      <!-- 错题列表 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="wrongQuestions.length === 0" class="bg-white rounded-xl shadow-md p-12 text-center">
        <div class="text-6xl mb-4">✨</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无错题</h3>
        <p class="text-gray-600">{{ filterMastered === 'true' ? '暂无已掌握的错题' : '继续保持！' }}</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="wrongQ in wrongQuestions"
          :key="wrongQ.id"
          class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <!-- 题目头部信息 -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    wrongQ.mastered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  ]"
                >
                  {{ wrongQ.mastered ? '✓ 已掌握' : '✗ 未掌握' }}
                </span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                  {{ wrongQ.question.category?.name }}
                </span>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    getDifficultyClass(wrongQ.question.difficulty)
                  ]"
                >
                  {{ getDifficultyText(wrongQ.question.difficulty) }}
                </span>
              </div>
              <div class="text-sm text-gray-600">
                错误次数: {{ wrongQ.wrongCount }} | 答对次数: {{ wrongQ.correctCount }} |
                掌握度: {{ wrongQ.masteryLevel }}%
              </div>
            </div>
            <button
              @click="toggleDetail(wrongQ.id)"
              class="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {{ expandedIds.has(wrongQ.id) ? '收起' : '展开' }}
            </button>
          </div>

          <!-- 题目内容（展开时显示） -->
          <div v-if="expandedIds.has(wrongQ.id)" class="border-t pt-4">
            <div class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">题目：</h4>
              <p class="text-gray-700 whitespace-pre-wrap">{{ wrongQ.question.question }}</p>
            </div>

            <div v-if="wrongQ.question.options" class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">选项：</h4>
              <div
                v-for="(option, idx) in JSON.parse(wrongQ.question.options)"
                :key="idx"
                class="py-2 px-4 mb-2 bg-gray-50 rounded-lg"
              >
                {{ option }}
              </div>
            </div>

            <div class="mb-4">
              <h4 class="font-semibold text-green-700 mb-2">正确答案：</h4>
              <p class="text-gray-700">{{ wrongQ.question.correctAnswer }}</p>
            </div>

            <div v-if="wrongQ.question.explanation" class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">答案解析：</h4>
              <p class="text-gray-700 whitespace-pre-wrap">{{ wrongQ.question.explanation }}</p>
            </div>

            <!-- 个人笔记 -->
            <div class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">个人笔记：</h4>
              <textarea
                v-model="wrongQ.notes"
                @blur="saveNotes(wrongQ)"
                placeholder="添加个人笔记..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="3"
              ></textarea>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button
                v-if="!wrongQ.mastered"
                @click="markAsMastered(wrongQ)"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ✓ 标记为已掌握
              </button>
              <button
                v-else
                @click="markAsNotMastered(wrongQ)"
                class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                ✗ 标记为未掌握
              </button>
              <button
                @click="deleteWrongQuestion(wrongQ)"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ 移除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center items-center gap-2">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <span class="px-4 py-2 text-gray-700">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 页
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useExamStore } from '~/stores/exam'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const examStore = useExamStore()
const authStore = useAuthStore()
const router = useRouter()
const wrongQuestions = ref<any[]>([])
const loading = ref(false)
const expandedIds = ref(new Set<string>())
const filterMastered = ref('all')
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

const stats = computed(() => {
  const total = wrongQuestions.value.length
  const mastered = wrongQuestions.value.filter(q => q.mastered).length
  const remaining = total - mastered
  const masteryRate = total > 0 ? ((mastered / total) * 100).toFixed(0) : '0'

  return { total, mastered, remaining, masteryRate }
})

const loadWrongQuestions = async () => {
  loading.value = true
  try {
    const params: any = {
      examType: examStore.currentExam,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }

    if (filterMastered.value !== 'all') {
      params.mastered = filterMastered.value
    }

    const response = await $fetch('/api/wrong-questions/list', {
      method: 'GET',
      headers: authStore.getAuthHeader(),
      params
    })

    if (response.success) {
      wrongQuestions.value = response.data
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('加载错题失败:', error)
  } finally {
    loading.value = false
  }
}

const toggleDetail = (id: string) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

const markAsMastered = async (wrongQ: any) => {
  try {
    const response = await $fetch('/api/wrong-questions/update-mastery', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        questionId: wrongQ.questionId,
        mastered: true,
        masteryLevel: 100
      }
    })

    if (response.success) {
      wrongQ.mastered = true
      wrongQ.masteryLevel = 100
    }
  } catch (error) {
    console.error('更新掌握状态失败:', error)
  }
}

const markAsNotMastered = async (wrongQ: any) => {
  try {
    const response = await $fetch('/api/wrong-questions/update-mastery', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        questionId: wrongQ.questionId,
        mastered: false,
        masteryLevel: 0
      }
    })

    if (response.success) {
      wrongQ.mastered = false
      wrongQ.masteryLevel = 0
    }
  } catch (error) {
    console.error('更新掌握状态失败:', error)
  }
}

const deleteWrongQuestion = async (wrongQ: any) => {
  if (!confirm('确定要从错题本中移除这道题吗？')) return

  try {
    const response = await $fetch('/api/wrong-questions/delete', {
      method: 'DELETE',
      headers: authStore.getAuthHeader(),
      params: {
        questionId: wrongQ.questionId
      }
    })

    if (response.success) {
      await loadWrongQuestions()
    }
  } catch (error) {
    console.error('删除错题失败:', error)
  }
}

const saveNotes = async (wrongQ: any) => {
  // TODO: 实现保存笔记的API
  console.log('保存笔记:', wrongQ.notes)
}

const startPractice = () => {
  // 跳转到错题练习模式
  router.push('/practice?mode=wrong-questions')
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadWrongQuestions()
}

const getDifficultyClass = (difficulty: string) => {
  const classes: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  }
  return classes[difficulty] || classes.medium
}

const getDifficultyText = (difficulty: string) => {
  const texts: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty] || '中等'
}

onMounted(() => {
  loadWrongQuestions()
})
</script>
