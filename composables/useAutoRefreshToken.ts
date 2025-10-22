/**
 * 自动刷新Token的Composable
 *
 * 功能：
 * 1. 在token即将过期前自动刷新
 * 2. API请求401时自动刷新并重试
 * 3. 页面激活时检查token有效性
 */

import { useAuthStore } from '~/stores/auth'
import { jwtDecode } from 'jwt-decode'

// Token刷新策略配置
const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000 // 提前5分钟刷新
const CHECK_INTERVAL = 60 * 1000 // 每分钟检查一次

export const useAutoRefreshToken = () => {
  const authStore = useAuthStore()
  let refreshTimer: NodeJS.Timeout | null = null
  let isRefreshing = false

  /**
   * 检查token是否即将过期
   */
  const isTokenExpiringSoon = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token)
      const expiryTime = decoded.exp * 1000 // 转换为毫秒
      const now = Date.now()
      const timeUntilExpiry = expiryTime - now

      return timeUntilExpiry < REFRESH_BEFORE_EXPIRY
    } catch (error) {
      console.error('[AutoRefresh] 解码token失败:', error)
      return true // 解码失败，认为需要刷新
    }
  }

  /**
   * 检查token是否已过期
   */
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token)
      const expiryTime = decoded.exp * 1000
      return Date.now() >= expiryTime
    } catch (error) {
      return true
    }
  }

  /**
   * 执行token刷新
   */
  const refreshToken = async (): Promise<boolean> => {
    if (isRefreshing) {
      console.log('[AutoRefresh] 正在刷新中，跳过')
      return false
    }

    if (!authStore.refreshToken) {
      console.log('[AutoRefresh] 没有refresh token')
      return false
    }

    try {
      isRefreshing = true
      console.log('[AutoRefresh] 开始刷新token...')

      const success = await authStore.refreshAccessToken()

      if (success) {
        console.log('[AutoRefresh] ✅ Token刷新成功')
        scheduleNextRefresh()
        return true
      } else {
        console.error('[AutoRefresh] ❌ Token刷新失败')
        // 刷新失败，可能需要重新登录
        return false
      }
    } catch (error) {
      console.error('[AutoRefresh] Token刷新异常:', error)
      return false
    } finally {
      isRefreshing = false
    }
  }

  /**
   * 计划下次刷新
   */
  const scheduleNextRefresh = () => {
    // 清除之前的定时器
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }

    if (!authStore.accessToken) {
      return
    }

    try {
      const decoded: any = jwtDecode(authStore.accessToken)
      const expiryTime = decoded.exp * 1000
      const now = Date.now()
      const timeUntilExpiry = expiryTime - now
      const refreshTime = timeUntilExpiry - REFRESH_BEFORE_EXPIRY

      if (refreshTime > 0) {
        console.log(`[AutoRefresh] 将在 ${Math.round(refreshTime / 60000)} 分钟后刷新token`)

        // 设置一次性刷新
        setTimeout(() => {
          refreshToken()
        }, refreshTime)
      } else {
        // 已经需要刷新了
        console.log('[AutoRefresh] Token即将过期，立即刷新')
        refreshToken()
      }
    } catch (error) {
      console.error('[AutoRefresh] 计划刷新失败:', error)
    }
  }

  /**
   * 启动自动刷新
   */
  const startAutoRefresh = () => {
    if (!import.meta.client) {
      return
    }

    console.log('[AutoRefresh] 启动自动刷新机制')

    // 立即检查一次
    if (authStore.accessToken) {
      if (isTokenExpired(authStore.accessToken)) {
        console.log('[AutoRefresh] Token已过期，立即刷新')
        refreshToken()
      } else if (isTokenExpiringSoon(authStore.accessToken)) {
        console.log('[AutoRefresh] Token即将过期，立即刷新')
        refreshToken()
      } else {
        scheduleNextRefresh()
      }
    }

    // 定期检查（每分钟）
    refreshTimer = setInterval(() => {
      if (authStore.accessToken && isTokenExpiringSoon(authStore.accessToken)) {
        refreshToken()
      }
    }, CHECK_INTERVAL)

    // 页面可见性变化时检查
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && authStore.accessToken) {
          if (isTokenExpired(authStore.accessToken)) {
            console.log('[AutoRefresh] 页面激活，token已过期，刷新')
            refreshToken()
          }
        }
      })
    }

    // 页面获得焦点时检查
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        if (authStore.accessToken && isTokenExpired(authStore.accessToken)) {
          console.log('[AutoRefresh] 窗口获得焦点，token已过期，刷新')
          refreshToken()
        }
      })
    }
  }

  /**
   * 停止自动刷新
   */
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
    console.log('[AutoRefresh] 停止自动刷新')
  }

  return {
    startAutoRefresh,
    stopAutoRefresh,
    refreshToken,
    isTokenExpiringSoon,
    isTokenExpired
  }
}
