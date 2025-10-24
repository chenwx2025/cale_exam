<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="px-4 py-3 flex items-center justify-between">
        <!-- Logo 和标题 -->
        <div class="flex items-center gap-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">⚡</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">CALE 管理后台</h1>
              <p class="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-3">
          <!-- 返回前台 -->
          <NuxtLink
            to="/"
            class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回前台
          </NuxtLink>

          <!-- 用户菜单 -->
          <div class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {{ authStore.userInitials }}
            </div>
            <div class="hidden sm:block">
              <p class="text-sm font-semibold text-gray-900">{{ authStore.user?.name }}</p>
              <p class="text-xs text-purple-600">管理员</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- 侧边栏 -->
      <aside
        :class="[
          'fixed lg:sticky top-0 left-0 h-screen bg-white shadow-lg transition-transform duration-300 z-40',
          'w-64 flex-shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <nav class="p-4 h-full overflow-y-auto pt-20 lg:pt-4">
          <div class="space-y-1">
            <!-- 仪表盘 -->
            <NuxtLink
              to="/admin"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin') && !isActive('/admin/', true)
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="font-medium">仪表盘</span>
            </NuxtLink>

            <!-- 用户管理 -->
            <NuxtLink
              to="/admin/users"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/users')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="font-medium">用户管理</span>
            </NuxtLink>

            <!-- 题目管理 -->
            <NuxtLink
              to="/admin/questions"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/questions')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">题目管理</span>
            </NuxtLink>

            <!-- AI 题目生成 -->
            <NuxtLink
              to="/admin/ai-generate"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/ai-generate')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span class="font-medium flex items-center gap-2">
                <span>AI 题目生成</span>
                <span class="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">NEW</span>
              </span>
            </NuxtLink>

            <!-- 分类管理 -->
            <NuxtLink
              to="/admin/categories"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/categories')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span class="font-medium">分类管理</span>
            </NuxtLink>

            <!-- 考试管理 -->
            <NuxtLink
              to="/admin/exams"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/exams')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span class="font-medium">考试管理</span>
            </NuxtLink>

            <!-- 数据分析 -->
            <NuxtLink
              to="/admin/analytics"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/analytics')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span class="font-medium">数据分析</span>
            </NuxtLink>

            <!-- 通知管理 -->
            <NuxtLink
              to="/admin/notifications"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/notifications')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="font-medium">通知管理</span>
            </NuxtLink>

            <!-- 错题分析 -->
            <NuxtLink
              to="/admin/wrong-questions"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/wrong-questions')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">错题分析</span>
            </NuxtLink>

            <!-- 分隔线 -->
            <div class="my-4 border-t border-gray-200"></div>

            <!-- 系统设置 -->
            <NuxtLink
              to="/admin/settings"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive('/admin/settings')
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="font-medium">系统设置</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <!-- 遮罩层 (移动端) -->
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      ></div>

      <!-- 主内容区 -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()
const sidebarOpen = ref(false)

// 检查当前路由是否激活
const isActive = (path: string, exact: boolean = false) => {
  if (exact) {
    return route.path === path
  }
  return route.path.startsWith(path)
}

// 监听路由变化，关闭侧边栏
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>
