/**
 * Push 通知 Composable
 * 管理浏览器 Push 通知订阅
 */

export const usePushNotifications = () => {
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const isSubscribing = ref(false)
  const subscription = ref<PushSubscription | null>(null)
  const permission = ref<NotificationPermission>('default')

  // 检查浏览器支持
  const checkSupport = () => {
    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
    if (isSupported.value && 'Notification' in window) {
      permission.value = Notification.permission
    }
    return isSupported.value
  }

  // 注册 Service Worker
  const registerServiceWorker = async () => {
    if (!isSupported.value) {
      console.warn('[Push] Service Worker not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('[Push] Service Worker registered:', registration.scope)

      // 等待 Service Worker 激活
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      await navigator.serviceWorker.ready
      console.log('[Push] Service Worker is ready')

      return registration
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error)
      return null
    }
  }

  // 请求通知权限
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('[Push] Notifications not supported')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      console.log('[Push] Notification permission:', result)
      return result
    } catch (error) {
      console.error('[Push] Failed to request permission:', error)
      return 'denied'
    }
  }

  // 订阅 Push 通知
  const subscribe = async () => {
    if (!isSupported.value) {
      throw new Error('Push notifications not supported')
    }

    if (isSubscribing.value) {
      return
    }

    isSubscribing.value = true

    try {
      // 请求权限
      const perm = await requestPermission()
      if (perm !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // 注册 Service Worker
      const registration = await registerServiceWorker()
      if (!registration) {
        throw new Error('Service Worker registration failed')
      }

      // 获取 VAPID 公钥
      const response = await $fetch('/api/push/vapid-public-key')
      const publicKey = response.publicKey

      if (!publicKey) {
        throw new Error('VAPID public key not found')
      }

      // 订阅 Push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      subscription.value = sub

      // 发送订阅到服务器
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        body: {
          subscription: sub.toJSON()
        }
      })

      isSubscribed.value = true
      console.log('[Push] Subscribed successfully')

      return sub
    } catch (error) {
      console.error('[Push] Subscription failed:', error)
      throw error
    } finally {
      isSubscribing.value = false
    }
  }

  // 取消订阅
  const unsubscribe = async () => {
    if (!subscription.value) {
      console.warn('[Push] No active subscription')
      return
    }

    try {
      // 取消浏览器订阅
      await subscription.value.unsubscribe()

      // 通知服务器
      await $fetch('/api/push/unsubscribe', {
        method: 'POST',
        body: {
          endpoint: subscription.value.endpoint
        }
      })

      subscription.value = null
      isSubscribed.value = false
      console.log('[Push] Unsubscribed successfully')
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error)
      throw error
    }
  }

  // 检查当前订阅状态
  const checkSubscription = async () => {
    if (!isSupported.value) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()

      if (sub) {
        subscription.value = sub
        isSubscribed.value = true
        console.log('[Push] Found existing subscription')
      } else {
        subscription.value = null
        isSubscribed.value = false
        console.log('[Push] No existing subscription')
      }
    } catch (error) {
      console.error('[Push] Failed to check subscription:', error)
    }
  }

  // 辅助函数：将 base64 字符串转换为 Uint8Array
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  // 初始化
  onMounted(() => {
    checkSupport()
    if (isSupported.value) {
      checkSubscription()
    }
  })

  return {
    isSupported,
    isSubscribed,
    isSubscribing,
    subscription,
    permission,
    checkSupport,
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscription
  }
}
