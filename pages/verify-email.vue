<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-block w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
          <span class="text-3xl">📧</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">邮箱验证</h1>
      </div>

      <!-- 验证中 -->
      <div v-if="verifying" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p class="text-gray-600">正在验证您的邮箱...</p>
      </div>

      <!-- 验证成功 -->
      <div v-else-if="success" class="bg-white rounded-2xl shadow-xl p-8">
        <div class="rounded-lg bg-green-50 p-6 mb-6">
          <div class="flex flex-col items-center text-center gap-3">
            <span class="text-5xl">✅</span>
            <div>
              <h3 class="text-xl font-semibold text-green-900">验证成功</h3>
              <p class="mt-2 text-sm text-green-700">
                您的邮箱已成功验证，现在可以使用所有功能了！
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <NuxtLink
            to="/login"
            class="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            前往登录
          </NuxtLink>
          <NuxtLink
            to="/"
            class="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
          >
            返回首页
          </NuxtLink>
        </div>
      </div>

      <!-- 验证失败 -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl p-8">
        <div class="rounded-lg bg-red-50 p-6 mb-6">
          <div class="flex flex-col items-center text-center gap-3">
            <span class="text-5xl">⚠️</span>
            <div>
              <h3 class="text-xl font-semibold text-red-900">验证失败</h3>
              <p class="mt-2 text-sm text-red-700">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="resendVerification"
            :disabled="resending"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ resending ? '发送中...' : '重新发送验证邮件' }}
          </button>
          <NuxtLink
            to="/login"
            class="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
          >
            返回登录
          </NuxtLink>
        </div>

        <!-- 重发成功提示 -->
        <div v-if="resendSuccess" class="mt-4 rounded-lg bg-green-50 p-4">
          <p class="text-sm text-green-700 text-center">
            ✅ 验证邮件已重新发送，请查收
          </p>
          <!-- 开发环境显示验证链接 -->
          <div v-if="verifyUrl" class="mt-3 rounded bg-green-100 p-3">
            <p class="text-xs font-semibold text-green-900 mb-1">开发环境 - 验证链接：</p>
            <a :href="verifyUrl" class="text-xs text-green-700 break-all underline hover:text-green-900">
              {{ verifyUrl }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()

const token = ref(route.query.token as string || '')
const verifying = ref(true)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')
const resending = ref(false)
const resendSuccess = ref(false)
const verifyUrl = ref('')

// 验证邮箱
const verifyEmail = async () => {
  if (!token.value) {
    error.value = true
    errorMessage.value = '缺少验证token'
    verifying.value = false
    return
  }

  try {
    await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token: token.value }
    })

    success.value = true

    // 3秒后自动跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    console.error('Email verification error:', err)
    error.value = true
    errorMessage.value = err.data?.message || '验证链接无效或已过期'
  } finally {
    verifying.value = false
  }
}

// 重新发送验证邮件
const resendVerification = async () => {
  // 这里需要用户输入邮箱，简化版本暂时提示用户去注册页
  resending.value = true
  resendSuccess.value = false
  verifyUrl.value = ''

  try {
    // 提示用户输入邮箱
    const email = prompt('请输入您的注册邮箱：')
    if (!email) {
      resending.value = false
      return
    }

    const response = await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { email }
    })

    resendSuccess.value = true

    // 开发环境显示验证链接
    if (response.verifyUrl) {
      verifyUrl.value = response.verifyUrl
    }
  } catch (err: any) {
    console.error('Resend verification error:', err)
    alert(err.data?.message || '发送失败，请稍后重试')
  } finally {
    resending.value = false
  }
}

// 页面加载时自动验证
onMounted(() => {
  verifyEmail()
})
</script>
