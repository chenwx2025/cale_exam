<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
    <div class="max-w-5xl w-full">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          选择考试类型
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          欢迎回来，{{ authStore.user?.name || '学员' }}！请选择您要备考的考试类型
        </p>
      </div>

      <!-- Exam Type Cards -->
      <div v-if="hasAnySubscription" class="grid md:grid-cols-2 gap-8 mb-8">
        <!-- CALE Exam Card -->
        <div
          v-if="hasExamSubscription('cale')"
          @click="selectExam('cale')"
          class="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
        >
          <div class="bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white relative">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div class="relative z-10">
              <div class="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                CALE
              </div>
              <h2 class="text-3xl font-bold mb-2">加州中医执照考试</h2>
              <p class="text-blue-100 text-sm mb-6">California Acupuncture Licensing Examination</p>

              <div class="flex items-center gap-2 text-blue-100 group-hover:text-white transition-colors">
                <span class="font-semibold">进入学习</span>
                <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>
            </div>
          </div>

          <div v-if="examStats.cale" class="p-6 bg-gray-50">
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ examStats.cale.studyPlans }}</div>
                <div class="text-xs text-gray-600 mt-1">学习计划</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ examStats.cale.exams }}</div>
                <div class="text-xs text-gray-600 mt-1">模拟考试</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ examStats.cale.wrongQuestions }}</div>
                <div class="text-xs text-gray-600 mt-1">错题收藏</div>
              </div>
            </div>
          </div>
        </div>

        <!-- NCCAOM Exam Card -->
        <div
          v-if="hasExamSubscription('nccaom')"
          @click="selectExam('nccaom')"
          class="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
        >
          <div class="bg-gradient-to-br from-purple-500 to-purple-700 p-8 text-white relative">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div class="relative z-10">
              <div class="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                NCCAOM
              </div>
              <h2 class="text-3xl font-bold mb-2">全国中医针灸认证考试</h2>
              <p class="text-purple-100 text-sm mb-6">National Certification Commission</p>

              <div class="flex items-center gap-2 text-purple-100 group-hover:text-white transition-colors">
                <span class="font-semibold">进入学习</span>
                <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>
            </div>
          </div>

          <div v-if="examStats.nccaom" class="p-6 bg-gray-50">
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ examStats.nccaom.studyPlans }}</div>
                <div class="text-xs text-gray-600 mt-1">学习计划</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ examStats.nccaom.exams }}</div>
                <div class="text-xs text-gray-600 mt-1">模拟考试</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ examStats.nccaom.wrongQuestions }}</div>
                <div class="text-xs text-gray-600 mt-1">错题收藏</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No subscriptions message -->
      <div v-else class="max-w-2xl mx-auto">
        <div class="bg-white rounded-3xl shadow-xl p-12 text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">您还没有订阅任何考试</h3>
          <p class="text-gray-600 mb-6 text-lg">请前往个人中心订阅 CALE 或 NCCAOM 考试后再使用学习功能</p>
          <NuxtLink
            to="/user/profile"
            class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>前往个人中心</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Info Cards -->
      <div v-if="hasAnySubscription" class="grid md:grid-cols-3 gap-6 mt-12">
        <div class="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h4 class="font-bold text-gray-900 mb-2">海量题库</h4>
          <p class="text-sm text-gray-600">覆盖所有知识点，真题模拟</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <h4 class="font-bold text-gray-900 mb-2">智能学习</h4>
          <p class="text-sm text-gray-600">AI 规划学习路径</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h4 class="font-bold text-gray-900 mb-2">数据分析</h4>
          <p class="text-sm text-gray-600">详细统计，针对提升</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamType } from '~/stores/exam'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()

interface ExamStats {
  studyPlans: number
  exams: number
  wrongQuestions: number
}

const examStats = ref<{
  cale: ExamStats | null
  nccaom: ExamStats | null
}>({
  cale: null,
  nccaom: null
})

const hasExamSubscription = (examType: ExamType) => {
  return authStore.user?.subscribedExams?.includes(examType) || false
}

const hasAnySubscription = computed(() => {
  return hasExamSubscription('cale') || hasExamSubscription('nccaom')
})

const selectExam = (examType: ExamType) => {
  examStore.setExamType(examType)
  router.push('/dashboard')
}

// 加载统计数据
onMounted(async () => {
  try {
    if (hasExamSubscription('cale')) {
      try {
        const caleResponse = await $fetch<{
          success: boolean
          data: ExamStats
        }>('/api/stats/exam-summary?examType=cale')

        if (caleResponse.success) {
          examStats.value.cale = caleResponse.data
        }
      } catch (err) {
        console.error('Failed to load CALE stats:', err)
        // 使用默认值
        examStats.value.cale = {
          studyPlans: 0,
          exams: 0,
          wrongQuestions: 0
        }
      }
    }

    if (hasExamSubscription('nccaom')) {
      try {
        const nccaomResponse = await $fetch<{
          success: boolean
          data: ExamStats
        }>('/api/stats/exam-summary?examType=nccaom')

        if (nccaomResponse.success) {
          examStats.value.nccaom = nccaomResponse.data
        }
      } catch (err) {
        console.error('Failed to load NCCAOM stats:', err)
        // 使用默认值
        examStats.value.nccaom = {
          studyPlans: 0,
          exams: 0,
          wrongQuestions: 0
        }
      }
    }
  } catch (error) {
    console.error('Failed to load exam stats:', error)
  }
})
</script>
