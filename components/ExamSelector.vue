<template>
  <div class="exam-selector">
    <div class="flex items-center gap-3">
      <span class="text-sm font-semibold text-gray-600">选择考试：</span>
      <div class="flex gap-2">
        <button
          v-for="exam in exams"
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

    <!-- 考试描述 -->
    <div v-if="showDescription" class="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
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

const examStore = useExamStore()
const exams = Object.values(examTypes)

// 初始化考试类型
onMounted(() => {
  examStore.initExamType()
})

const selectExam = (examType: ExamType) => {
  examStore.setExamType(examType)
  // 可以在这里添加页面刷新逻辑，重新加载对应考试的数据
}
</script>

<style scoped>
.exam-selector {
  @apply mb-6;
}
</style>
