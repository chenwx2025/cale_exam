<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- 顶部栏 - 显示当前选择的考试 -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="flex items-center justify-between px-6 py-4">
        <!-- 左侧：Logo 和考试类型 -->
        <div class="flex items-center gap-3 md:gap-6">
          <!-- 移动端菜单按钮 -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900 hidden sm:block">中医考试系统</span>
          </NuxtLink>

          <!-- 分隔线 -->
          <div class="hidden md:block w-px h-8 bg-gray-300"></div>

          <!-- 当前考试类型 -->
          <div
            class="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl transition-all cursor-pointer hover:shadow-md"
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
            </div>

            <!-- 切换考试按钮 -->
            <button
              @click="showExamSwitcher = true"
              class="ml-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="切换考试"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 右侧：用户菜单 -->
        <div class="flex items-center gap-4">
          <!-- 通知 -->
          <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- 用户头像和名称 -->
          <div class="relative user-menu-container" @click="showUserMenu = !showUserMenu">
            <div class="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
              <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                <ClientOnly fallback="U">{{ authStore.userInitials }}</ClientOnly>
              </div>
              <div class="hidden md:block">
                <div class="text-sm font-semibold text-gray-900">
                  <ClientOnly fallback="">{{ authStore.user?.name }}</ClientOnly>
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
              <NuxtLink to="/user/profile" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="text-gray-700">个人中心</span>
              </NuxtLink>
              <NuxtLink to="/stats" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span class="text-gray-700">学习统计</span>
              </NuxtLink>
              <NuxtLink v-if="authStore.isAdmin" to="/admin" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-gray-700">管理后台</span>
              </NuxtLink>
              <hr class="my-2 border-gray-200">
              <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 移动端遮罩层 -->
    <Transition name="fade">
      <div
        v-if="showMobileMenu"
        class="fixed inset-0 bg-black/50 z-40 md:hidden"
        @click="showMobileMenu = false"
      ></div>
    </Transition>

    <div class="flex">
      <!-- 左侧导航栏 -->
      <aside
        class="w-64 bg-white border-r border-gray-200 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto transition-transform duration-300 z-40"
        :class="{
          'fixed left-0 top-[73px] shadow-2xl': showMobileMenu,
          '-translate-x-full md:translate-x-0': !showMobileMenu,
          'translate-x-0': showMobileMenu
        }"
      >
        <nav class="p-4">
          <!-- 主要功能导航 -->
          <div class="space-y-1">
            <NuxtLink
              to="/dashboard"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/dashboard' }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span>学习中心</span>
            </NuxtLink>

            <NuxtLink
              to="/outline"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/outline' }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>考试大纲</span>
            </NuxtLink>

            <NuxtLink
              to="/exam-info"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/exam-info' }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>考试须知</span>
            </NuxtLink>

            <NuxtLink
              to="/knowledge-points"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/knowledge-points' }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span>知识点详解</span>
            </NuxtLink>

            <NuxtLink
              to="/exam/config"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path.startsWith('/exam') }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
              <span>模拟考试</span>
            </NuxtLink>

            <NuxtLink
              to="/study-plans"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path.startsWith('/study-plan') }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>学习计划</span>
            </NuxtLink>

            <NuxtLink
              to="/exams"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path.startsWith('/exams') }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>考试列表</span>
            </NuxtLink>
          </div>

          <!-- 分隔线 -->
          <div class="my-4 border-t border-gray-200"></div>

          <!-- 次要功能 -->
          <div class="space-y-1">
            <NuxtLink
              to="/wrong-questions"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/wrong-questions' }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>错题本</span>
              <span v-if="wrongQuestionsCount > 0" class="ml-auto px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                {{ wrongQuestionsCount }}
              </span>
            </NuxtLink>

            <NuxtLink
              to="/practiced-questions"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/practiced-questions' }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>已做题目</span>
            </NuxtLink>

            <NuxtLink
              to="/stats"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/stats' }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>学习统计</span>
            </NuxtLink>
          </div>
        </nav>

        <!-- 底部学习进度卡片 -->
        <div class="p-4 mt-4">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span class="text-sm font-semibold text-gray-700">今日目标</span>
            </div>
            <div class="space-y-2">
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-gray-600">答题进度</span>
                  <span class="text-blue-600 font-bold">{{ todayProgress }}/20</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min((todayProgress / 20) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>

    <!-- 考试切换模态框 -->
    <ExamSwitcherModal v-model="showExamSwitcher" />
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '~/composables/useDialog'

const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()
const route = useRoute()
const dialog = useDialog()

const showUserMenu = ref(false)
const showExamSwitcher = ref(false)
const showMobileMenu = ref(false)
const wrongQuestionsCount = ref(0)
const todayProgress = ref(0)

// 关闭移动端菜单当路由变化时
watch(() => route.path, () => {
  showMobileMenu.value = false
})

// 退出登录
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

// 加载错题数量
const loadWrongQuestionsCount = async () => {
  try {
    const response = await $fetch<{
      success: boolean
      count: number
    }>(`/api/wrong-questions/count?examType=${examStore.currentExamType}`, {
      headers: authStore.getAuthHeader() as Record<string, string>
    })
    if (response.success) {
      wrongQuestionsCount.value = response.count
    }
  } catch (error) {
    console.error('Failed to load wrong questions count:', error)
  }
}

// 点击外部关闭用户菜单
let handleClickOutside: ((e: MouseEvent) => void) | null = null

onMounted(() => {
  // 设置点击外部关闭用户菜单
  handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const userMenuElement = document.querySelector('.user-menu-container')
    if (userMenuElement && !userMenuElement.contains(target)) {
      showUserMenu.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)

  // 加载错题数量和今日进度
  loadWrongQuestionsCount()
  todayProgress.value = Math.floor(Math.random() * 25) // 临时模拟数据
})

onUnmounted(() => {
  if (handleClickOutside) {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
.nav-item {
  @apply flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all cursor-pointer font-medium;
}

.nav-item-active {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold;
}

.nav-item svg {
  @apply flex-shrink-0;
}

/* Fade transition for mobile overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
