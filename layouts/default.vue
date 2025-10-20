<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 离线指示器 -->
    <OfflineIndicator />

    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-blue-600">
              Cale 加州中医考试系统
            </NuxtLink>
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/outline"
              class="px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              active-class="bg-blue-100 text-blue-700"
            >
              考试大纲
            </NuxtLink>

            <!-- 学习功能下拉菜单 -->
            <div class="relative group">
              <button class="px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1">
                学习中心
                <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div class="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <NuxtLink
                  to="/wrong-questions"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors rounded-t-lg"
                >
                  📚 我的错题本
                </NuxtLink>
                <NuxtLink
                  to="/study-plans"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  📅 我的复习计划
                </NuxtLink>
                <NuxtLink
                  to="/study-plan"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  ✏️ 创建复习计划
                </NuxtLink>
                <NuxtLink
                  to="/stats"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  📊 学习统计
                </NuxtLink>
                <NuxtLink
                  to="/ai/learning-path"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors rounded-b-lg"
                >
                  🤖 AI 学习助手
                </NuxtLink>
              </div>
            </div>

            <!-- 模拟考试下拉菜单 -->
            <div class="relative group">
              <button class="px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1">
                模拟考试
                <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <NuxtLink
                  to="/exam/question-sets"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors rounded-t-lg"
                >
                  题目集列表
                </NuxtLink>
                <NuxtLink
                  to="/exam/config"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors rounded-b-lg"
                >
                  配置新考试
                </NuxtLink>
              </div>
            </div>
            <!-- 通知铃铛 -->
            <NotificationBell v-if="authStore.isAuthenticated" />

            <!-- 用户菜单 -->
            <div v-if="authStore.isAuthenticated" class="relative group">
              <button class="px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {{ userInitial }}
                </div>
                <span class="font-medium">{{ userName }}</span>
                <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div class="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-100">
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
                </div>
                <NuxtLink
                  to="/user/profile"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>个人中心</span>
                </NuxtLink>
                <NuxtLink
                  to="/stats"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  <span>学习统计</span>
                </NuxtLink>
                <NuxtLink
                  to="/wrong-questions"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  <span>我的错题本</span>
                </NuxtLink>
                <div class="border-t border-gray-100">
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors rounded-b-lg"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            </div>

            <NuxtLink
              v-else
              to="/login"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录/注册
            </NuxtLink>

            <NuxtLink
              to="/admin"
              class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              管理后台
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-gray-600">
          © 2025 Cale 加州中医考试系统 - 祝您考试顺利！
        </p>
      </div>
    </footer>

    <!-- PWA 安装提示 -->
    <InstallPrompt />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || '用户')
const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'U'
  return name.charAt(0).toUpperCase()
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>
