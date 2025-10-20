<template>
  <div class="exam-selector">
    <div v-if="availableExams.length > 0" class="flex items-center gap-3">
      <span class="text-sm font-semibold text-gray-600">当前考试：</span>
      <div class="flex gap-2">
        <button
          v-for="exam in availableExams"
          :key="exam.type"
          @click="selectExam(exam.type)"
          class="px-4 py-2 rounded-lg font-semibold transition-all"
          :class="examStore.currentExamType === exam.type
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          <div class="flex items-center gap-2">
            <span>{{ exam.name }}</span>
            <svg
              v-if="examStore.currentExamType === exam.type"
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- No subscriptions warning -->
    <div v-else-if="authStore.isAuthenticated" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-yellow-900 mb-1">您还没有订阅任何考试</p>
          <p class="text-sm text-yellow-700 mb-2">请前往个人中心订阅 CALE 或 NCCAOM 考试后再使用此功能</p>
          <NuxtLink
            to="/user/profile"
            class="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors"
          >
            前往个人中心
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 考试描述 -->
    <div v-if="showDescription && availableExams.length > 0" class="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
      <div class="font-semibold text-blue-900 mb-1">
        {{ examStore.currentExam.fullName }}
      </div>
      <div class="text-blue-700">
        {{ examStore.currentExam.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { examTypes, type ExamType } from '~/stores/exam'

const props = defineProps<{
  showDescription?: boolean
}>()

const authStore = useAuthStore()
const examStore = useExamStore()

// Filter exams based on user subscriptions
const availableExams = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user?.subscribedExams) {
    // If not authenticated, show all exams
    return Object.values(examTypes)
  }

  // Only show subscribed exams
  return Object.values(examTypes).filter(exam =>
    authStore.user.subscribedExams.includes(exam.type)
  )
})

// 初始化考试类型
onMounted(() => {
  examStore.initExamType()

  // If current exam type is not in available exams, switch to first available
  if (authStore.isAuthenticated && availableExams.value.length > 0) {
    const currentTypeAvailable = availableExams.value.some(
      exam => exam.type === examStore.currentExamType
    )

    if (!currentTypeAvailable) {
      // Switch to first available exam
      examStore.setExamType(availableExams.value[0].type)
    }
  }
})

const selectExam = (examType: ExamType) => {
  examStore.setExamType(examType)
  // 刷新页面数据
  window.location.reload()
}
</script>

<style scoped>
.exam-selector {
  @apply mb-6;
}
</style>
