<template>
  <div class="study-path-visual bg-white rounded-2xl shadow-lg p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">学习路径</h2>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">总进度:</span>
        <span class="text-2xl font-bold text-blue-600">{{ totalProgress }}%</span>
      </div>
    </div>

    <!-- 路径步骤 -->
    <div class="relative">
      <!-- 连接线 -->
      <div class="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 via-blue-300 to-green-300"></div>

      <!-- 步骤列表 -->
      <div class="space-y-6">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="relative flex items-start gap-4 group"
        >
          <!-- 步骤圆圈 -->
          <div class="relative z-10 flex-shrink-0">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110"
              :class="{
                'bg-gradient-to-br from-green-400 to-green-600 text-white': step.completed,
                'bg-gradient-to-br from-blue-400 to-blue-600 text-white animate-pulse': step.current,
                'bg-gray-200 text-gray-500': !step.completed && !step.current
              }"
            >
              <svg v-if="step.completed" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </div>

            <!-- 当前步骤标记 -->
            <div
              v-if="step.current"
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-ping"
            ></div>
            <div
              v-if="step.current"
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white"
            ></div>
          </div>

          <!-- 步骤内容 -->
          <div class="flex-1 pb-2">
            <div
              class="p-4 rounded-xl transition-all duration-300"
              :class="{
                'bg-green-50 border-2 border-green-200': step.completed,
                'bg-blue-50 border-2 border-blue-400 shadow-lg': step.current,
                'bg-gray-50 border-2 border-gray-200': !step.completed && !step.current
              }"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="font-bold text-lg text-gray-900 mb-1">{{ step.title }}</h3>
                  <p class="text-sm text-gray-600">{{ step.description }}</p>
                </div>
                <div class="ml-4">
                  <div class="text-right">
                    <div class="text-2xl font-bold" :class="step.completed ? 'text-green-600' : 'text-gray-400'">
                      {{ step.progress }}%
                    </div>
                    <div class="text-xs text-gray-500">完成度</div>
                  </div>
                </div>
              </div>

              <!-- 进度条 -->
              <div class="mb-3">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-500"
                    :class="{
                      'bg-gradient-to-r from-green-400 to-green-600': step.completed,
                      'bg-gradient-to-r from-blue-400 to-blue-600': step.current && !step.completed,
                      'bg-gray-400': !step.completed && !step.current
                    }"
                    :style="{ width: `${step.progress}%` }"
                  ></div>
                </div>
              </div>

              <!-- 统计信息 -->
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span class="text-gray-700">{{ step.questionsCompleted }}/{{ step.totalQuestions }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-gray-700">{{ step.timeSpent }}h</span>
                </div>
                <div v-if="step.current" class="ml-auto">
                  <button
                    class="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    继续学习
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部总结 -->
    <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-3xl font-bold text-blue-600">{{ completedSteps }}</div>
          <div class="text-sm text-gray-600 mt-1">已完成</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-purple-600">{{ totalSteps }}</div>
          <div class="text-sm text-gray-600 mt-1">总步骤</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-green-600">{{ totalQuestionsCompleted }}</div>
          <div class="text-sm text-gray-600 mt-1">已做题目</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-orange-600">{{ totalTimeSpent }}</div>
          <div class="text-sm text-gray-600 mt-1">学习时长(h)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StudyStep {
  title: string
  description: string
  completed: boolean
  current: boolean
  progress: number
  questionsCompleted: number
  totalQuestions: number
  timeSpent: number
}

interface Props {
  steps: StudyStep[]
}

const props = defineProps<Props>()

const totalSteps = computed(() => props.steps.length)
const completedSteps = computed(() => props.steps.filter(s => s.completed).length)
const totalProgress = computed(() => {
  const total = props.steps.reduce((sum, step) => sum + step.progress, 0)
  return Math.round(total / props.steps.length)
})
const totalQuestionsCompleted = computed(() =>
  props.steps.reduce((sum, step) => sum + step.questionsCompleted, 0)
)
const totalTimeSpent = computed(() =>
  props.steps.reduce((sum, step) => sum + step.timeSpent, 0)
)
</script>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
