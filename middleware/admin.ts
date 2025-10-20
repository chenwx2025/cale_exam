/**
 * 管理员路由保护中间件
 * 确保只有管理员可以访问 /admin 路由
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // 如果用户未登录，重定向到登录页面
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // 如果用户不是管理员，重定向到首页并显示错误
  if (!authStore.isAdmin) {
    // 可以添加toast通知
    console.warn('Unauthorized access attempt to admin area')
    return navigateTo('/')
  }
})
