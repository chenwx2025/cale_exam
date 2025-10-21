<template>
  <div class="category-progress-card bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
    <!-- 头部 -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-bold text-lg text-gray-900">{{ category.name }}</h3>
          <span v-if="category.weight" class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {{ category.weight }}%
          </span>
        </div>
        <p v-if="category.description" class="text-sm text-gray-600">{{ category.description }}</p>
      </div>

      <!-- 完成度图标 -->
      <div class="flex-shrink-0 ml-4">
        <div class="relative w-16 h-16">
          <svg class="transform -rotate-90 w-16 h-16">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#e5e7eb"
              stroke-width="6"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              :stroke="progressColor"
              stroke-width="6"
              fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              class="transition-all duration-500"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-sm font-bold" :style="{ color: progressColor }">
              {{ progress }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center p-3 bg-blue-50 rounded-xl">
        <div class="text-2xl font-bold text-blue-600">{{ category.questionCount || 0 }}</div>
        <div class="text-xs text-gray-600 mt-1">题目数</div>
      </div>
      <div class="text-center p-3 bg-green-50 rounded-xl">
        <div class="text-2xl font-bold text-green-600">{{ practiced }}</div>
        <div class="text-xs text-gray-600 mt-1">已练习</div>
      </div>
      <div class="text-center p-3 bg-purple-50 rounded-xl">
        <div class="text-2xl font-bold text-purple-600">{{ mastered }}</div>
        <div class="text-xs text-gray-600 mt-1">已掌握</div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">学习进度</span>
        <span class="text-sm font-bold" :style="{ color: progressColor }">{{ progress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="h-3 rounded-full transition-all duration-500"
          :style="{ width: `${progress}%`, background: progressGradient }"
        ></div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-2">
      <NuxtLink
        :to="`/practice?category=${category.id}`"
        class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all transform hover:-translate-y-0.5"
      >
        开始练习
      </NuxtLink>
      <button
        @click="$emit('view-details')"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
      >
        详情
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
  code: string
  description?: string
  weight?: number
  questionCount?: number
}

interface Props {
  category: Category
  practiced?: number
  mastered?: number
}

const props = withDefaults(defineProps<Props>(), {
  practiced: 0,
  mastered: 0
})

defineEmits(['view-details'])

// 计算进度
const progress = computed(() => {
  if (!props.category.questionCount || props.category.questionCount === 0) return 0
  return Math.round((props.practiced / props.category.questionCount) * 100)
})

// 进度颜色
const progressColor = computed(() => {
  if (progress.value >= 80) return '#10b981' // green
  if (progress.value >= 50) return '#3b82f6' // blue
  if (progress.value >= 25) return '#f59e0b' // orange
  return '#6b7280' // gray
})

// 进度渐变
const progressGradient = computed(() => {
  if (progress.value >= 80) return 'linear-gradient(90deg, #10b981, #059669)'
  if (progress.value >= 50) return 'linear-gradient(90deg, #3b82f6, #2563eb)'
  if (progress.value >= 25) return 'linear-gradient(90deg, #f59e0b, #d97706)'
  return 'linear-gradient(90deg, #9ca3af, #6b7280)'
})

// 圆形进度条计算
const circumference = 2 * Math.PI * 28
const dashOffset = computed(() => {
  return circumference - (progress.value / 100) * circumference
})
</script>

<style scoped>
.category-progress-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-progress-card:hover {
  transform: translateY(-4px);
}
</style>
