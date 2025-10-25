/**
 * CSRF Token 客户端插件
 * 自动在所有 POST/PUT/DELETE/PATCH 请求中添加 CSRF token
 */

export default defineNuxtPlugin(() => {
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  // 拦截 $fetch 请求
  const originalFetch = globalThis.$fetch

  globalThis.$fetch = (async (url: any, options: any = {}) => {
    const method = options.method?.toUpperCase() || 'GET'

    // 对状态修改操作添加 CSRF token
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = getCookie('csrf-token')

      if (csrfToken) {
        options.headers = {
          ...options.headers,
          'X-CSRF-Token': csrfToken
        }
      }
    }

    return originalFetch(url, options)
  }) as typeof originalFetch
})
