export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // 公开路由（不需要登录）
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']

  // 检查是否是公开路由
  const isPublicPath = publicPaths.some(path => to.path.startsWith(path))

  // 如果是公开路由，允许访问
  if (isPublicPath) {
    return
  }

  // 需要认证的路由
  const protectedPaths = [
    '/exam',
    '/study-plan',
    '/admin',
    '/user',
    '/wrong-questions',
    '/outline'
  ]

  // 检查是否是受保护的路由
  const isProtectedPath = protectedPaths.some(path => to.path.startsWith(path))

  if (isProtectedPath && !authStore.isAuthenticated) {
    // 未登录，跳转到登录页
    return navigateTo('/login')
  }

  // 管理员路由检查
  if (to.path.startsWith('/admin') && authStore.user?.role !== 'admin') {
    // 不是管理员，跳转到首页
    return navigateTo('/')
  }

  // 考试类型订阅检查
  const examType = (to.query.examType || to.params.examType) as string
  if (examType && !authStore.canAccessExam(examType)) {
    // 未订阅该考试类型，跳转到订阅页面
    return navigateTo(`/subscribe?exam=${examType}`)
  }
})
