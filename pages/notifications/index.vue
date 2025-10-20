<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">消息中心</h1>
      <p class="mt-2 text-gray-600">查看所有通知消息</p>
    </div>

    <!-- 操作栏 -->
    <div class="mb-6 flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      <div class="flex items-center gap-4">
        <!-- 筛选 -->
        <select
          v-model="filters.type"
          @change="loadNotifications"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">全部类型</option>
          <option value="study_reminder">学习提醒</option>
          <option value="exam_reminder">考试提醒</option>
          <option value="achievement">成就通知</option>
          <option value="system">系统消息</option>
        </select>

        <label class="flex items-center gap-2">
          <input
            v-model="filters.unreadOnly"
            @change="loadNotifications"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">只看未读</span>
        </label>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600">
          未读: <strong class="text-blue-600">{{ unreadCount }}</strong>
        </span>
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          全部已读
        </button>
        <NuxtLink
          to="/notifications/settings"
          class="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ⚙️ 设置
        </NuxtLink>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="py-12 text-center">
      <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- 通知列表 -->
    <div v-else-if="notifications.length > 0" class="space-y-3">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        :class="{ 'border-l-4 border-blue-600 bg-blue-50': !notification.isRead }"
      >
        <div class="flex items-start gap-4">
          <!-- 图标 -->
          <div class="flex-shrink-0">
            <span
              class="inline-flex items-center justify-center w-12 h-12 rounded-full text-2xl"
              :class="{
                'bg-blue-100': notification.type === 'study_reminder',
                'bg-purple-100': notification.type === 'exam_reminder',
                'bg-green-100': notification.type === 'achievement',
                'bg-gray-100': notification.type === 'system'
              }"
            >
              {{
                notification.type === 'study_reminder' ? '📚' :
                notification.type === 'exam_reminder' ? '📝' :
                notification.type === 'achievement' ? '🏆' : '🔔'
              }}
            </span>
          </div>

          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ notification.title }}
              </h3>
              <span class="flex-shrink-0 text-sm text-gray-500">
                {{ formatTime(notification.createdAt) }}
              </span>
            </div>
            <p class="mt-2 text-gray-700">
              {{ notification.message }}
            </p>
            <div class="mt-3 flex items-center gap-3">
              <span
                class="px-2 py-1 text-xs font-medium rounded"
                :class="{
                  'bg-blue-100 text-blue-700': notification.type === 'study_reminder',
                  'bg-purple-100 text-purple-700': notification.type === 'exam_reminder',
                  'bg-green-100 text-green-700': notification.type === 'achievement',
                  'bg-gray-100 text-gray-700': notification.type === 'system'
                }"
              >
                {{
                  notification.type === 'study_reminder' ? '学习提醒' :
                  notification.type === 'exam_reminder' ? '考试提醒' :
                  notification.type === 'achievement' ? '成就通知' : '系统消息'
                }}
              </span>
              <span v-if="!notification.isRead" class="flex items-center gap-1 text-xs text-blue-600">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                未读
              </span>
              <span v-else class="text-xs text-gray-500">
                已读于 {{ new Date(notification.readAt).toLocaleString('zh-CN') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-white rounded-lg p-12 text-center shadow-sm">
      <span class="text-6xl">📭</span>
      <p class="mt-4 text-lg text-gray-600">暂无通知消息</p>
      <p class="mt-2 text-sm text-gray-500">我们会在这里为您显示重要的通知</p>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center gap-2">
      <button
        @click="changePage(pagination.page - 1)"
        :disabled="pagination.page === 1"
        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一页
      </button>
      <span class="flex items-center px-4 text-gray-700">
        第 {{ pagination.page }} / {{ pagination.totalPages }} 页
      </span>
      <button
        @click="changePage(pagination.page + 1)"
        :disabled="pagination.page === pagination.totalPages"
        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const loading = ref(true)
const notifications = ref<any[]>([])
const unreadCount = ref(0)
const filters = ref({
  type: '',
  unreadOnly: false
})

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 加载通知
const loadNotifications = async () => {
  loading.value = true

  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    if (filters.value.type) {
      params.type = filters.value.type
    }

    if (filters.value.unreadOnly) {
      params.unreadOnly = 'true'
    }

    const { data } = await $fetch('/api/notifications', { params })

    notifications.value = data.notifications
    unreadCount.value = data.unreadCount
    pagination.value = {
      ...pagination.value,
      ...data.pagination
    }
  } catch (error: any) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

// 标记所有为已读
const markAllAsRead = async () => {
  try {
    await $fetch('/api/notifications/mark-all-read', {
      method: 'POST'
    })

    await loadNotifications()
  } catch (error: any) {
    console.error('Failed to mark all as read:', error)
  }
}

// 点击通知
const handleNotificationClick = async (notification: any) => {
  // 标记为已读
  if (!notification.isRead) {
    try {
      await $fetch(`/api/notifications/${notification.id}/read`, {
        method: 'POST'
      })

      notification.isRead = true
      notification.readAt = new Date()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error: any) {
      console.error('Failed to mark as read:', error)
    }
  }

  // 如果有链接，跳转
  if (notification.link) {
    navigateTo(notification.link)
  }
}

// 切换页码
const changePage = (page: number) => {
  pagination.value.page = page
  loadNotifications()
}

// 格式化时间
const formatTime = (date: string) => {
  const now = new Date()
  const notificationDate = new Date(date)
  const diff = now.getTime() - notificationDate.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return notificationDate.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadNotifications()
})
</script>
