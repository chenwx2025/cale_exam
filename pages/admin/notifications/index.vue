<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">通知管理</h1>
        <p class="text-gray-600 mt-2">管理和发送用户通知</p>
      </div>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-shadow">
        发送新通知
      </button>
    </div>

    <!-- 统计摘要 -->
    <div class="mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-white mb-4">通知统计概览</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">总通知数</div>
          <div class="text-3xl font-bold text-white">{{ summary.totalNotifications || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">未读通知</div>
          <div class="text-3xl font-bold text-white">{{ summary.unreadNotifications || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">阅读率</div>
          <div class="text-3xl font-bold text-white">{{ summary.readRate || 0 }}%</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">今日通知</div>
          <div class="text-3xl font-bold text-white">{{ summary.todayNotifications || 0 }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div class="text-white/80 text-sm mb-1">最近7天</div>
          <div class="text-3xl font-bold text-white">{{ summary.recentNotifications || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">通知类型</label>
          <select v-model="filters.type" @change="loadNotifications" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="system">系统通知</option>
            <option value="exam">考试通知</option>
            <option value="study">学习通知</option>
            <option value="achievement">成就通知</option>
            <option value="subscription">订阅通知</option>
            <option value="reminder">提醒通知</option>
            <option value="announcement">公告</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
          <select v-model="filters.status" @change="loadNotifications" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">全部</option>
            <option value="read">已读</option>
            <option value="unread">未读</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索</label>
          <input
            v-model="filters.search"
            @input="onSearchInput"
            type="text"
            placeholder="标题或内容"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>

    <!-- 通知列表 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发送时间</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="notification in notifications" :key="notification.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img v-if="notification.user.avatar" :src="notification.user.avatar" class="w-8 h-8 rounded-full" />
                <div v-else class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span class="text-orange-600 font-semibold text-sm">{{ notification.user.name?.[0] || 'U' }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ notification.user.name || notification.user.nickname || '未命名' }}</div>
                  <div class="text-sm text-gray-500">{{ notification.user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="font-medium text-gray-900">{{ notification.title }}</div>
              <div class="text-sm text-gray-500 line-clamp-1">{{ notification.content }}</div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getTypeClass(notification.type)">
                {{ getTypeText(notification.type) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="notification.isRead ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'">
                {{ notification.isRead ? '已读' : '未读' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ formatDate(notification.createdAt) }}</div>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="deleteNotification(notification.id)" class="text-red-600 hover:text-red-800 font-medium text-sm">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页控件 -->
      <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
        <div class="text-sm text-gray-700">
          共 {{ pagination.total }} 条记录，第 {{ pagination.page }} / {{ pagination.totalPages }} 页
        </div>
        <div class="flex gap-2">
          <button
            @click="goToPage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            @click="goToPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 创建通知模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl my-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">发送新通知</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input v-model="newNotification.title" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="通知标题" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
            <textarea v-model="newNotification.content" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="通知内容"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">类型</label>
            <select v-model="newNotification.type" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="system">系统通知</option>
              <option value="exam">考试通知</option>
              <option value="study">学习通知</option>
              <option value="achievement">成就通知</option>
              <option value="subscription">订阅通知</option>
              <option value="reminder">提醒通知</option>
              <option value="announcement">公告</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">发送对象</label>
            <select v-model="newNotification.targetType" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">所有用户</option>
              <option value="cale">CALE订阅用户</option>
              <option value="nccaom">NCCAOM订阅用户</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showCreateModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">取消</button>
          <button @click="createNotification" :disabled="creating" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50">
            {{ creating ? '发送中...' : '发送通知' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const authStore = useAuthStore()
const loading = ref(true)
const creating = ref(false)
const notifications = ref<any[]>([])
const summary = ref<any>({})
const filters = ref({ type: 'all', status: 'all', search: '' })
const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
const showCreateModal = ref(false)
const newNotification = ref({
  title: '',
  content: '',
  type: 'system',
  targetType: 'all'
})

let searchTimeout: NodeJS.Timeout | null = null

const loadSummary = async () => {
  try {
    const response = await $fetch('/api/admin/notifications/summary', {
      headers: authStore.getAuthHeader() as HeadersInit
    })
    if (response.success) {
      summary.value = response.data
    }
  } catch (error) {
    console.error('Failed to load summary:', error)
  }
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/notifications/list', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: {
        ...pagination.value,
        ...filters.value
      }
    })
    if (response.success) {
      notifications.value = response.notifications
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    loadNotifications()
  }, 500)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    loadNotifications()
  }
}

const createNotification = async () => {
  if (!newNotification.value.title || !newNotification.value.content) {
    alert('请填写标题和内容')
    return
  }

  creating.value = true
  try {
    const response = await $fetch('/api/admin/notifications/create', {
      method: 'POST',
      headers: authStore.getAuthHeader() as HeadersInit,
      body: newNotification.value
    })
    if (response.success) {
      alert(`成功发送 ${response.count} 条通知`)
      showCreateModal.value = false
      newNotification.value = {
        title: '',
        content: '',
        type: 'system',
        targetType: 'all'
      }
      loadSummary()
      loadNotifications()
    }
  } catch (error: any) {
    console.error('Failed to create notification:', error)
    alert('发送失败: ' + (error.data?.message || error.message))
  } finally {
    creating.value = false
  }
}

const deleteNotification = async (id: string) => {
  if (!confirm('确定要删除这条通知吗？')) {
    return
  }

  try {
    const response = await $fetch(`/api/admin/notifications/${id}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeader() as HeadersInit
    })
    if (response.success) {
      loadSummary()
      loadNotifications()
    }
  } catch (error) {
    console.error('Failed to delete notification:', error)
    alert('删除失败')
  }
}

const getTypeClass = (type: string) => {
  const classes: any = {
    system: 'bg-blue-100 text-blue-800',
    exam: 'bg-purple-100 text-purple-800',
    study: 'bg-green-100 text-green-800',
    achievement: 'bg-yellow-100 text-yellow-800',
    subscription: 'bg-pink-100 text-pink-800',
    reminder: 'bg-orange-100 text-orange-800',
    announcement: 'bg-red-100 text-red-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getTypeText = (type: string) => {
  const texts: any = {
    system: '系统',
    exam: '考试',
    study: '学习',
    achievement: '成就',
    subscription: '订阅',
    reminder: '提醒',
    announcement: '公告'
  }
  return texts[type] || type
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadSummary()
  loadNotifications()
})
</script>
