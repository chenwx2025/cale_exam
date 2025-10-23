<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- 离线指示器 -->
    <OfflineIndicator />

    <!-- 顶部栏 -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="flex items-center justify-between px-6 py-4">
        <!-- 左侧：Logo 和考试类型 -->
        <div class="flex items-center gap-3 md:gap-6">
          <!-- Logo -->
          <NuxtLink :to="authStore.isAuthenticated ? '/dashboard' : '/'" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900 hidden sm:block">中医考试系统</span>
          </NuxtLink>

          <!-- 分隔线 -->
          <div v-if="authStore.isAuthenticated && examStore.currentExamType && route.path !== '/select-exam'" class="hidden md:block w-px h-8 bg-gray-300"></div>

          <!-- 当前考试类型 - 可点击切换 -->
          <div
            v-if="authStore.isAuthenticated && examStore.currentExamType && hasSubscribedExams && route.path !== '/select-exam'"
            class="relative exam-switcher-container"
          >
            <div
              @click="showExamSwitcher = !showExamSwitcher"
              class="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl transition-all cursor-pointer hover:opacity-90"
              :class="examStore.isCale
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : 'bg-gradient-to-r from-purple-500 to-purple-600'"
            >
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="text-white">
                  <div class="text-xs opacity-90">当前考试</div>
                  <div class="font-bold">{{ examStore.currentExam.name }}</div>
                </div>
                <svg class="w-4 h-4 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <!-- 考试切换下拉菜单 -->
            <div v-if="showExamSwitcher" class="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-xs font-semibold text-gray-500">切换考试类型</p>
              </div>
              <button
                v-for="examType in subscribedExamTypes"
                :key="examType"
                @click="switchExam(examType)"
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50': examStore.currentExamType === examType }"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="examType === 'cale'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-purple-500 to-purple-600'"
                >
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <div class="font-semibold text-gray-900">
                    {{ examType === 'cale' ? 'CALE' : 'NCCAOM' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ examType === 'cale' ? '加州中医执照考试' : '全国中医针灸认证' }}
                  </div>
                </div>
                <svg
                  v-if="examStore.currentExamType === examType"
                  class="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧：通知和用户菜单 -->
        <div class="flex items-center gap-4">
          <!-- 语言切换 -->
          <LanguageSwitcher v-if="authStore.isAuthenticated" />

          <!-- 通知铃铛 -->
          <NotificationBell v-if="authStore.isAuthenticated" />

          <!-- 用户头像和名称 -->
          <div v-if="authStore.isAuthenticated" class="relative user-menu-container">
            <div
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                <ClientOnly fallback="U">{{ userInitial }}</ClientOnly>
              </div>
              <div class="hidden md:block">
                <div class="text-sm font-semibold text-gray-900">
                  <ClientOnly fallback="">{{ userName }}</ClientOnly>
                </div>
                <div class="text-xs text-gray-500">
                  <ClientOnly fallback="学员">{{ authStore.user?.role === 'admin' ? '管理员' : '学员' }}</ClientOnly>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>

            <!-- 用户下拉菜单 -->
            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
              </div>
              <NuxtLink to="/user/profile" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="text-gray-700">{{ $t('nav.profile') }}</span>
              </NuxtLink>
              <NuxtLink to="/stats" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span class="text-gray-700">{{ $t('nav.stats') }}</span>
              </NuxtLink>
              <NuxtLink v-if="authStore.isAdmin" to="/admin" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-gray-700">{{ $t('nav.admin') }}</span>
              </NuxtLink>
              <hr class="my-2 border-gray-200">
              <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600 rounded-b-xl">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span>{{ $t('nav.logout') }}</span>
              </button>
            </div>
          </div>

          <!-- 未登录状态 -->
          <NuxtLink
            v-else
            to="/login"
            class="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            {{ $t('nav.login') }}/{{ $t('nav.register') }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main :class="authStore.isAuthenticated ? 'w-full p-6 overflow-auto' : 'w-full'">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer v-if="!authStore.isAuthenticated" class="bg-white border-t mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-gray-600">
          © 2025 Cale 加州中医考试系统 - {{ $t('messages.goodLuck') }}
        </p>
      </div>
    </footer>

    <!-- PWA 安装提示 -->
    <InstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '~/composables/useDialog'

const { t } = useI18n()
const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()
const route = useRoute()
const dialog = useDialog()

const showUserMenu = ref(false)
const showExamSwitcher = ref(false)

const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || t('auth.name'))
const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'U'
  return name.charAt(0).toUpperCase()
})

// 获取用户订阅的考试类型
const subscribedExamTypes = computed(() => {
  return authStore.user?.subscribedExams || []
})

const hasSubscribedExams = computed(() => {
  return subscribedExamTypes.value.length > 0
})

// 切换考试
const switchExam = (examType: string) => {
  examStore.setExamType(examType as any)
  showExamSwitcher.value = false
  // 刷新页面以加载新考试的数据
  if (route.path !== '/select-exam') {
    router.push('/dashboard')
  }
}

// 关闭菜单当路由变化时
watch(() => route.path, () => {
  showUserMenu.value = false
  showExamSwitcher.value = false
})

const handleLogout = async () => {
  console.log('[LOGOUT] 开始登出流程')

  try {
    const confirmed = await dialog.confirm({
      message: '确定要退出登录吗？',
      type: 'warning',
      title: '退出确认',
      confirmText: '退出',
      cancelText: '取消'
    })

    console.log('[LOGOUT] 用户确认结果:', confirmed)

    if (confirmed) {
      // 关闭用户菜单
      showUserMenu.value = false
      console.log('[LOGOUT] 正在执行登出...')

      // 执行登出
      try {
        await authStore.logout()
        console.log('[LOGOUT] authStore.logout() 完成')
      } catch (error) {
        console.error('[LOGOUT] authStore.logout() 失败:', error)
      }

      // 强制刷新页面到登录页，确保所有状态都被清除
      console.log('[LOGOUT] 准备跳转到 /login')

      // 使用多种方式确保跳转
      if (import.meta.client) {
        // 清除所有本地存储
        localStorage.clear()
        console.log('[LOGOUT] localStorage 已清除')

        // 强制跳转
        window.location.href = '/login'
      }
    } else {
      console.log('[LOGOUT] 用户取消登出')
    }
  } catch (error) {
    console.error('[LOGOUT] 登出流程发生错误:', error)
    // 即使出错也尝试跳转到登录页
    if (import.meta.client) {
      localStorage.clear()
      window.location.href = '/login'
    }
  }
}

// 点击外部关闭菜单
let handleClickOutside: ((e: MouseEvent) => void) | null = null

onMounted(async () => {
  // 设置点击外部关闭用户菜单和考试切换器
  handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const userMenuElement = document.querySelector('.user-menu-container')
    const examSwitcherElement = document.querySelector('.exam-switcher-container')

    if (userMenuElement && !userMenuElement.contains(target)) {
      showUserMenu.value = false
    }

    if (examSwitcherElement && !examSwitcherElement.contains(target)) {
      showExamSwitcher.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)

  // 初始化考试类型
  if (authStore.isAuthenticated) {
    examStore.initExamType()

    // 从服务器刷新用户信息，确保订阅数据是最新的
    await authStore.fetchUserInfo()
  }
})

onUnmounted(() => {
  if (handleClickOutside) {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
</style>
