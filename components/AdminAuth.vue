<template>
  <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
    <div class="w-full max-w-md">
      <!-- Logo/Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">管理后台</h1>
        <p class="text-gray-600">请输入密码以继续访问</p>
      </div>

      <!-- Auth Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              访问密码
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                :class="{ 'border-red-500 focus:ring-red-500': error }"
                placeholder="输入访问密码"
                @input="error = false"
              />
              <!-- Toggle Password Visibility -->
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabindex="-1"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <!-- Error Message -->
            <transition name="shake">
              <p v-if="error" class="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ errorMessage }}
              </p>
            </transition>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!password || loading"
            class="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? '验证中...' : '访问管理后台' }}</span>
          </button>
        </form>

        <!-- Info -->
        <div class="mt-6 pt-6 border-t border-gray-100">
          <p class="text-xs text-center text-gray-500">
            密码存储在环境变量中，请联系系统管理员获取访问权限
          </p>
        </div>
      </div>

      <!-- Back to Home -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')

// 检查localStorage中的认证状态
const checkAuth = () => {
  if (process.client) {
    const auth = localStorage.getItem('admin_auth')
    if (auth) {
      try {
        const data = JSON.parse(auth)
        if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return true
        }
      } catch (e) {
        localStorage.removeItem('admin_auth')
      }
    }
  }
  return false
}

// 立即检查认证状态，避免闪烁
const isAuthenticated = ref(checkAuth())

// 在客户端挂载时再次检查
onMounted(() => {
  isAuthenticated.value = checkAuth()
})

const handleSubmit = async () => {
  if (!password.value) return

  loading.value = true
  error.value = false

  try {
    // 验证密码
    const response = await $fetch('/api/admin/auth', {
      method: 'POST',
      body: { password: password.value }
    })

    if (response.success) {
      // 保存认证状态到 localStorage（24小时有效）
      localStorage.setItem('admin_auth', JSON.stringify({
        timestamp: Date.now(),
        authenticated: true
      }))

      isAuthenticated.value = true
      password.value = ''
    }
  } catch (e: any) {
    error.value = true
    errorMessage.value = e.data?.message || '密码错误，请重试'
    password.value = ''

    // 输入框抖动效果
    const input = document.getElementById('password')
    if (input) {
      input.classList.add('shake')
      setTimeout(() => input.classList.remove('shake'), 500)
    }
  } finally {
    loading.value = false
  }
}

// 提供给父组件的认证状态
defineExpose({
  isAuthenticated
})
</script>

<style scoped>
/* 错误信息动画 */
.shake-enter-active {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* 输入框抖动 */
.shake {
  animation: shake 0.5s;
}

/* 渐变动画 */
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
