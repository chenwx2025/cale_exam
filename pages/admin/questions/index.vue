<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">题目管理</h1>
        <p class="text-gray-600 mt-2">管理系统中的所有题目</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/questions/import" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2">
          <span>📥</span>
          <span>批量导入</span>
        </NuxtLink>
        <NuxtLink to="/admin/questions/create" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
          ➕ 创建题目
        </NuxtLink>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索</label>
          <input v-model="filters.search" @input="debouncedSearch" type="text" placeholder="搜索题目内容..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">考试类型</label>
          <select v-model="filters.examType" @change="loadQuestions" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="cale">CALE</option>
            <option value="nccaom">NCCAOM</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">难度</label>
          <select v-model="filters.difficulty" @change="loadQuestions" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="questions.length > 0" class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">题目</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">考试类型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">难度</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">统计</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="q in questions" :key="q.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 max-w-md truncate">{{ q.question }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{{ q.examType.toUpperCase() }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getDifficultyClass(q.difficulty)]">{{ getDifficultyText(q.difficulty) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ q.category?.name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ q.stats.totalAnswers }} 次 / {{ q.stats.accuracy }}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
              <button @click="deleteQuestion(q.id)" class="text-red-600 hover:text-red-900 ml-3">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="pagination.totalPages > 1" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
        <div class="text-sm text-gray-700">共 {{ pagination.total }} 条</div>
        <div class="flex gap-2">
          <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1" class="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50">上一页</button>
          <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages" class="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50">下一页</button>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
      <h3 class="text-xl font-semibold text-gray-900 mb-2">未找到题目</h3>
      <p class="text-gray-600">尝试调整搜索条件或创建新题目</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const authStore = useAuthStore()
const loading = ref(true)
const questions = ref<any[]>([])
const filters = ref({ search: '', examType: 'all', difficulty: 'all' })
const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })

const loadQuestions = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/questions', {
      headers: authStore.getAuthHeader(),
      params: { ...pagination.value, ...filters.value }
    })
    if (response.success) {
      questions.value = response.data
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('Failed to load questions:', error)
  } finally {
    loading.value = false
  }
}

let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadQuestions()
  }, 500)
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadQuestions()
}

const deleteQuestion = async (id: string) => {
  if (!confirm('确定要删除这道题目吗？')) return
  try {
    await $fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeader()
    })
    alert('题目已删除')
    loadQuestions()
  } catch (error) {
    console.error('Failed to delete question:', error)
    alert('删除失败')
  }
}

const getDifficultyClass = (d: string) => ({ easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }[d] || '')
const getDifficultyText = (d: string) => ({ easy: '简单', medium: '中等', hard: '困难' }[d] || d)

onMounted(() => loadQuestions())
</script>
