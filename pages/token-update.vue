<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">🔑 Token 更新工具</h1>

      <!-- Current Token Info -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">当前 Token 状态</h2>
        <div class="bg-gray-100 rounded-lg p-4 mb-4">
          <p class="text-sm text-gray-600 mb-2">当前 Token (前30字符):</p>
          <p class="font-mono text-sm break-all">{{ currentTokenPreview }}</p>
        </div>
        <div :class="['p-4 rounded-lg', isTokenValid ? 'bg-green-100' : 'bg-red-100']">
          <p :class="['font-semibold', isTokenValid ? 'text-green-800' : 'text-red-800']">
            {{ tokenStatus }}
          </p>
        </div>
      </div>

      <!-- New Token Input -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">更新 Token</h2>
        <p class="text-gray-600 mb-4">粘贴新的 Token:</p>
        <textarea
          v-model="newToken"
          class="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        ></textarea>

        <button
          @click="updateToken"
          :disabled="!newToken || isUpdating"
          class="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isUpdating ? '更新中...' : '✅ 更新 Token 并刷新' }}
        </button>
      </div>

      <!-- Quick Update Button -->
      <div class="mb-8 border-t pt-6">
        <h2 class="text-xl font-semibold mb-4">快速更新（使用最新生成的 Token）</h2>
        <p class="text-gray-600 mb-4">点击下面的按钮直接使用刚才生成的 Token:</p>
        <button
          @click="quickUpdate"
          :disabled="isUpdating"
          class="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🚀 一键更新（30天有效期）
        </button>
      </div>

      <!-- Test Check-in Button -->
      <div v-if="isTokenValid" class="border-t pt-6">
        <h2 class="text-xl font-semibold mb-4">测试打卡功能</h2>
        <button
          @click="testCheckIn"
          :disabled="isTesting"
          class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isTesting ? '测试中...' : '🔥 测试打卡 API' }}
        </button>
        <div v-if="testResult" class="mt-4 p-4 rounded-lg" :class="testResult.success ? 'bg-green-100' : 'bg-red-100'">
          <p class="font-semibold" :class="testResult.success ? 'text-green-800' : 'text-red-800'">
            {{ testResult.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()

// State
const newToken = ref('')
const isUpdating = ref(false)
const isTesting = ref(false)
const testResult = ref(null)

// Latest generated token
const LATEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWd6aTVoZHgwMm50cGowYThzN2xhc2hsIiwiZW1haWwiOiJjaGVud3gyMDExQHlhaG9vLmNvbSIsInJvbGUiOiJ1c2VyIiwic3Vic2NyaWJlZEV4YW1zIjpbImNhbGUiLCJuY2Nhb20iXSwiaWF0IjoxNzYxMzQwNzk3LCJleHAiOjE3NjM5MzI3OTd9.g46A7r4j0jePID7MhbRMKN3kKgs_uyMmLqFaQlyZ-w4'

// Computed
const currentTokenPreview = computed(() => {
  const token = authStore.accessToken
  if (!token) return '(未登录)'
  return token.substring(0, 30) + '...'
})

const isTokenValid = computed(() => {
  return !!authStore.accessToken && authStore.user
})

const tokenStatus = computed(() => {
  if (!authStore.accessToken) {
    return '❌ 未登录 - 没有 Token'
  }
  if (!authStore.user) {
    return '⚠️ Token 可能无效或已过期'
  }
  return '✅ Token 有效'
})

// Methods
async function updateToken() {
  if (!newToken.value) return

  isUpdating.value = true
  try {
    // Update localStorage
    localStorage.setItem('accessToken', newToken.value.trim())

    // Reinitialize auth store
    await authStore.init()

    alert('✅ Token 更新成功！页面即将刷新...')

    // Refresh page
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('更新 Token 失败:', error)
    alert('❌ 更新失败: ' + error.message)
  } finally {
    isUpdating.value = false
  }
}

async function quickUpdate() {
  isUpdating.value = true
  try {
    // Update localStorage
    localStorage.setItem('accessToken', LATEST_TOKEN)

    // Reinitialize auth store
    await authStore.init()

    alert('✅ Token 更新成功！页面即将刷新...')

    // Refresh page
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('更新 Token 失败:', error)
    alert('❌ 更新失败: ' + error.message)
  } finally {
    isUpdating.value = false
  }
}

async function testCheckIn() {
  isTesting.value = true
  testResult.value = null

  try {
    const response = await $fetch('/api/study-groups/cmh3qbzkk0002rtevyi7jw8d4/check-in', {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    testResult.value = {
      success: true,
      message: '✅ 打卡成功！API 正常工作'
    }
  } catch (error) {
    console.error('打卡测试失败:', error)
    testResult.value = {
      success: false,
      message: '❌ 打卡失败: ' + (error.data?.message || error.message || '未知错误')
    }
  } finally {
    isTesting.value = false
  }
}

// Initialize
onMounted(async () => {
  await authStore.init()
})
</script>
