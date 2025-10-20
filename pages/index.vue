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

    <!-- 已登录状态 -->
    <div v-else class="max-w-7xl mx-auto px-4 py-12">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          欢迎回来，{{ authStore.user?.name || '学员' }}！
        </h1>
        <p class="text-gray-600">选择一个考试类型开始学习</p>
      </div>

      <!-- Exam Cards -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- CALE Exam Card -->
        <div
          v-if="hasExamSubscription('cale')"
          @click="enterExam('cale')"
          class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1"
        >
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-3">
                CALE
              </div>
              <h2 class="text-2xl font-bold mb-2">加州中医执照考试</h2>
              <p class="text-blue-100">California Acupuncture Licensing Examination</p>
            </div>
            <svg class="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </div>

          <div v-if="examStats.cale" class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <div class="text-2xl font-bold">{{ examStats.cale.studyPlans }}</div>
              <div class="text-sm text-blue-100">学习计划</div>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ examStats.cale.exams }}</div>
              <div class="text-sm text-blue-100">模拟考试</div>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ examStats.cale.wrongQuestions }}</div>
              <div class="text-sm text-blue-100">错题收藏</div>
            </div>
          </div>
        </div>

        <!-- NCCAOM Exam Card -->
        <div
          v-if="hasExamSubscription('nccaom')"
          @click="enterExam('nccaom')"
          class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-8 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1"
        >
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-3">
                NCCAOM
              </div>
              <h2 class="text-2xl font-bold mb-2">全国中医针灸认证考试</h2>
              <p class="text-purple-100">National Certification Commission</p>
            </div>
            <svg class="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </div>

          <div v-if="examStats.nccaom" class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <div class="text-2xl font-bold">{{ examStats.nccaom.studyPlans }}</div>
              <div class="text-sm text-purple-100">学习计划</div>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ examStats.nccaom.exams }}</div>
              <div class="text-sm text-purple-100">模拟考试</div>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ examStats.nccaom.wrongQuestions }}</div>
              <div class="text-sm text-purple-100">错题收藏</div>
            </div>
          </div>
        </div>

        <!-- No subscriptions message -->
        <div v-if="!hasAnySubscription" class="col-span-2">
          <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <svg class="w-16 h-16 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 class="text-xl font-bold text-gray-900 mb-2">您还没有订阅任何考试</h3>
            <p class="text-gray-600 mb-4">请前往个人中心订阅 CALE 或 NCCAOM 考试</p>
            <NuxtLink
              to="/user/profile"
              class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              前往个人中心
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">快速入口</h2>
        <div class="grid md:grid-cols-4 gap-4">
          <NuxtLink
            to="/exam/config"
            class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-gray-900">配置考试</div>
              <div class="text-xs text-gray-500">创建新考试</div>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/study-plan"
            class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-gray-900">学习计划</div>
              <div class="text-xs text-gray-500">制定计划</div>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/outline"
            class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-gray-900">考试大纲</div>
              <div class="text-xs text-gray-500">查看大纲</div>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/stats"
            class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div>
              <div class="font-semibold text-gray-900">学习统计</div>
              <div class="text-xs text-gray-500">查看数据</div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()

// Exam statistics
const examStats = ref({
  cale: { studyPlans: 0, exams: 0, wrongQuestions: 0 },
  nccaom: { studyPlans: 0, exams: 0, wrongQuestions: 0 }
})

// Check if user has subscription
const hasExamSubscription = (examType: string) => {
  return authStore.user?.subscribedExams?.includes(examType)
}

const hasAnySubscription = computed(() => {
  return hasExamSubscription('cale') || hasExamSubscription('nccaom')
})

// Enter exam (set exam type and navigate)
const enterExam = (examType: 'cale' | 'nccaom') => {
  examStore.setExamType(examType)
  router.push('/outline')
}

// Fetch user statistics if logged in
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      // Fetch separate stats for each exam type
      const response = await $fetch('/api/user/stats', {
        headers: authStore.getAuthHeader()
      })

      if (response.success && response.stats) {
        examStats.value.cale = response.stats.cale
        examStats.value.nccaom = response.stats.nccaom
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }
})
</script>
