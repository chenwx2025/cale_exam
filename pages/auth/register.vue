<template>
  <div class="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">创建账号</h2>
          <p class="text-gray-600">开始您的CALE备考之旅</p>
        </div>

        <!-- Register Form -->
        <form @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的姓名"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                minlength="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="至少6个字符"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <input
                v-model="form.confirmPassword"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="再次输入密码"
              />
            </div>

            <div class="flex items-start">
              <input
                v-model="form.agree"
                type="checkbox"
                required
                class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-600">
                我同意
                <a href="#" class="text-blue-600 hover:text-blue-700">服务条款</a>
                和
                <a href="#" class="text-blue-600 hover:text-blue-700">隐私政策</a>
              </span>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            已有账号？
            <NuxtLink to="/auth/login" class="text-blue-600 hover:text-blue-700 font-semibold">
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
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const loading = ref(false)

const handleRegister = async () => {
  // Validate passwords match
  if (form.value.password !== form.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  loading.value = true

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password
      }
    })

    if (response.success) {
      alert('注册成功！请登录')
      router.push('/auth/login')
    } else {
      alert(response.error || '注册失败')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    alert('注册失败: ' + (error.data?.error || error.message))
  } finally {
    loading.value = false
  }
}
</script>
