<template>
  <div>
    <!-- 考试选择器 -->
    <ExamSelector :showDescription="false" class="mb-6" />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">我的学习计划</h1>
      <NuxtLink
        to="/study-plan"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        创建新计划
      </NuxtLink>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- 学习计划列表 -->
    <div v-else-if="studyPlans && studyPlans.length > 0" class="grid gap-6">
      <div
        v-for="plan in studyPlans"
        :key="plan.id"
        class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h2 class="text-2xl font-bold text-gray-900">{{ plan.name }}</h2>
                <span
                  v-if="plan.isActive"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
                >
                  进行中
                </span>
                <span
                  v-else
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold"
                >
                  已完成
                </span>
              </div>
              <p v-if="plan.description" class="text-gray-600">{{ plan.description }}</p>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="font-semibold text-gray-700">学习进度</span>
              <span class="font-bold text-blue-600">{{ plan.stats.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                :style="{ width: `${plan.stats.progress}%` }"
              ></div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ plan.stats.totalQuestions }}</div>
              <div class="text-xs text-gray-600">总题数</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ plan.stats.completedQuestions }}</div>
              <div class="text-xs text-gray-600">已完成</div>
            </div>
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ plan.stats.totalDays }}</div>
              <div class="text-xs text-gray-600">学习天数</div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ plan.stats.questionsPerDay }}</div>
              <div class="text-xs text-gray-600">每天题数</div>
            </div>
          </div>

          <!-- 日期信息 -->
          <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>{{ formatDate(plan.startDate) }} - {{ formatDate(plan.endDate) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3">
            <NuxtLink
              :to="`/study-plans/${plan.id}`"
              class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              查看详情
            </NuxtLink>
            <button
              v-if="plan.isActive"
              @click="startStudy(plan.id)"
              class="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              开始学习
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
      <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">还没有学习计划</h2>
      <p class="text-gray-600 mb-6">创建你的第一个学习计划，开始系统化的备考吧！</p>
      <NuxtLink
        to="/study-plan"
        class="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        创建学习计划
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const examStore = useExamStore()

// 获取当前考试类型
const currentExamType = computed(() => examStore.currentExamType)

// 获取学习计划列表
const { data: studyPlans, pending, refresh } = await useFetch('/api/study-plans', {
  query: {
    userId: 'demo-user',
    examType: currentExamType
  },
  watch: [currentExamType]
})

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const startStudy = (planId: string) => {
  navigateTo(`/study-plans/${planId}`)
}
</script>
