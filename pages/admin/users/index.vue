<template>
  <div>
    <!-- 页面标题和操作 -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">用户管理</h1>
        <p class="text-gray-600 mt-2">管理系统中的所有用户</p>
      </div>
    </div>

    <!-- 搜索和过滤 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜索 -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索</label>
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="搜索邮箱或姓名..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 角色过滤 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
          <select
            v-model="filters.role"
            @change="loadUsers"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部</option>
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>

        <!-- 状态过滤 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
          <select
            v-model="filters.status"
            @change="loadUsers"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部</option>
            <option value="active">活跃</option>
            <option value="suspended">已停用</option>
            <option value="deleted">已删除</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- 用户列表 -->
    <div v-else-if="users.length > 0" class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              用户
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              角色
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状态
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              订阅
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              统计
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              注册时间
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="user in users"
            :key="user.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <!-- 用户信息 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>

            <!-- 角色 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ user.role === 'admin' ? '管理员' : '用户' }}
              </span>
            </td>

            <!-- 状态 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  getStatusClass(user.status)
                ]"
              >
                {{ getStatusText(user.status) }}
              </span>
            </td>

            <!-- 订阅 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex gap-1">
                <span
                  v-for="exam in user.subscribedExams"
                  :key="exam"
                  class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                >
                  {{ exam.toUpperCase() }}
                </span>
                <span v-if="user.subscribedExams.length === 0" class="text-sm text-gray-400">
                  无订阅
                </span>
              </div>
            </td>

            <!-- 统计 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                {{ user.stats.totalExams }} 场考试
              </div>
              <div class="text-sm text-gray-500">
                {{ user.stats.totalAnswers }} 道题
              </div>
            </td>

            <!-- 注册时间 -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.createdAt) }}
            </td>

            <!-- 操作 -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink
                :to="`/admin/users/${user.id}`"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                查看
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div v-if="pagination.totalPages > 1" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          显示 {{ (pagination.page - 1) * pagination.pageSize + 1 }} 到
          {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 条，
          共 {{ pagination.total }} 条
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
      <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">未找到用户</h3>
      <p class="text-gray-600">尝试调整搜索条件或过滤器</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const authStore = useAuthStore()
const loading = ref(true)
const users = ref<any[]>([])

const filters = ref({
  search: '',
  role: 'all',
  status: 'all',
  examType: 'all'
})

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/users', {
      headers: authStore.getAuthHeader(),
      params: {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        search: filters.value.search,
        role: filters.value.role,
        status: filters.value.status,
        examType: filters.value.examType
      }
    })

    if (response.success) {
      users.value = response.data
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

// 防抖搜索
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadUsers()
  }, 500)
}

// 翻页
const changePage = (page: number) => {
  pagination.value.page = page
  loadUsers()
}

// 格式化日期
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 获取状态样式
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    deleted: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '活跃',
    suspended: '已停用',
    deleted: '已删除'
  }
  return texts[status] || status
}

onMounted(() => {
  loadUsers()
})
</script>
