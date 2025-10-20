<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <div class="inline-block w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
          <span class="text-3xl">🔐</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">忘记密码</h1>
        <p class="mt-2 text-gray-600">输入您的邮箱地址，我们将发送重置密码的链接</p>
      </div>

      <!-- 表单卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- 成功消息 -->
        <div v-if="emailSent" class="mb-6 rounded-lg bg-green-50 p-4">
          <div class="flex items-start gap-3">
            <span class="text-2xl">✅</span>
            <div>
              <h3 class="font-semibold text-green-900">邮件已发送</h3>
              <p class="mt-1 text-sm text-green-700">
                如果该邮箱已注册，您将在几分钟内收到密码重置邮件。请检查您的收件箱（包括垃圾邮件文件夹）。
              </p>
              <!-- 开发环境显示重置链接 -->
              <div v-if="resetUrl" class="mt-3 rounded bg-green-100 p-3">
                <p class="text-xs font-semibold text-green-900 mb-1">开发环境 - 重置链接：</p>
                <a :href="resetUrl" class="text-xs text-green-700 break-all underline hover:text-green-900">
                  {{ resetUrl }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 表单 -->
        <form v-if="!emailSent" @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 邮箱输入 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :disabled="loading"
            />
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
            :disabled="loading || !email"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '发送中...' : '发送重置链接' }}
          </button>
        </form>

        <!-- 返回登录 -->
        <div class="mt-6 text-center">
          <NuxtLink
            to="/login"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 返回登录
          </NuxtLink>
        </div>

        <!-- 重新发送 -->
        <div v-if="emailSent" class="mt-4 text-center">
          <button
            @click="resetForm"
            class="text-sm text-gray-600 hover:text-gray-700"
          >
            没有收到邮件？重新发送
          </button>
        </div>
      </div>

      <!-- 帮助提示 -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          需要帮助？
          <a href="mailto:support@cale.com" class="text-blue-600 hover:text-blue-700 font-medium">
            联系客服
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest'
})

const email = ref('')
const loading = ref(false)
const error = ref('')
const emailSent = ref(false)
const resetUrl = ref('')

const handleSubmit = async () => {
  if (!email.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })

    emailSent.value = true

    // 开发环境显示重置链接
    if (response.resetUrl) {
      resetUrl.value = response.resetUrl
    }
  } catch (err: any) {
    console.error('Forgot password error:', err)
    error.value = err.data?.message || '发送失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  emailSent.value = false
  resetUrl.value = ''
  error.value = ''
  email.value = ''
}
</script>
