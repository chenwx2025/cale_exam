<template>
  <div class="relative">
    <!-- 通知铃铛按钮 -->
    <button
      @click="toggleDropdown"
      class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      :class="{ 'bg-gray-100': showDropdown }"
    >
      <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>

      <!-- 未读数量徽章 -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- 下拉通知列表 -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
    >
      <!-- 头部 -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">通知</h3>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            全部已读
          </button>
          <NuxtLink
            to="/notifications"
            @click="showDropdown = false"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            查看全部
          </NuxtLink>
        </div>
      </div>

      <!-- 通知列表 -->
      <div class="max-h-96 overflow-y-auto">
        <!-- 加载中 -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-2 text-sm text-gray-600">加载中...</p>
        </div>

        <!-- 通知项 -->
        <div v-else-if="notifications.length > 0">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
            :class="{ 'bg-blue-50': !notification.isRead }"
          >
            <div class="flex items-start gap-3">
              <!-- 图标 -->
              <div class="flex-shrink-0 mt-1">
                <span
                  class="inline-flex items-center justify-center w-8 h-8 rounded-full"
                  :class="{
                    'bg-blue-100 text-blue-600': notification.type === 'study_reminder',
                    'bg-purple-100 text-purple-600': notification.type === 'exam_reminder',
                    'bg-green-100 text-green-600': notification.type === 'achievement',
                    'bg-gray-100 text-gray-600': notification.type === 'system'
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
                <p class="text-sm font-semibold text-gray-900 truncate">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-gray-600 line-clamp-2 mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatTime(notification.createdAt) }}
                </p>
              </div>

              <!-- 未读标记 -->
              <div v-if="!notification.isRead" class="flex-shrink-0">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="p-8 text-center">
          <span class="text-5xl">🔔</span>
          <p class="mt-2 text-gray-600">暂无通知</p>
        </div>
      </div>

      <!-- 底部 -->
      <div class="px-4 py-3 border-t border-gray-200 text-center">
        <NuxtLink
          to="/notifications/settings"
          @click="showDropdown = false"
          class="text-sm text-gray-600 hover:text-gray-700"
        >
          ⚙️ 通知设置
        </NuxtLink>
      </div>
    </div>

    <!-- 点击外部关闭 -->
    <div
      v-if="showDropdown"
      @click="showDropdown = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
const showDropdown = ref(false)
const loading = ref(false)
const notifications = ref<any[]>([])
const unreadCount = ref(0)

// 切换下拉菜单
const toggleDropdown = async () => {
  showDropdown.value = !showDropdown.value

  if (showDropdown.value && notifications.value.length === 0) {
    await loadNotifications()
  }
}

// 加载通知
const loadNotifications = async () => {
  loading.value = true

  try {
    const { data } = await $fetch('/api/notifications', {
      params: { limit: 10 }
    })

    notifications.value = data.notifications
    unreadCount.value = data.unreadCount
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

    notifications.value.forEach(n => {
      n.isRead = true
      n.readAt = new Date()
    })

    unreadCount.value = 0
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
    showDropdown.value = false
    navigateTo(notification.link)
  }
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

// 定期刷新未读数量
let refreshInterval: any = null

onMounted(() => {
  loadNotifications()

  // 每30秒刷新一次未读数量
  refreshInterval = setInterval(() => {
    if (!showDropdown.value) {
      loadNotifications()
    }
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
