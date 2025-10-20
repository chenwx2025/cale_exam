<template>
  <div>
    <!-- 题目管理内容 -->
    <div key="questions-content">
      <!-- 考试选择器 -->
      <ExamSelector :showDescription="true" class="mb-8" />

      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">题目管理</h1>
          <NuxtLink
            to="/admin"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回管理后台
          </NuxtLink>
        </div>

        <!-- 筛选和搜索 -->
        <div class="grid md:grid-cols-4 gap-4 mb-6">
          <div>
            <label class="block text-sm font-semibold mb-2">分类</label>
            <select
              v-model="filters.categoryId"
              @change="fetchQuestions"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">全部分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }} ({{ cat.code }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">难度</label>
            <select
              v-model="filters.difficulty"
              @change="fetchQuestions"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">全部难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">搜索</label>
            <input
              v-model="filters.search"
              @input="debounceSearch"
              type="text"
              placeholder="搜索题目或解析..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">每页显示</label>
            <select
              v-model="filters.pageSize"
              @change="fetchQuestions"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option :value="10">10 条</option>
              <option :value="20">20 条</option>
              <option :value="50">50 条</option>
              <option :value="100">100 条</option>
            </select>
          </div>
        </div>

        <!-- 批量操作栏 -->
        <div v-if="questions && questions.length > 0" class="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
            />
            <span class="text-sm font-semibold text-gray-700">
              全选 (已选择 {{ selectedQuestions.length }} 道题目)
            </span>
          </div>
          <button
            v-if="selectedQuestions.length > 0"
            @click="confirmBulkDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
          >
            批量删除 ({{ selectedQuestions.length }})
          </button>
        </div>

        <!-- 统计信息 -->
        <div v-if="pagination" class="mb-4 text-sm text-gray-600">
          共 {{ pagination.total }} 道题目，当前第 {{ pagination.page }}/{{ pagination.totalPages }} 页
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">加载中...</p>
        </div>

        <!-- 题目列表 -->
        <div v-else-if="questions && questions.length > 0" class="space-y-4">
          <div
            v-for="question in questions"
            :key="question.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            :class="{ 'ring-2 ring-blue-400': isQuestionSelected(question.id) }"
          >
            <!-- 题目头部 -->
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  :checked="isQuestionSelected(question.id)"
                  @change="toggleQuestionSelection(question.id)"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600 flex-shrink-0"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded"
                    :class="{
                      'bg-green-100 text-green-700': question.difficulty === 'easy',
                      'bg-yellow-100 text-yellow-700': question.difficulty === 'medium',
                      'bg-red-100 text-red-700': question.difficulty === 'hard'
                    }"
                  >
                    {{ difficultyLabel(question.difficulty) }}
                  </span>
                  <span v-if="question.category" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {{ question.category.name }} ({{ question.category.code }})
                  </span>
                </div>
                <p class="font-semibold text-gray-800">{{ question.question }}</p>
                </div>
              </div>
              <div class="flex gap-2 ml-4 flex-shrink-0">
                <button
                  @click="editQuestion(question)"
                  class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                >
                  编辑
                </button>
                <button
                  @click="confirmDelete(question)"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                >
                  删除
                </button>
              </div>
            </div>

            <!-- 选项 -->
            <div class="mb-3 space-y-1">
              <div
                v-for="(option, index) in question.options"
                :key="index"
                class="text-sm px-3 py-2 rounded"
                :class="option === question.correctAnswer ? 'bg-green-50 text-green-700 font-semibold' : 'bg-gray-50 text-gray-700'"
              >
                {{ option }}
                <span v-if="option === question.correctAnswer" class="ml-2 text-xs">(正确答案)</span>
              </div>
            </div>

            <!-- 解析 -->
            <div v-if="question.explanation" class="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <span class="font-semibold">解析：</span>{{ question.explanation }}
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-12 text-gray-500">
          暂无题目
        </div>

        <!-- 分页 -->
        <div v-if="pagination && pagination.totalPages > 1" class="mt-6 flex justify-center gap-2">
          <button
            @click="goToPage(1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            首页
          </button>
          <button
            @click="goToPage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
            {{ pagination.page }} / {{ pagination.totalPages }}
          </span>
          <button
            @click="goToPage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
          <button
            @click="goToPage(pagination.totalPages)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            末页
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑题目模态框 -->
    <div
      v-if="editingQuestion"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditModal"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">编辑题目</h2>
          <button
            @click="closeEditModal"
            class="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="saveQuestion" class="space-y-4">
          <!-- 题目内容 -->
          <div>
            <label class="block font-semibold mb-2">题目内容 *</label>
            <textarea
              v-model="editForm.question"
              required
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              placeholder="请输入题目内容"
            ></textarea>
          </div>

          <!-- 分类 -->
          <div>
            <label class="block font-semibold mb-2">分类</label>
            <select
              v-model="editForm.categoryId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">无分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }} ({{ cat.code }})
              </option>
            </select>
          </div>

          <!-- 难度 -->
          <div>
            <label class="block font-semibold mb-2">难度 *</label>
            <select
              v-model="editForm.difficulty"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>

          <!-- 选项 -->
          <div>
            <label class="block font-semibold mb-2">选项 *</label>
            <div class="space-y-2">
              <div v-for="(option, index) in editForm.options" :key="index" class="flex gap-2">
                <input
                  v-model="editForm.options[index]"
                  required
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  :placeholder="`选项 ${index + 1}`"
                />
                <button
                  v-if="editForm.options.length > 2"
                  @click="removeOption(index)"
                  type="button"
                  class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  删除
                </button>
              </div>
              <button
                @click="addOption"
                type="button"
                class="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                + 添加选项
              </button>
            </div>
          </div>

          <!-- 正确答案 -->
          <div>
            <label class="block font-semibold mb-2">正确答案 *</label>
            <select
              v-model="editForm.correctAnswer"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">请选择正确答案</option>
              <option v-for="(option, index) in editForm.options" :key="index" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- 解析 -->
          <div>
            <label class="block font-semibold mb-2">答案解析</label>
            <textarea
              v-model="editForm.explanation"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              placeholder="请输入答案解析（可选）"
            ></textarea>
          </div>

          <!-- 参考资料 -->
          <div>
            <label class="block font-semibold mb-2">参考资料</label>
            <input
              v-model="editForm.reference"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              placeholder="例如：教材页码、参考书目等"
            />
          </div>

          <!-- 按钮 -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {{ saving ? '保存中...' : '保存修改' }}
            </button>
            <button
              @click="closeEditModal"
              type="button"
              class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div
      v-if="deletingQuestion"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="deletingQuestion = null"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">确认删除</h2>
        <p class="text-gray-600 mb-6">
          确定要删除这道题目吗？此操作无法撤销。
        </p>
        <div class="bg-gray-50 p-3 rounded-lg mb-6">
          <p class="text-sm font-semibold text-gray-700">{{ deletingQuestion.question }}</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="deleteQuestion"
            :disabled="deleting"
            class="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400"
          >
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
          <button
            @click="deletingQuestion = null"
            class="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 批量删除确认模态框 -->
    <div
      v-if="showBulkDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showBulkDeleteConfirm = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4 text-red-600">确认批量删除</h2>
        <p class="text-gray-600 mb-4">
          确定要删除选中的 <span class="font-bold text-red-600">{{ selectedQuestions.length }}</span> 道题目吗？
        </p>
        <p class="text-sm text-gray-500 mb-6">
          此操作无法撤销，请谨慎操作。
        </p>
        <div class="flex gap-3">
          <button
            @click="bulkDeleteQuestions"
            :disabled="bulkDeleting"
            class="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400"
          >
            {{ bulkDeleting ? '删除中...' : `确认删除 ${selectedQuestions.length} 道题目` }}
          </button>
          <button
            @click="showBulkDeleteConfirm = false"
            :disabled="bulkDeleting"
            class="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useExamStore } from '~/stores/exam'

const examStore = useExamStore()
const currentExamType = computed(() => examStore.currentExamType)

// 认证状态检查
const checkAuth = () => {
  if (process.client) {
    const auth = localStorage.getItem('admin_auth')
    if (auth) {
      try {
        const data = JSON.parse(auth)
        if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return true
        }
      } catch (e) {
        localStorage.removeItem('admin_auth')
      }
    }
  }
  return false
}

const isAuthenticated = ref(false)

onMounted(() => {
  isAuthenticated.value = checkAuth()
  // 监听认证状态变化
  const checkInterval = setInterval(() => {
    isAuthenticated.value = checkAuth()
  }, 1000)

  // 清理
  onUnmounted(() => clearInterval(checkInterval))
})

// 筛选条件
const filters = ref({
  categoryId: '',
  difficulty: '',
  search: '',
  page: 1,
  pageSize: 20
})

// 数据
const questions = ref<any[]>([])
const categories = ref<any[]>([])
const pagination = ref<any>(null)
const loading = ref(false)

// 编辑相关
const editingQuestion = ref<any>(null)
const editForm = ref<any>({})
const saving = ref(false)

// 删除相关
const deletingQuestion = ref<any>(null)
const deleting = ref(false)

// 批量删除相关
const selectedQuestions = ref<string[]>([])
const showBulkDeleteConfirm = ref(false)
const bulkDeleting = ref(false)

// 搜索防抖
let searchTimeout: NodeJS.Timeout | null = null
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    fetchQuestions()
  }, 500)
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await $fetch('/api/categories', {
      query: { examType: currentExamType.value }
    })
    categories.value = response as any[]
  } catch (error: any) {
    console.error('Fetch categories error:', error)
  }
}

// 批量选择相关computed
const isAllSelected = computed(() => {
  return questions.value.length > 0 && selectedQuestions.value.length === questions.value.length
})

// 检查题目是否被选中
const isQuestionSelected = (questionId: string) => {
  return selectedQuestions.value.includes(questionId)
}

// 切换单个题目选择
const toggleQuestionSelection = (questionId: string) => {
  const index = selectedQuestions.value.indexOf(questionId)
  if (index > -1) {
    selectedQuestions.value.splice(index, 1)
  } else {
    selectedQuestions.value.push(questionId)
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedQuestions.value = []
  } else {
    selectedQuestions.value = questions.value.map(q => q.id)
  }
}

// 获取题目列表
const fetchQuestions = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/questions/list', {
      query: {
        examType: currentExamType.value,
        categoryId: filters.value.categoryId || undefined,
        difficulty: filters.value.difficulty || undefined,
        search: filters.value.search || undefined,
        page: filters.value.page,
        pageSize: filters.value.pageSize
      }
    }) as any

    // 解析 options 字段（从JSON字符串转换为数组）
    questions.value = response.questions.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }))
    pagination.value = response.pagination

    // 清空选择
    selectedQuestions.value = []
  } catch (error: any) {
    console.error('Fetch questions error:', error)
    alert('加载题目失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 翻页
const goToPage = (page: number) => {
  filters.value.page = page
  fetchQuestions()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 难度标签
const difficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[difficulty] || difficulty
}

// 编辑题目
const editQuestion = (question: any) => {
  editForm.value = {
    id: question.id,
    question: question.question,
    categoryId: question.categoryId || '',
    difficulty: question.difficulty,
    options: [...question.options],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || '',
    reference: question.reference || ''
  }
  editingQuestion.value = question
}

// 关闭编辑模态框
const closeEditModal = () => {
  editingQuestion.value = null
  editForm.value = {}
}

// 添加选项
const addOption = () => {
  editForm.value.options.push('')
}

// 删除选项
const removeOption = (index: number) => {
  if (editForm.value.options.length <= 2) {
    alert('至少需要保留2个选项')
    return
  }

  const removedOption = editForm.value.options[index]
  editForm.value.options.splice(index, 1)

  // 如果删除的是正确答案，清空正确答案选择
  if (editForm.value.correctAnswer === removedOption) {
    editForm.value.correctAnswer = ''
  }
}

// 保存题目
const saveQuestion = async () => {
  saving.value = true
  try {
    await $fetch(`/api/admin/questions/${editForm.value.id}`, {
      method: 'PUT',
      body: {
        question: editForm.value.question,
        categoryId: editForm.value.categoryId || null,
        difficulty: editForm.value.difficulty,
        options: editForm.value.options,
        correctAnswer: editForm.value.correctAnswer,
        explanation: editForm.value.explanation,
        reference: editForm.value.reference
      }
    })

    alert('题目更新成功！')
    closeEditModal()
    await fetchQuestions()
  } catch (error: any) {
    console.error('Save question error:', error)
    alert('保存失败：' + (error.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

// 确认删除
const confirmDelete = (question: any) => {
  deletingQuestion.value = question
}

// 删除题目
const deleteQuestion = async () => {
  if (!deletingQuestion.value) return

  deleting.value = true
  try {
    await $fetch(`/api/admin/questions/${deletingQuestion.value.id}`, {
      method: 'DELETE'
    })

    alert('题目删除成功！')
    deletingQuestion.value = null
    await fetchQuestions()
  } catch (error: any) {
    console.error('Delete question error:', error)
    alert('删除失败：' + (error.message || '未知错误'))
  } finally {
    deleting.value = false
  }
}

// 确认批量删除
const confirmBulkDelete = () => {
  if (selectedQuestions.value.length === 0) {
    alert('请先选择要删除的题目')
    return
  }
  showBulkDeleteConfirm.value = true
}

// 批量删除题目
const bulkDeleteQuestions = async () => {
  if (selectedQuestions.value.length === 0) return

  bulkDeleting.value = true
  try {
    const response = await $fetch('/api/admin/questions/bulk-delete', {
      method: 'POST',
      body: {
        questionIds: selectedQuestions.value
      }
    }) as any

    alert(`成功删除 ${response.deletedCount} 道题目！`)
    showBulkDeleteConfirm.value = false
    selectedQuestions.value = []
    await fetchQuestions()
  } catch (error: any) {
    console.error('Bulk delete questions error:', error)
    alert('批量删除失败：' + (error.message || '未知错误'))
  } finally {
    bulkDeleting.value = false
  }
}

// 初始化
onMounted(async () => {
  await fetchCategories()
  await fetchQuestions()
})

// 监听考试类型变化
watch(currentExamType, async () => {
  filters.value.categoryId = ''
  filters.value.page = 1
  await fetchCategories()
  await fetchQuestions()
})
</script>
