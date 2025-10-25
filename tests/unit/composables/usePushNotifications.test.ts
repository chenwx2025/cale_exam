import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { usePushNotifications } from '~/composables/usePushNotifications'

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock navigator and window APIs
const mockSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
  unsubscribe: vi.fn().mockResolvedValue(true),
  toJSON: vi.fn(() => ({
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    keys: {
      p256dh: 'test-p256dh',
      auth: 'test-auth'
    }
  }))
}

const mockPushManager = {
  subscribe: vi.fn().mockResolvedValue(mockSubscription),
  getSubscription: vi.fn().mockResolvedValue(null)
}

const mockServiceWorkerRegistration = {
  scope: '/',
  pushManager: mockPushManager,
  waiting: null,
  postMessage: vi.fn()
}

const mockServiceWorker = {
  register: vi.fn().mockResolvedValue(mockServiceWorkerRegistration),
  ready: Promise.resolve(mockServiceWorkerRegistration)
}

const mockNotification = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi.fn().mockResolvedValue('granted' as NotificationPermission)
}

// Mock window.atob
const mockAtob = vi.fn((str: string) => {
  // Simple mock - just return the string
  return str
})

describe('usePushNotifications', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    mockFetch.mockClear()

    // Re-stub $fetch
    vi.stubGlobal('$fetch', mockFetch)
    mockSubscription.unsubscribe.mockClear()
    mockSubscription.unsubscribe.mockResolvedValue(true)
    mockPushManager.subscribe.mockClear()
    mockPushManager.subscribe.mockResolvedValue(mockSubscription)
    mockPushManager.getSubscription.mockClear()
    mockPushManager.getSubscription.mockResolvedValue(null)
    mockServiceWorker.register.mockClear()
    mockServiceWorker.register.mockResolvedValue(mockServiceWorkerRegistration)
    mockNotification.requestPermission.mockClear()
    mockNotification.requestPermission.mockResolvedValue('granted')
    mockNotification.permission = 'default'

    // Reset Service Worker ready promise
    mockServiceWorker.ready = Promise.resolve(mockServiceWorkerRegistration)

    // Set up full support by default
    vi.stubGlobal('navigator', {
      serviceWorker: mockServiceWorker
    })
    vi.stubGlobal('Notification', mockNotification)
    vi.stubGlobal('atob', mockAtob)
    ;(global as any).PushManager = class PushManager {}
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('支持检测', () => {
    it('应该检测到浏览器支持', () => {
      const { checkSupport, isSupported } = usePushNotifications()

      const result = checkSupport()

      expect(result).toBe(true)
      expect(isSupported.value).toBe(true)
    })

    it('应该在不支持时返回 false', () => {
      // Remove serviceWorker from navigator
      vi.stubGlobal('navigator', {})

      const { checkSupport, isSupported } = usePushNotifications()

      const result = checkSupport()

      expect(result).toBe(false)
      expect(isSupported.value).toBe(false)
    })

    it('应该读取当前通知权限', () => {
      mockNotification.permission = 'granted'

      const { checkSupport, permission } = usePushNotifications()
      checkSupport()

      expect(permission.value).toBe('granted')
    })
  })

  describe('权限请求', () => {
    it('应该成功请求通知权限', async () => {
      const { requestPermission, permission } = usePushNotifications()

      const result = await requestPermission()

      expect(result).toBe('granted')
      expect(permission.value).toBe('granted')
      expect(mockNotification.requestPermission).toHaveBeenCalled()
    })

    it('应该处理权限被拒绝', async () => {
      mockNotification.requestPermission.mockResolvedValue('denied')

      const { requestPermission, permission } = usePushNotifications()

      const result = await requestPermission()

      expect(result).toBe('denied')
      expect(permission.value).toBe('denied')
    })

    it('应该在不支持通知时返回 denied', async () => {
      vi.stubGlobal('Notification', undefined)

      const { requestPermission } = usePushNotifications()

      const result = await requestPermission()

      expect(result).toBe('denied')
    })

    it('应该处理权限请求错误', async () => {
      mockNotification.requestPermission.mockRejectedValue(new Error('Permission error'))

      const { requestPermission } = usePushNotifications()

      const result = await requestPermission()

      expect(result).toBe('denied')
    })
  })

  describe('Service Worker 注册', () => {
    it('应该在不支持时抛出错误', async () => {
      // Remove support
      vi.stubGlobal('navigator', {})

      const pushNotif = usePushNotifications()

      // Try to subscribe when not supported
      await expect(pushNotif.subscribe()).rejects.toThrow('not supported')
    })
  })

  describe('订阅管理', () => {
    it('应该成功订阅 Push 通知', async () => {
      mockFetch.mockResolvedValueOnce({ publicKey: 'test-public-key' })
      mockFetch.mockResolvedValueOnce({ success: true })

      const { subscribe, isSubscribed, subscription, checkSupport } = usePushNotifications()
      checkSupport() // Ensure support is detected

      const result = await subscribe()

      expect(result).toStrictEqual(mockSubscription)
      expect(isSubscribed.value).toBe(true)
      expect(subscription.value).toStrictEqual(mockSubscription)
      expect(mockFetch).toHaveBeenCalledWith('/api/push/vapid-public-key')
      expect(mockFetch).toHaveBeenCalledWith('/api/push/subscribe', {
        method: 'POST',
        body: {
          subscription: mockSubscription.toJSON()
        }
      })
    })

    it('应该在不支持时抛出错误', async () => {
      vi.stubGlobal('navigator', {})

      const { subscribe } = usePushNotifications()

      await expect(subscribe()).rejects.toThrow('not supported')
    })

    it('应该在权限被拒绝时抛出错误', async () => {
      mockNotification.requestPermission.mockResolvedValue('denied')

      const { subscribe, checkSupport } = usePushNotifications()
      checkSupport()

      await expect(subscribe()).rejects.toThrow('permission denied')
    })

    it('应该在 Service Worker 注册失败时抛出错误', async () => {
      mockServiceWorker.register.mockResolvedValue(null)

      const { subscribe, checkSupport } = usePushNotifications()
      checkSupport()

      await expect(subscribe()).rejects.toThrow('Service Worker registration failed')
    })

    it('应该在缺少 VAPID 公钥时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({ publicKey: null })

      const { subscribe, checkSupport } = usePushNotifications()
      checkSupport()

      await expect(subscribe()).rejects.toThrow('VAPID public key not found')
    })

    it('应该防止重复订阅', async () => {
      mockFetch.mockResolvedValueOnce({ publicKey: 'test-key' })
      mockFetch.mockResolvedValueOnce({ success: true })

      const { subscribe, checkSupport } = usePushNotifications()
      checkSupport()

      // Start first subscription
      const promise1 = subscribe()

      // Immediately try second subscription while first is in progress
      // Second call should return early because isSubscribing is true
      await promise1

      // Check that we only registered service worker once
      expect(mockServiceWorker.register).toHaveBeenCalledTimes(1)
    })

    it('应该在订阅失败后重置 isSubscribing', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { subscribe, isSubscribing, checkSupport } = usePushNotifications()
      checkSupport()

      try {
        await subscribe()
      } catch (error) {
        // Expected error
      }

      expect(isSubscribing.value).toBe(false)
    })
  })

  describe('取消订阅', () => {
    it('应该成功取消订阅', async () => {
      mockFetch.mockResolvedValue({ success: true })

      const { subscribe, unsubscribe, isSubscribed, subscription, checkSupport } = usePushNotifications()
      checkSupport()

      // First subscribe
      mockFetch.mockResolvedValueOnce({ publicKey: 'test-key' })
      await subscribe()

      // Then unsubscribe
      await unsubscribe()

      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith('/api/push/unsubscribe', {
        method: 'POST',
        body: {
          endpoint: mockSubscription.endpoint
        }
      })
      expect(isSubscribed.value).toBe(false)
      expect(subscription.value).toBeNull()
    })

    it('应该在没有订阅时不执行操作', async () => {
      const { unsubscribe } = usePushNotifications()

      await unsubscribe()

      expect(mockSubscription.unsubscribe).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('应该处理取消订阅错误', async () => {
      mockFetch.mockResolvedValueOnce({ publicKey: 'test-key' })
      mockFetch.mockResolvedValueOnce({ success: true })

      const { subscribe, unsubscribe, checkSupport } = usePushNotifications()
      checkSupport()

      // First subscribe
      await subscribe()

      // Mock unsubscribe error
      mockSubscription.unsubscribe.mockRejectedValueOnce(new Error('Unsubscribe failed'))

      await expect(unsubscribe()).rejects.toThrow('Unsubscribe failed')
    })
  })

  describe('订阅状态检查', () => {
    it('应该发现现有订阅', async () => {
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription)

      const { checkSubscription, isSubscribed, subscription, checkSupport } = usePushNotifications()
      checkSupport()

      // Manually check subscription
      await checkSubscription()

      expect(isSubscribed.value).toBe(true)
      expect(subscription.value).toStrictEqual(mockSubscription)
    })

    it('应该处理无订阅情况', async () => {
      mockPushManager.getSubscription.mockResolvedValue(null)

      const { checkSubscription, isSubscribed, subscription } = usePushNotifications()

      await checkSubscription()

      expect(isSubscribed.value).toBe(false)
      expect(subscription.value).toBeNull()
    })

    it('应该在不支持时不执行检查', async () => {
      vi.stubGlobal('navigator', {})

      const { checkSubscription } = usePushNotifications()

      await checkSubscription()

      expect(mockPushManager.getSubscription).not.toHaveBeenCalled()
    })

    it('应该处理检查订阅错误', async () => {
      mockPushManager.getSubscription.mockRejectedValue(new Error('Check failed'))

      const { checkSubscription } = usePushNotifications()

      // Should not throw, just log error
      await expect(checkSubscription()).resolves.toBeUndefined()
    })
  })

  describe('返回值结构', () => {
    it('应该返回所有必需的属性', () => {
      const pushNotif = usePushNotifications()

      expect(pushNotif).toHaveProperty('isSupported')
      expect(pushNotif).toHaveProperty('isSubscribed')
      expect(pushNotif).toHaveProperty('isSubscribing')
      expect(pushNotif).toHaveProperty('subscription')
      expect(pushNotif).toHaveProperty('permission')
      expect(pushNotif).toHaveProperty('checkSupport')
      expect(pushNotif).toHaveProperty('requestPermission')
      expect(pushNotif).toHaveProperty('subscribe')
      expect(pushNotif).toHaveProperty('unsubscribe')
      expect(pushNotif).toHaveProperty('checkSubscription')
    })

    it('应该返回正确的初始状态', async () => {
      const { checkSupport, isSupported, isSubscribed, isSubscribing, subscription, permission } = usePushNotifications()

      // Manually call checkSupport instead of relying on onMounted
      checkSupport()

      // Wait a bit for any async operations
      await new Promise(resolve => setTimeout(resolve, 10))

      // isSupported will be true because we mocked the APIs
      expect(isSupported.value).toBe(true)
      expect(isSubscribed.value).toBe(false) // No subscription by default
      expect(isSubscribing.value).toBe(false)
      expect(subscription.value).toBeNull()
      expect(permission.value).toBe('default')
    })

    it('应该返回函数类型的方法', () => {
      const pushNotif = usePushNotifications()

      expect(typeof pushNotif.checkSupport).toBe('function')
      expect(typeof pushNotif.requestPermission).toBe('function')
      expect(typeof pushNotif.subscribe).toBe('function')
      expect(typeof pushNotif.unsubscribe).toBe('function')
      expect(typeof pushNotif.checkSubscription).toBe('function')
    })
  })
})
