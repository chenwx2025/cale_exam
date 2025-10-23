<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">分类管理</h1>
        <p class="text-gray-600 mt-2">管理考试题目的分类体系</p>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="mb-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-white mb-4">分类统计概览</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">总分类数</div>
          <div class="text-3xl font-bold text-white">{{ categories.length }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">顶级分类</div>
          <div class="text-3xl font-bold text-white">{{ categoryTree.length }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">总题目数</div>
          <div class="text-3xl font-bold text-white">{{ totalQuestions }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">平均题目数</div>
          <div class="text-3xl font-bold text-white">{{ avgQuestions }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">考试类型</label>
          <select v-model="filters.examType" @change="loadCategories" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="cale">CALE (加州)</option>
            <option value="nccaom">NCCAOM (全国)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">分类类型</label>
          <select v-model="filters.type" @change="loadCategories" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="organization">组织部分</option>
            <option value="content">内容部分</option>
            <option value="review">复习部分</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 分类列表 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">代码</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">权重</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">题目数</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">子分类</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-for="category in categoryTree" :key="category.id">
            <CategoryRow :category="category" :level="0" @edit="editCategory" />
          </template>
        </tbody>
      </table>
    </div>

    <!-- 编辑模态框 -->
    <div v-if="editingCategory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" @click.self="closeEditModal">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl my-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">编辑分类</h2>
        <div class="space-y-4 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">中文名称</label>
              <input v-model="editForm.name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">英文名称</label>
              <input v-model="editForm.nameEn" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分类代码</label>
            <input type="text" :value="editingCategory.code" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea v-model="editForm.description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">预期题目数</label>
              <input v-model.number="editForm.questionCount" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">权重 (%)</label>
              <input v-model.number="editForm.weight" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">排序</label>
              <input v-model.number="editForm.order" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">详细信息</label>
            <textarea v-model="editForm.detailedInfo" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">学习建议</label>
            <textarea v-model="editForm.studyTips" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="saveCategory" :disabled="saving" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button @click="closeEditModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const authStore = useAuthStore()
const dialog = useDialog()
const loading = ref(true)
const categories = ref<any[]>([])
const categoryTree = ref<any[]>([])
const filters = ref({ examType: 'cale', type: 'all' })
const editingCategory = ref<any>(null)
const editForm = ref<any>({})
const saving = ref(false)

const totalQuestions = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.actualQuestionCount || 0), 0)
})

const avgQuestions = computed(() => {
  const total = totalQuestions.value
  const count = categories.value.length
  return count > 0 ? Math.round(total / count) : 0
})

const loadCategories = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/categories/list', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: filters.value
    })
    if (response.success) {
      categories.value = response.categories
      categoryTree.value = response.categoryTree
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loading.value = false
  }
}

const editCategory = (category: any) => {
  editingCategory.value = category
  editForm.value = {
    name: category.name,
    nameEn: category.nameEn,
    description: category.description,
    detailedInfo: category.detailedInfo,
    questionCount: category.questionCount,
    weight: category.weight,
    order: category.order,
    studyTips: category.studyTips
  }
}

const closeEditModal = () => {
  editingCategory.value = null
}

const saveCategory = async () => {
  if (!editingCategory.value) return
  saving.value = true
  try {
    const response = await $fetch(`/api/admin/categories/${editingCategory.value.id}`, {
      method: 'PATCH',
      headers: authStore.getAuthHeader() as HeadersInit,
      body: editForm.value
    })
    if (response.success) {
      await dialog.success({ message: '分类信息已更新' })
      closeEditModal()
      loadCategories()
    }
  } catch (error: any) {
    await dialog.error({ message: error.data?.message || '更新失败' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>
