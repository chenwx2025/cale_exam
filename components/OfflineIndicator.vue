<template>
  <transition name="fade">
    <div v-if="!isOnline" class="offline-indicator">
      <div class="offline-content">
        <span class="offline-icon">📡</span>
        <span class="offline-text">您当前处于离线模式</span>
        <span class="offline-status">{{ statusMessage }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(true)
const statusMessage = ref('正在尝试重新连接...')
const retryCount = ref(0)

// 更新在线状态
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine

  if (isOnline.value) {
    statusMessage.value = '已恢复连接'
    retryCount.value = 0

    // 2秒后隐藏提示
    setTimeout(() => {
      if (isOnline.value) {
        statusMessage.value = ''
      }
    }, 2000)
  } else {
    statusMessage.value = '正在尝试重新连接...'
  }
}

// 定期检查连接状态
let checkInterval: NodeJS.Timeout | null = null

const startChecking = () => {
  checkInterval = setInterval(() => {
    if (!navigator.onLine) {
      retryCount.value++

      if (retryCount.value > 10) {
        statusMessage.value = '请检查您的网络连接'
      } else {
        statusMessage.value = `正在尝试重新连接... (${retryCount.value}/10)`
      }
    }
  }, 5000)
}

const stopChecking = () => {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

onMounted(() => {
  // 初始检查
  isOnline.value = navigator.onLine

  // 监听在线/离线事件
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // 开始定期检查
  startChecking()
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  stopChecking()
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.offline-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.offline-icon {
  font-size: 1.25rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.offline-text {
  font-weight: 600;
  font-size: 0.875rem;
}

.offline-status {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .offline-content {
    font-size: 0.8125rem;
  }

  .offline-status {
    width: 100%;
    text-align: center;
  }
}
</style>
