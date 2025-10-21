<template>
  <div class="exam-tab-switcher">
    <!-- 考试类型切换器 - 类似微信的Tab设计 -->
    <div class="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2">
      <button
        @click="handleExamClick('cale')"
        class="tab-button"
        :class="{
          'active': examStore.currentExamType === 'cale',
          'disabled': !hasExamAccess('cale')
        }"
        :title="!hasExamAccess('cale') ? '点击前往订阅' : ''"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="examStore.currentExamType === 'cale'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-600'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="text-left">
            <div class="font-bold text-sm">CALE</div>
            <div class="text-xs opacity-75">加州执照</div>
          </div>
        </div>
      </button>

      <button
        @click="handleExamClick('nccaom')"
        class="tab-button"
        :class="{
          'active': examStore.currentExamType === 'nccaom',
          'disabled': !hasExamAccess('nccaom')
        }"
        :title="!hasExamAccess('nccaom') ? '点击前往订阅' : ''"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="examStore.currentExamType === 'nccaom'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-600'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <div class="text-left">
            <div class="font-bold text-sm">NCCAOM</div>
            <div class="text-xs opacity-75">全国认证</div>
          </div>
        </div>
      </button>
    </div>

    <!-- 切换成功提示 -->
    <Transition name="slide-fade">
      <div v-if="showSwitchTip" class="switch-tip">
        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span>已切换到 {{ examStore.currentExam.name }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ExamType } from '~/stores/exam'

const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()

const showSwitchTip = ref(false)

const hasExamAccess = (examType: ExamType): boolean => {
  return authStore.user?.subscribedExams?.includes(examType) || false
}

const handleExamClick = (examType: ExamType) => {
  const access = hasExamAccess(examType)

  if (!access) {
    router.push('/user/profile')
    return
  }

  // User has access, proceed with exam switch
  switchExam(examType)
}

const switchExam = (examType: ExamType) => {
  if (examStore.currentExamType === examType) {
    return
  }

  examStore.setExamType(examType)

  // 显示切换提示
  showSwitchTip.value = true
  setTimeout(() => {
    showSwitchTip.value = false
  }, 2000)

  // 刷新当前页面数据
  setTimeout(() => {
    router.go(0)
  }, 300)
}

const goToSubscribe = () => {
  router.push('/user/profile')
}
</script>

<style scoped>
.exam-tab-switcher {
  position: relative;
}

.tab-button {
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.tab-button:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
}

.tab-button.active {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.tab-button.active:has(.bg-purple-600) {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-color: #9333ea;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
}

.tab-button.disabled {
  opacity: 0.5;
  cursor: pointer;
}

.tab-button.disabled:hover {
  background: #fef3c7;
  transform: translateY(0);
}

.switch-tip {
  position: fixed;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  font-weight: 600;
  color: #1f2937;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translate(-50%, -20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}
</style>
