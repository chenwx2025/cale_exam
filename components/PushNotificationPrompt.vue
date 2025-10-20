<template>
  <div v-if="showPrompt" class="fixed bottom-4 right-4 z-50 max-w-md">
    <div class="bg-white rounded-lg shadow-2xl border border-gray-200 p-6">
      <!-- 关闭按钮 -->
      <button
        @click="dismissPrompt"
        class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="flex items-start gap-4">
        <!-- 图标 -->
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        <!-- 内容 -->
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            开启学习提醒通知
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            开启浏览器通知，即时接收学习提醒、成就通知和重要消息，保持学习动力！
          </p>

          <div class="flex gap-2">
            <button
              @click="enableNotifications"
              :disabled="isSubscribing"
              class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubscribing">开启通知</span>
              <span v-else>开启中...</span>
            </button>
            <button
              @click="dismissPrompt"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              稍后
            </button>
          </div>

          <p class="text-xs text-gray-500 mt-2">
            您可以随时在通知设置中关闭
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isSupported, isSubscribed, isSubscribing, subscribe, permission } = usePushNotifications()
const showPrompt = ref(false)

// 检查是否应该显示提示
const checkShouldShowPrompt = () => {
  // 如果不支持或已订阅或权限被拒绝，不显示
  if (!isSupported.value || isSubscribed.value || permission.value === 'denied') {
    return false
  }

  // 检查是否已经提示过（24小时内）
  const lastPrompt = localStorage.getItem('push_prompt_dismissed')
  if (lastPrompt) {
    const lastPromptTime = new Date(lastPrompt).getTime()
    const now = Date.now()
    const hoursSinceLastPrompt = (now - lastPromptTime) / (1000 * 60 * 60)

    // 如果24小时内已提示过，不再显示
    if (hoursSinceLastPrompt < 24) {
      return false
    }
  }

  return true
}

// 开启通知
const enableNotifications = async () => {
  try {
    await subscribe()
    showPrompt.value = false
    // 清除提示记录
    localStorage.removeItem('push_prompt_dismissed')
  } catch (error) {
    console.error('Failed to enable notifications:', error)
    alert('开启通知失败，请检查浏览器权限设置')
  }
}

// 关闭提示
const dismissPrompt = () => {
  showPrompt.value = false
  // 记录关闭时间
  localStorage.setItem('push_prompt_dismissed', new Date().toISOString())
}

onMounted(() => {
  // 延迟5秒后检查是否显示提示
  setTimeout(() => {
    if (checkShouldShowPrompt()) {
      showPrompt.value = true
    }
  }, 5000)
})
</script>
