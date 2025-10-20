<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h2>
          <p class="text-gray-600">登录 CALE 考试系统</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input
                  v-model="form.remember"
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span class="ml-2 text-sm text-gray-600">记住我</span>
              </label>
              <a href="#" class="text-sm text-purple-600 hover:text-purple-700">
                忘记密码？
              </a>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- Demo Account Info -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-800 font-medium mb-2">演示账号：</p>
          <p class="text-sm text-blue-700">邮箱：demo@cale.com</p>
          <p class="text-sm text-blue-700">密码：demo123</p>
        </div>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            还没有账号？
            <NuxtLink to="/auth/register" class="text-purple-600 hover:text-purple-700 font-semibold">
              立即注册
            </NuxtLink>
          </p>
        </div>

        <!-- Or continue without login -->
        <div class="mt-4 text-center">
          <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-700">
            暂不登录，继续浏览
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password
      }
    })

    if (response.success) {
      // Save user info to localStorage
      localStorage.setItem('cale_user', JSON.stringify(response.user))
      localStorage.setItem('cale_token', response.token)

      // Redirect to home page
      router.push('/')
    } else {
      alert(response.error || '登录失败')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    alert('登录失败: ' + (error.data?.error || error.message))
  } finally {
    loading.value = false
  }
}
</script>
