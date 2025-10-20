<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-4 shadow-xl">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">创建新账号</h1>
        <p class="text-gray-600">开始您的学习之旅</p>
      </div>

      <!-- Register Form -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form @submit.prevent="handleRegister">
          <!-- Name -->
          <div class="mb-6">
            <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
              姓名
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              placeholder="张三"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              :disabled="loading"
            />
          </div>

          <!-- Email -->
          <div class="mb-6">
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              密码
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="至少8位，包含大小写字母和数字"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              :disabled="loading"
            />
            <p class="mt-1 text-xs text-gray-500">至少8位，包含大小写字母和数字</p>
          </div>

          <!-- Confirm Password -->
          <div class="mb-6">
            <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">
              确认密码
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              placeholder="再次输入密码"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              :disabled="loading"
            />
          </div>

          <!-- Exam Type Selection -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              选择考试类型（可多选）
            </label>
            <div class="space-y-3">
              <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 cursor-pointer transition-all duration-200">
                <input
                  v-model="selectedExams"
                  type="checkbox"
                  value="cale"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">CALE - 加州针灸执照考试</div>
                  <div class="text-xs text-gray-500">California Acupuncture Licensing Exam</div>
                </div>
              </label>
              <label class="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 cursor-pointer transition-all duration-200">
                <input
                  v-model="selectedExams"
                  type="checkbox"
                  value="nccaom"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">NCCAOM - 全国中医认证考试</div>
                  <div class="text-xs text-gray-500">National Certification Commission for Acupuncture and Oriental Medicine</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="loading || selectedExams.length === 0"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? '注册中...' : '注 册' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-gray-500">或</span>
          </div>
        </div>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-gray-600">
            已有账号？
            <NuxtLink to="/login" class="text-blue-600 hover:text-blue-700 font-bold">
              立即登录
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedExams = ref<string[]>(['cale']) // 默认选中 CALE
const loading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''

  // 验证密码匹配
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  // 验证至少选择一个考试类型
  if (selectedExams.value.length === 0) {
    errorMessage.value = '请至少选择一个考试类型'
    return
  }

  loading.value = true

  const result = await authStore.register(
    email.value,
    password.value,
    name.value,
    selectedExams.value
  )

  if (result.success) {
    // 注册成功，跳转到首页
    router.push('/')
  } else {
    errorMessage.value = result.message || '注册失败，请重试'
  }

  loading.value = false
}

// 如果已登录，直接跳转到首页
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>
