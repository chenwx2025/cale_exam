/**
 * API拦截器插件
 *
 * 功能：
 * 1. 拦截401错误，自动刷新token并重试请求
 * 2. 处理网络错误
 * 3. 统一错误处理
 */

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const { refreshToken } = useAutoRefreshToken()
  const router = useRouter()

  // 正在刷新的Promise，避免并发刷新
  let refreshPromise: Promise<boolean> | null = null

  // 等待刷新完成的请求队列
  const pendingRequests: Array<{
    resolve: (value: any) => void
    reject: (reason?: any) => void
    request: () => Promise<any>
  }> = []

  /**
   * 处理401错误：刷新token并重试
   */
  const handle401 = async (originalRequest: () => Promise<any>): Promise<any> => {
    // 如果正在刷新，加入队列等待
    if (refreshPromise) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve,
          reject,
          request: originalRequest
        })
      })
    }

    // 开始刷新
    refreshPromise = refreshToken()

    try {
      const success = await refreshPromise

      if (success) {
        // 刷新成功，重试所有等待的请求
        console.log('[API拦截器] Token刷新成功，重试请求')

        // 重试原始请求
        const result = await originalRequest()

        // 重试所有等待的请求
        pendingRequests.forEach(({ resolve, request }) => {
          request().then(resolve).catch((error) => {
            console.error('[API拦截器] 重试请求失败:', error)
          })
        })
        pendingRequests.length = 0

        return result
      } else {
        // 刷新失败，清空队列并跳转登录
        console.error('[API拦截器] Token刷新失败，跳转登录')
        pendingRequests.forEach(({ reject }) => {
          reject(new Error('Token刷新失败'))
        })
        pendingRequests.length = 0

        // 清除认证信息
        authStore.logout()

        // 跳转到登录页
        router.push('/login')

        throw new Error('Token刷新失败，请重新登录')
      }
    } finally {
      refreshPromise = null
    }
  }

  /**
   * 全局fetch拦截器
   */
  globalThis.$fetch = $fetch.create({
    async onRequest({ options }) {
      // 添加认证头
      if (authStore.accessToken) {
        options.headers = options.headers || {}
        ;(options.headers as any).Authorization = `Bearer ${authStore.accessToken}`
      }
    },

    async onResponseError({ response, options, request }) {
      // 处理401错误
      if (response.status === 401) {
        const requestUrl = request.toString()

        // 检查是否是认证相关请求 - 这些请求的401错误应该被忽略，不要尝试刷新token
        const authEndpoints = [
          '/api/auth/logout',
          '/api/auth/login',
          '/api/auth/register',
          '/api/auth/refresh',
          '/api/auth/forgot-password',
          '/api/auth/reset-password'
        ]

        if (authEndpoints.some(endpoint => requestUrl.includes(endpoint))) {
          console.log('[API拦截器] 认证请求返回401，直接返回错误（不刷新token）')
          // 不要重试认证请求，让它正常失败并返回错误信息
          throw response._data
        }

        console.log('[API拦截器] 检测到401错误，尝试刷新token')

        try {
          // 重新发起请求的函数
          const retryRequest = () => {
            const headers = options.headers || {}
            ;(headers as any).Authorization = `Bearer ${authStore.accessToken}`

            return $fetch(request as string, {
              ...options,
              headers
            } as any)
          }

          // 处理401并重试
          return await handle401(retryRequest)
        } catch (error) {
          console.error('[API拦截器] 重试失败:', error)
          throw error
        }
      }

      // 处理其他错误
      if (response.status === 403) {
        console.error('[API拦截器] 403 Forbidden - 权限不足')
      } else if (response.status === 500) {
        console.error('[API拦截器] 500 服务器错误')
      }
    }
  })

  console.log('[Plugin] API拦截器已安装')
})
