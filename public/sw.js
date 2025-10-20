/**
 * Service Worker for Push Notifications
 * CALE/NCCAOM 考试系统
 */

const CACHE_NAME = 'cale-exam-v1'
const urlsToCache = [
  '/',
  '/login',
  '/practice',
  '/notifications'
]

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell')
        return cache.addAll(urlsToCache)
      })
  )
  // 强制激活新的 Service Worker
  self.skipWaiting()
})

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // 立即控制所有客户端
  return self.clients.claim()
})

// 拦截网络请求（可选的缓存策略）
self.addEventListener('fetch', (event) => {
  // 只缓存 GET 请求
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中，返回缓存
        if (response) {
          return response
        }
        // 缓存未命中，发起网络请求
        return fetch(event.request)
      })
  )
})

// 接收 Push 消息
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received:', event)

  let notificationData = {
    title: 'CALE 考试系统',
    body: '您有新的通知',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'notification',
    requireInteraction: false,
    data: {
      url: '/notifications'
    }
  }

  // 尝试解析 push 数据
  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData = {
        ...notificationData,
        ...payload
      }
    } catch (e) {
      console.error('[SW] Failed to parse push data:', e)
      notificationData.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions || [],
      vibrate: [200, 100, 200], // 震动模式
      timestamp: Date.now()
    })
  )
})

// 点击通知
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag)
  event.notification.close()

  // 获取通知数据中的 URL
  const urlToOpen = event.notification.data?.url || '/notifications'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // 检查是否已经有打开的窗口
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        // 如果找到窗口，聚焦并导航
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus().then(() => {
            return client.navigate(urlToOpen)
          })
        }
      }
      // 没有打开的窗口，打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// 关闭通知
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag)
})

// 处理消息（来自客户端）
self.addEventListener('message', (event) => {
  console.log('[SW] Message received from client:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'PING') {
    event.ports[0].postMessage({ type: 'PONG' })
  }
})
