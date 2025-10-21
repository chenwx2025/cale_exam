<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- 模态框内容 -->
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 transform transition-all">
          <!-- 关闭按钮 -->
          <button
            @click="close"
            class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- 标题 -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">切换考试类型</h2>
            <p class="text-gray-600">选择您要学习的考试</p>
          </div>

          <!-- 考试选项 -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- CALE 考试 -->
            <button
              v-if="hasExamAccess('cale')"
              @click="selectExam('cale')"
              class="exam-card"
              :class="{ 'exam-card-active': examStore.currentExamType === 'cale' }"
            >
              <div class="exam-card-header bg-gradient-to-br from-blue-500 to-blue-700">
                <div class="flex items-center justify-between">
                  <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <span v-if="examStore.currentExamType === 'cale'" class="px-3 py-1 bg-green-500 rounded-full text-xs font-bold text-white">
                    ✓ 当前
                  </span>
                  <span v-else class="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                    已订阅
                  </span>
                </div>
                <h3 class="text-2xl font-bold text-white mt-4 mb-1">CALE</h3>
                <p class="text-blue-100 text-sm">加州中医执照考试</p>
              </div>

              <div class="p-6">
                <p class="text-gray-600 text-sm">
                  California Acupuncture Licensing Examination - 专注于加州针灸执照考试备考
                </p>
              </div>
            </button>

            <!-- NCCAOM 考试 -->
            <button
              v-if="hasExamAccess('nccaom')"
              @click="selectExam('nccaom')"
              class="exam-card"
              :class="{ 'exam-card-active': examStore.currentExamType === 'nccaom' }"
            >
              <div class="exam-card-header bg-gradient-to-br from-purple-500 to-purple-700">
                <div class="flex items-center justify-between">
                  <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                    </svg>
                  </div>
                  <span v-if="examStore.currentExamType === 'nccaom'" class="px-3 py-1 bg-green-500 rounded-full text-xs font-bold text-white">
                    ✓ 当前
                  </span>
                  <span v-else class="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                    已订阅
                  </span>
                </div>
                <h3 class="text-2xl font-bold text-white mt-4 mb-1">NCCAOM</h3>
                <p class="text-purple-100 text-sm">全国中医针灸认证考试</p>
              </div>

              <div class="p-6">
                <p class="text-gray-600 text-sm">
                  National Certification Commission - 美国国家中医针灸认证委员会考试
                </p>
              </div>
            </button>
          </div>

          <!-- 底部提示 -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              需要订阅新的考试？
              <NuxtLink to="/select-exam" class="text-blue-600 hover:underline font-semibold" @click="close">
                前往订阅管理
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ExamType } from '~/stores/exam'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasExamAccess = (examType: ExamType): boolean => {
  return authStore.user?.subscribedExams?.includes(examType) || false
}

const selectExam = async (examType: ExamType) => {
  // 检查是否有权限
  if (!hasExamAccess(examType)) {
    close()
    router.push('/select-exam')
    return
  }

  // 如果已经是当前考试，直接关闭
  if (examStore.currentExamType === examType) {
    close()
    return
  }

  // 切换考试
  examStore.setExamType(examType)
  close()

  // 触发页面数据重新加载，而不是刷新整个页面
  // 使用 Nuxt 的 reloadNuxtApp 或导航到当前页面
  await nextTick()

  // 如果在 dashboard 页面，导航到 dashboard 触发数据重新加载
  // 如果在其他页面，也导航到 dashboard
  if (router.currentRoute.value.path === '/dashboard') {
    // 触发组件重新加载
    router.replace({ path: '/dashboard', query: { _reload: Date.now().toString() } })
  } else {
    // 导航到 dashboard
    router.push('/dashboard')
  }
}

const close = () => {
  show.value = false
}

// ESC键关闭
if (import.meta.client) {
  watch(show, (newValue) => {
    if (newValue) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          close()
        }
      }
      document.addEventListener('keydown', handleEsc)

      // 清理
      const cleanup = () => {
        document.removeEventListener('keydown', handleEsc)
      }

      // 当模态框关闭时清理事件监听
      watch(show, (val) => {
        if (!val) cleanup()
      })
    }
  })
}
</script>

<style scoped>
.exam-card {
  @apply relative overflow-hidden rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 text-left hover:shadow-xl transform hover:-translate-y-1;
}

.exam-card-active {
  @apply border-blue-500 ring-4 ring-blue-100;
}

.exam-card-disabled {
  @apply opacity-60 hover:border-yellow-400;
}

.exam-card-header {
  @apply p-6 text-white;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
