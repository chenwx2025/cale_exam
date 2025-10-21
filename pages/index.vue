<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- 未登录状态 -->
    <div v-if="!authStore.isAuthenticated" class="max-w-6xl mx-auto px-4 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          中医考试学习系统
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          专业的在线学习平台，支持 CALE 和 NCCAOM 考试备考
          <br>
          智能题库、学习计划、模拟考试，助您顺利通过考试
        </p>
        <div class="flex gap-4 justify-center">
          <NuxtLink
            to="/register"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            立即注册
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            登录账号
          </NuxtLink>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">海量题库</h3>
          <p class="text-gray-600">
            覆盖 CALE 和 NCCAOM 考试所有知识点，真题模拟，精准押题
          </p>
        </div>

        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">智能学习计划</h3>
          <p class="text-gray-600">
            AI 智能规划学习路径，个性化复习方案，高效备考
          </p>
        </div>

        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">学习数据分析</h3>
          <p class="text-gray-600">
            详细的学习统计，错题分析，掌握薄弱环节，针对性提升
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()

// 如果已登录，智能重定向
onMounted(() => {
  if (authStore.isAuthenticated) {
    // 如果用户已订阅考试，直接进入 dashboard
    if (authStore.user?.subscribedExams && authStore.user.subscribedExams.length > 0) {
      // 确保 examStore 已初始化当前考试类型
      examStore.initExamType()
      router.push('/dashboard')
    } else {
      // 如果未订阅任何考试，进入考试选择页面
      router.push('/select-exam')
    }
  }
})
</script>
