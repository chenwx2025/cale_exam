<template>
  <div>
    <!-- 考试选择器 -->
    <ExamSelector :showDescription="true" />

    <!-- 欢迎区域 -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-12 mb-8 shadow-lg">
      <h1 class="text-4xl font-bold mb-4">欢迎来到中医考试系统</h1>
      <p class="text-xl text-blue-100 mb-6">
        全面的考试准备平台，支持 Cale（加州）和 NCCAOM（全国）考试
      </p>
      <div class="flex gap-4">
        <NuxtLink
          to="/outline"
          class="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          开始学习
        </NuxtLink>
        <NuxtLink
          to="/exam/config"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors"
        >
          模拟考试
        </NuxtLink>
      </div>
    </div>

    <!-- 功能卡片 -->
    <div class="grid md:grid-cols-3 gap-6">
      <!-- 考试大纲 -->
      <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">考试大纲</h3>
        <p class="text-gray-600 mb-4">
          详细的考试大纲，包含组织部分、内容部分和复习部分
        </p>
        <NuxtLink to="/outline" class="text-blue-600 font-semibold hover:text-blue-700">
          查看大纲 →
        </NuxtLink>
      </div>

      <!-- 复习计划 -->
      <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">复习计划</h3>
        <p class="text-gray-600 mb-4">
          制定个性化的学习计划，系统化地准备考试
        </p>
        <NuxtLink to="/study-plan" class="text-green-600 font-semibold hover:text-green-700">
          创建计划 →
        </NuxtLink>
      </div>

      <!-- 模拟考试 -->
      <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">模拟考试</h3>
        <p class="text-gray-600 mb-4">
          真实的考试体验，即时反馈和详细解析
        </p>
        <NuxtLink to="/exam/config" class="text-purple-600 font-semibold hover:text-purple-700">
          开始考试 →
        </NuxtLink>
      </div>
    </div>

    <!-- 统计信息（如果有用户数据）-->
    <div v-if="stats" class="mt-8 bg-white rounded-xl p-6 shadow-md">
      <h2 class="text-2xl font-bold mb-4">您的学习进度</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.overall.total }}</div>
          <div class="text-gray-600">已答题目</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ stats.overall.accuracy }}%</div>
          <div class="text-gray-600">正确率</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">{{ stats.byCategory.length }}</div>
          <div class="text-gray-600">涉及分类</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加获取用户统计的逻辑
const stats = ref(null)

onMounted(async () => {
  // 如果有用户ID，可以获取统计数据
  // const userId = 'demo-user-id'
  // const { data } = await useFetch(`/api/users/${userId}/stats`)
  // stats.value = data.value
})
</script>
