<template>
  <div class="min-h-screen bg-gray-50">
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
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors rounded-b-lg"
                >
                  📊 学习统计
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
            <!-- 用户菜单 -->
            <div v-if="isLoggedIn" class="relative group">
              <button class="px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                {{ userName }}
              </button>
              <div class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <NuxtLink
                  to="/stats"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors rounded-t-lg"
                >
                  我的统计
                </NuxtLink>
                <NuxtLink
                  to="/wrong-questions"
                  class="block px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  我的错题本
                </NuxtLink>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition-colors rounded-b-lg"
                >
                  退出登录
                </button>
              </div>
            </div>

            <NuxtLink
              v-else
              to="/auth/login"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref<any>(null)

const isLoggedIn = computed(() => !!user.value)
const userName = computed(() => user.value?.name || '用户')

const checkAuth = () => {
  if (process.client) {
    const userData = localStorage.getItem('cale_user')
    if (userData) {
      try {
        user.value = JSON.parse(userData)
      } catch (e) {
        localStorage.removeItem('cale_user')
        localStorage.removeItem('cale_token')
      }
    }
  }
}

const handleLogout = () => {
  if (process.client) {
    localStorage.removeItem('cale_user')
    localStorage.removeItem('cale_token')
    user.value = null
    router.push('/')
  }
}

onMounted(() => {
  checkAuth()
})
</script>
