<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header with Exam Selector -->
      <div class="mb-8">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              学习中心
            </h1>
            <p class="text-gray-600">
              欢迎回来，<ClientOnly fallback="学员">{{ authStore.user?.name || '学员' }}</ClientOnly>！
            </p>
          </div>
          <NuxtLink
            to="/select-exam"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span class="font-medium">返回个人中心</span>
          </NuxtLink>
        </div>

        <!-- Current Exam Display -->
        <div
          class="p-6 rounded-2xl shadow-lg"
          :class="examStore.isCale
            ? 'bg-gradient-to-r from-blue-500 to-blue-700'
            : 'bg-gradient-to-r from-purple-500 to-purple-700'"
        >
          <div class="flex items-center justify-between text-white">
            <div>
              <div class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-2">
                {{ examStore.currentExam.name }}
              </div>
              <h2 class="text-2xl font-bold mb-1">{{ examStore.currentExam.fullName }}</h2>
              <p class="text-white/80 text-sm">{{ examStore.currentExam.description }}</p>
            </div>
            <svg class="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main Actions Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Primary Actions -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Start Exam -->
            <NuxtLink
              to="/exam/config"
              class="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                </div>
                <svg class="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">模拟考试</h3>
              <p class="text-gray-600 text-sm">配置并开始新的模拟考试</p>
            </NuxtLink>

            <!-- Study Plan -->
            <NuxtLink
              to="/study-plan"
              class="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <svg class="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">学习计划</h3>
              <p class="text-gray-600 text-sm">查看和制定个性化学习计划</p>
            </NuxtLink>
          </div>

          <!-- Secondary Actions -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">快速入口</h2>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <NuxtLink
                to="/outline"
                class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                to="/practiced-questions"
                class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">已做题目</div>
                  <div class="text-xs text-gray-500">复习题目</div>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/dashboard/notes"
                class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">学习笔记</div>
                  <div class="text-xs text-gray-500">我的笔记</div>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/study-groups"
                class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">学习小组</div>
                  <div class="text-xs text-gray-500">加入小组</div>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/stats"
                class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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

        <!-- Stats Sidebar -->
        <div class="space-y-6">
          <!-- Progress Overview -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">学习进度</h2>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div v-else-if="stats" class="space-y-4">
              <div class="p-4 bg-blue-50 rounded-xl">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600">学习计划</span>
                  <span class="text-lg font-bold text-blue-600">{{ stats.studyPlans }}</span>
                </div>
                <div class="text-xs text-gray-500">个活跃计划</div>
              </div>

              <div class="p-4 bg-green-50 rounded-xl">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600">已完成考试</span>
                  <span class="text-lg font-bold text-green-600">{{ stats.exams }}</span>
                </div>
                <div class="text-xs text-gray-500">次模拟考试</div>
              </div>

              <div class="p-4 bg-orange-50 rounded-xl">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600">错题收藏</span>
                  <span class="text-lg font-bold text-orange-600">{{ stats.wrongQuestions }}</span>
                </div>
                <div class="text-xs text-gray-500">道需要复习</div>
              </div>

              <div class="p-4 bg-purple-50 rounded-xl">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600">题目总数</span>
                  <span class="text-lg font-bold text-purple-600">{{ stats.totalQuestions }}</span>
                </div>
                <div class="text-xs text-gray-500">道可用题目</div>
              </div>
            </div>
          </div>

          <!-- Personal Notes Quick Access -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900">个人学习笔记</h2>
              <NuxtLink
                to="/dashboard/notes"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                查看全部 →
              </NuxtLink>
            </div>
            <NuxtLink
              to="/dashboard/notes"
              class="block p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-gray-900 mb-1">我的学习笔记</div>
                  <div class="text-sm text-gray-600">记录学习心得，分享到小组</div>
                </div>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </NuxtLink>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">最近活动</h2>
            <div class="space-y-3">
              <div class="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 font-medium">开始新的学习计划</p>
                  <p class="text-xs text-gray-500">2小时前</p>
                </div>
              </div>
              <div class="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 font-medium">完成模拟考试</p>
                  <p class="text-xs text-gray-500">昨天</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 font-medium">查看考试大纲</p>
                  <p class="text-xs text-gray-500">3天前</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['exam-access' as any],
  layout: 'exam'
})

const authStore = useAuthStore()
const examStore = useExamStore()

interface Stats {
  studyPlans: number
  exams: number
  wrongQuestions: number
  totalQuestions: number
}

const stats = ref<Stats | null>(null)
const loading = ref(true)

// 加载统计数据
onMounted(async () => {
  try {
    // 确保考试类型已初始化
    examStore.initExamType()

    try {
      const headers = authStore.getAuthHeader()
      const response = await $fetch<{
        success: boolean
        data: Stats
      }>(`/api/stats/exam-summary?examType=${examStore.currentExamType}`, {
        headers: headers.Authorization ? { Authorization: headers.Authorization } : {}
      })

      if (response.success) {
        stats.value = response.data
      }
    } catch (apiError) {
      console.error('Failed to fetch stats from API:', apiError)
      // 使用默认值
      stats.value = {
        studyPlans: 0,
        exams: 0,
        wrongQuestions: 0,
        totalQuestions: 0
      }
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
    stats.value = {
      studyPlans: 0,
      exams: 0,
      wrongQuestions: 0,
      totalQuestions: 0
    }
  } finally {
    loading.value = false
  }
})
</script>
