<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">分类管理</h1>
        <p class="mt-1 text-sm text-gray-600">管理考试题目分类结构</p>
      </div>
      <button
        @click="showCreateDialog = true"
        class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white hover:from-blue-700 hover:to-purple-700"
      >
        <span>➕</span>
        <span>创建分类</span>
      </button>
    </div>

    <!-- 筛选器 -->
    <div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <div class="flex items-center gap-4">
        <label class="text-sm font-medium text-gray-700">考试类型:</label>
        <select
          v-model="filters.examType"
          @change="loadCategories"
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">全部</option>
          <option value="cale">CALE</option>
          <option value="nccaom">NCCAOM</option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="py-12 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">加载中...</p>
    </div>

    <!-- 分类列表 -->
    <div v-else-if="categories.length > 0" class="space-y-4">
      <CategoryTreeNode
        v-for="category in categories"
        :key="category.id"
        :category="category"
        :level="0"
        @edit="handleEdit"
        @delete="handleDelete"
        @add-child="handleAddChild"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="rounded-lg bg-white p-12 text-center shadow-sm">
      <p class="text-gray-500">暂无分类数据</p>
    </div>

    <!-- 创建/编辑对话框 -->
    <CategoryDialog
      v-if="showCreateDialog || showEditDialog"
      :category="editingCategory"
      :parent-id="newCategoryParentId"
      :exam-type="filters.examType"
      @close="closeDialogs"
      @success="handleSuccess"
    />

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-if="showDeleteDialog"
      title="确认删除"
      :message="`确定要删除分类「${deletingCategory?.name}」吗？`"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface Category {
  id: string
  code: string
  name: string
  description: string | null
  examType: string
  parentId: string | null
  questionCount: number
  children: Category[]
}

const loading = ref(true)
const categories = ref<Category[]>([])
const filters = ref({
  examType: ''
})

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<Category | null>(null)
const newCategoryParentId = ref<string | null>(null)

// 加载分类
const loadCategories = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.examType) {
      params.examType = filters.value.examType
    }

    const { data } = await $fetch('/api/admin/categories', { params })
    categories.value = data.categories
  } catch (error: any) {
    console.error('Failed to load categories:', error)
    alert('加载分类失败: ' + (error.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

// 处理编辑
const handleEdit = (category: Category) => {
  editingCategory.value = category
  showEditDialog.value = true
}

// 处理删除
const handleDelete = (category: Category) => {
  deletingCategory.value = category
  showDeleteDialog.value = true
}

// 处理添加子分类
const handleAddChild = (parentCategory: Category) => {
  newCategoryParentId.value = parentCategory.id
  showCreateDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!deletingCategory.value) return

  try {
    await $fetch(`/api/admin/categories/${deletingCategory.value.id}`, {
      method: 'DELETE'
    })
    alert('删除成功')
    showDeleteDialog.value = false
    await loadCategories()
  } catch (error: any) {
    console.error('Failed to delete category:', error)
    alert('删除失败: ' + (error.data?.message || error.message))
  }
}

// 关闭对话框
const closeDialogs = () => {
  showCreateDialog.value = false
  showEditDialog.value = false
  editingCategory.value = null
  newCategoryParentId.value = null
}

// 处理成功
const handleSuccess = () => {
  closeDialogs()
  loadCategories()
}

// 初始化
onMounted(() => {
  loadCategories()
})
</script>

<script lang="ts">
// 分类树节点组件
const CategoryTreeNode = {
  name: 'CategoryTreeNode',
  props: {
    category: Object,
    level: Number
  },
  template: `
    <div class="rounded-lg bg-white shadow-sm">
      <div
        class="flex items-center justify-between border-l-4 p-4"
        :class="{
          'border-blue-500': category.examType === 'cale',
          'border-purple-500': category.examType === 'nccaom'
        }"
        :style="{ marginLeft: level * 24 + 'px' }"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <span class="text-lg font-semibold text-gray-900">{{ category.name }}</span>
            <span class="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {{ category.code }}
            </span>
            <span
              class="rounded px-2 py-1 text-xs font-medium"
              :class="{
                'bg-blue-100 text-blue-700': category.examType === 'cale',
                'bg-purple-100 text-purple-700': category.examType === 'nccaom'
              }"
            >
              {{ category.examType.toUpperCase() }}
            </span>
            <span class="text-sm text-gray-500">
              {{ category.questionCount }} 道题目
            </span>
          </div>
          <p v-if="category.description" class="mt-1 text-sm text-gray-600">
            {{ category.description }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="$emit('add-child', category)"
            class="rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-600 hover:bg-green-100"
          >
            添加子分类
          </button>
          <button
            @click="$emit('edit', category)"
            class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100"
          >
            编辑
          </button>
          <button
            @click="$emit('delete', category)"
            class="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
          >
            删除
          </button>
        </div>
      </div>

      <!-- 子分类 -->
      <div v-if="category.children && category.children.length > 0" class="pl-6 pt-2">
        <CategoryTreeNode
          v-for="child in category.children"
          :key="child.id"
          :category="child"
          :level="level + 1"
          @edit="(c) => $emit('edit', c)"
          @delete="(c) => $emit('delete', c)"
          @add-child="(c) => $emit('add-child', c)"
        />
      </div>
    </div>
  `
}

// 分类对话框组件
const CategoryDialog = {
  name: 'CategoryDialog',
  props: {
    category: Object,
    parentId: String,
    examType: String
  },
  data() {
    return {
      form: {
        code: this.category?.code || '',
        name: this.category?.name || '',
        description: this.category?.description || '',
        examType: this.category?.examType || this.examType || 'cale',
        parentId: this.category?.parentId || this.parentId || null
      },
      submitting: false
    }
  },
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="$emit('close')">
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 class="mb-4 text-xl font-bold text-gray-900">
          {{ category ? '编辑分类' : '创建分类' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">分类代码 *</label>
            <input
              v-model="form.code"
              type="text"
              required
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="例: TCM_BASIC"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">分类名称 *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="例: 中医基础理论"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">描述</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="分类描述..."
            ></textarea>
          </div>

          <div v-if="!category">
            <label class="block text-sm font-medium text-gray-700">考试类型 *</label>
            <select
              v-model="form.examType"
              required
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="cale">CALE</option>
              <option value="nccaom">NCCAOM</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {{ submitting ? '提交中...' : (category ? '更新' : '创建') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  methods: {
    async handleSubmit() {
      this.submitting = true
      try {
        if (this.category) {
          // 更新
          await $fetch(`/api/admin/categories/${this.category.id}`, {
            method: 'PUT',
            body: this.form
          })
          alert('更新成功')
        } else {
          // 创建
          await $fetch('/api/admin/categories', {
            method: 'POST',
            body: this.form
          })
          alert('创建成功')
        }
        this.$emit('success')
      } catch (error: any) {
        console.error('Failed to save category:', error)
        alert('保存失败: ' + (error.data?.message || error.message))
      } finally {
        this.submitting = false
      }
    }
  }
}

// 确认对话框组件
const ConfirmDialog = {
  name: 'ConfirmDialog',
  props: {
    title: String,
    message: String
  },
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="$emit('cancel')">
      <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 class="mb-2 text-lg font-bold text-gray-900">{{ title }}</h2>
        <p class="mb-6 text-gray-600">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button
            @click="$emit('cancel')"
            class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="$emit('confirm')"
            class="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  `
}
</script>
