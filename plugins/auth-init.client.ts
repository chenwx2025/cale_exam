export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // 初始化认证状态（从 localStorage 恢复）
  await authStore.init()
})
