<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <div class="inline-block w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
          <span class="text-3xl">🔑</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">重置密码</h1>
        <p class="mt-2 text-gray-600">请输入您的新密码</p>
      </div>

      <!-- 表单卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- 成功消息 -->
        <div v-if="success" class="mb-6 rounded-lg bg-green-50 p-4">
          <div class="flex items-start gap-3">
            <span class="text-2xl">✅</span>
            <div>
              <h3 class="font-semibold text-green-900">密码重置成功</h3>
              <p class="mt-1 text-sm text-green-700">
                您的密码已成功重置。现在可以使用新密码登录了。
              </p>
            </div>
          </div>
          <NuxtLink
            to="/login"
            class="mt-4 block w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-green-700 transition-colors"
          >
            前往登录
          </NuxtLink>
        </div>

        <!-- Token 无效提示 -->
        <div v-else-if="invalidToken" class="mb-6 rounded-lg bg-red-50 p-4">
          <div class="flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <h3 class="font-semibold text-red-900">链接无效或已过期</h3>
              <p class="mt-1 text-sm text-red-700">
                该重置链接已失效。请重新申请密码重置。
              </p>
            </div>
          </div>
          <NuxtLink
            to="/forgot-password"
            class="mt-4 block w-full bg-red-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-red-700 transition-colors"
          >
            重新申请
          </NuxtLink>
        </div>

        <!-- 表单 -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 新密码 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              新密码
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                placeholder="请输入新密码（至少6位）"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <!-- 确认密码 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                minlength="6"
                placeholder="请再次输入新密码"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <!-- 密码强度提示 -->
          <div v-if="password" class="rounded-lg bg-blue-50 p-3">
            <p class="text-xs text-blue-900 mb-2 font-semibold">密码要求：</p>
            <ul class="space-y-1 text-xs text-blue-700">
              <li :class="password.length >= 6 ? 'text-green-600' : ''">
                {{ password.length >= 6 ? '✅' : '⭕' }} 至少6个字符
              </li>
              <li :class="password === confirmPassword && confirmPassword ? 'text-green-600' : ''">
                {{ password === confirmPassword && confirmPassword ? '✅' : '⭕' }} 两次输入一致
              </li>
            </ul>
          </div>

          <!-- 错误消息 -->
          <div v-if="error" class="rounded-lg bg-red-50 p-4">
            <div class="flex items-center gap-2">
              <span class="text-red-600">⚠️</span>
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '重置中...' : '重置密码' }}
          </button>
        </form>

        <!-- 返回登录 -->
        <div v-if="!success && !invalidToken" class="mt-6 text-center">
          <NuxtLink
            to="/login"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 返回登录
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest'
})

const route = useRoute()
const router = useRouter()

const token = ref(route.query.token as string || '')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)
const invalidToken = ref(false)

// 检查token是否存在
onMounted(() => {
  if (!token.value) {
    invalidToken.value = true
  }
})

const canSubmit = computed(() => {
  return password.value.length >= 6 &&
         password.value === confirmPassword.value &&
         token.value
})

const handleSubmit = async () => {
  if (!canSubmit.value) return

  // 前端验证
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (password.value.length < 6) {
    error.value = '密码至少需要6个字符'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value
      }
    })

    success.value = true

    // 3秒后自动跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    console.error('Reset password error:', err)

    if (err.status === 400 || err.statusCode === 400) {
      invalidToken.value = true
    } else {
      error.value = err.data?.message || '密码重置失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}
</script>
