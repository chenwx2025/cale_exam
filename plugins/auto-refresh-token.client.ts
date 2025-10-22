/**
 * 自动刷新Token插件
 *
 * 在客户端自动启动token刷新机制
 */

export default defineNuxtPlugin(() => {
  const { startAutoRefresh } = useAutoRefreshToken()

  // 启动自动刷新
  startAutoRefresh()

  console.log('[Plugin] Token自动刷新已启动')
})
