<template>
  <transition name="slide-up">
    <div v-if="showPrompt" class="install-prompt">
      <div class="install-content">
        <div class="install-icon">📱</div>
        <div class="install-text">
          <h3 class="install-title">安装 CALE考试系统</h3>
          <p class="install-description">添加到主屏幕，随时随地学习</p>
        </div>
        <div class="install-actions">
          <button @click="install" class="install-btn primary">
            安装
          </button>
          <button @click="dismiss" class="install-btn secondary">
            稍后
          </button>
        </div>
        <button @click="close" class="close-btn" aria-label="关闭">
          ✕
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
const deferredPrompt = ref<any>(null)

// 检查是否应该显示安装提示
const shouldShowPrompt = () => {
  // 检查是否已经安装
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return false
  }

  // 检查是否已经关闭过
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    const dismissedTime = parseInt(dismissed)
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
    // 7天后再次显示
    if (daysSinceDismissed < 7) {
      return false
    }
  }

  // 检查是否永久关闭
  const neverShow = localStorage.getItem('pwa-install-never-show')
  if (neverShow === 'true') {
    return false
  }

  return true
}

// 安装
const install = async () => {
  if (!deferredPrompt.value) {
    console.log('No install prompt available')
    return
  }

  // 显示安装提示
  deferredPrompt.value.prompt()

  // 等待用户响应
  const { outcome } = await deferredPrompt.value.userChoice
  console.log(`User response to install prompt: ${outcome}`)

  if (outcome === 'accepted') {
    console.log('User accepted the install prompt')
    localStorage.setItem('pwa-installed', 'true')
  } else {
    console.log('User dismissed the install prompt')
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // 清除 prompt
  deferredPrompt.value = null
  showPrompt.value = false
}

// 稍后再说
const dismiss = () => {
  localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  showPrompt.value = false
}

// 永久关闭
const close = () => {
  localStorage.setItem('pwa-install-never-show', 'true')
  showPrompt.value = false
}

onMounted(() => {
  // 监听 beforeinstallprompt 事件
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired')

    // 阻止默认的安装提示
    e.preventDefault()

    // 保存 event，稍后使用
    deferredPrompt.value = e

    // 检查是否应该显示自定义提示
    if (shouldShowPrompt()) {
      // 延迟3秒显示，避免干扰用户
      setTimeout(() => {
        showPrompt.value = true
      }, 3000)
    }
  })

  // 监听 appinstalled 事件
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    localStorage.setItem('pwa-installed', 'true')
    showPrompt.value = false
  })

  // iOS Safari 特殊提示
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(userAgent)
  }

  const isInStandaloneMode = () => {
    return ('standalone' in window.navigator) && (window.navigator as any).standalone
  }

  if (isIos() && !isInStandaloneMode() && shouldShowPrompt()) {
    // iOS 需要手动添加到主屏幕
    setTimeout(() => {
      showPrompt.value = true
    }, 5000)
  }
})
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  backdrop-filter: blur(10px);
}

.install-content {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.install-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.install-text {
  flex: 1;
  min-width: 0;
}

.install-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.install-description {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.install-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.install-btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.install-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.install-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.install-btn.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.install-btn.secondary:hover {
  background: #edf2f7;
}

.close-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #a0aec0;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f7fafc;
  color: #4a5568;
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .install-content {
    flex-wrap: wrap;
  }

  .install-actions {
    width: 100%;
    margin-top: 0.5rem;
  }

  .install-btn {
    flex: 1;
  }
}
</style>
