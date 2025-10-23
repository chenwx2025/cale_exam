<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">用户管理</h1>
        <p class="text-gray-600 mt-2">管理系统中的所有用户账号</p>
      </div>
    </div>

    <!-- 统计摘要面板 -->
    <div v-if="summary" class="mb-6">
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-white mb-4">用户统计概览</h2>
        
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div class="text-white/80 text-sm mb-1">总用户数</div>
            <div class="text-3xl font-bold text-white">{{ summary.totalUsers }}</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div class="text-white/80 text-sm mb-1">最近新增</div>
            <div class="text-3xl font-bold text-white">{{ summary.recentUsers }}</div>
            <div class="text-white/60 text-xs mt-1">最近 30 天</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div class="text-white/80 text-sm mb-1">活跃用户</div>
            <div class="text-3xl font-bold text-white">{{ summary.activeUsers }}</div>
            <div class="text-white/60 text-xs mt-1">最近 7 天登录</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div class="text-white/80 text-sm mb-1">邮箱验证</div>
            <div class="text-3xl font-bold text-white">{{ summary.emailVerification.verified }}</div>
            <div class="text-white/60 text-xs mt-1">已验证用户</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索</label>
          <input v-model="filters.search" @input="debouncedSearch" type="text" placeholder="搜索邮箱、姓名..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
          <select v-model="filters.role" @change="loadUsers" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
          <select v-model="filters.status" @change="loadUsers" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="active">活跃</option>
            <option value="suspended">已停用</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="users.length > 0" class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学习数据</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后登录</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700']">
                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusClass(user.status)]">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              答题: {{ user.stats.answersCount }} | 考试: {{ user.stats.examsCount }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ formatDate(user.lastLoginAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
              <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900">编辑</button>
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

    <!-- 编辑模态框 -->
    <div v-if="editingUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeEditModal">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">编辑用户</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input type="text" :value="editingUser.email" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input v-model="editForm.name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
            <select v-model="editForm.role" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select v-model="editForm.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="active">活跃</option>
              <option value="suspended">已停用</option>
              <option value="deleted">已删除</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="saveUser" :disabled="saving" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
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
const users = ref<any[]>([])
const filters = ref({ search: '', role: 'all', status: 'all' })
const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
const summary = ref<any>(null)
const editingUser = ref<any>(null)
const editForm = ref<any>({})
const saving = ref(false)

const loadSummary = async () => {
  try {
    const response = await $fetch('/api/admin/users/summary', {
      headers: authStore.getAuthHeader() as HeadersInit
    })
    if (response.success) {
      summary.value = response.data
    }
  } catch (error) {
    console.error('Failed to load summary:', error)
  }
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/users/list', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: { ...pagination.value, ...filters.value }
    })
    if (response.success) {
      users.value = response.users
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadUsers()
  }, 500)
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadUsers()
}

const editUser = (user: any) => {
  editingUser.value = user
  editForm.value = {
    name: user.name,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified
  }
}

const closeEditModal = () => {
  editingUser.value = null
}

const saveUser = async () => {
  if (!editingUser.value) return
  saving.value = true
  try {
    const response = await $fetch(`/api/admin/users/${editingUser.value.id}`, {
      method: 'PATCH',
      headers: authStore.getAuthHeader() as HeadersInit,
      body: editForm.value
    })
    if (response.success) {
      await dialog.success({ message: '用户信息已更新' })
      closeEditModal()
      loadUsers()
      loadSummary()
    }
  } catch (error: any) {
    await dialog.error({ message: error.data?.message || '更新失败' })
  } finally {
    saving.value = false
  }
}

const getStatusText = (s: string) => ({ active: '活跃', suspended: '已停用', deleted: '已删除' }[s] || s)
const getStatusClass = (s: string) => ({ active: 'bg-green-100 text-green-700', suspended: 'bg-yellow-100 text-yellow-700', deleted: 'bg-red-100 text-red-700' }[s])

const formatDate = (date: string | null) => {
  if (!date) return '从未登录'
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadSummary()
  loadUsers()
})
</script>
