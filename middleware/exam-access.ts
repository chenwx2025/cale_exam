/**
 * 考试访问权限中间件
 * 检查用户是否订阅了当前正在访问的考试类型
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const examStore = useExamStore()

  // 如果用户未登录，让 auth.global.ts 处理
  if (!authStore.isAuthenticated) {
    return
  }

  // 需要检查考试订阅权限的路由前缀
  const examProtectedPaths = [
    '/dashboard',
    '/outline',
    '/exam',
    '/study-plan',
    '/wrong-questions',
    '/practiced-questions',
    '/stats',
    '/ai'
  ]

  // 检查当前路由是否需要考试订阅权限
  const needsExamAccess = examProtectedPaths.some(path => to.path.startsWith(path))

  if (!needsExamAccess) {
    return
  }

  // 获取当前选择的考试类型
  const currentExamType = examStore.currentExamType

  // 如果没有选择考试类型，重定向到考试选择页面
  if (!currentExamType) {
    return navigateTo('/select-exam')
  }

  // 检查用户是否订阅了当前考试类型
  const hasAccess = authStore.user?.subscribedExams?.includes(currentExamType) || false

  if (!hasAccess) {
    // 用户未订阅该考试，重定向到考试选择页面
    return navigateTo('/select-exam')
  }

  // 用户有访问权限，允许继续
})
