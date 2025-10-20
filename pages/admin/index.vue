<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">管理员仪表盘</h1>
      <p class="text-gray-600 mt-2">系统概览和关键指标</p>
    </div>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    <div v-else-if="stats" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-4xl font-bold">{{ stats.users.total }}</div>
          <div class="text-sm text-blue-100 mt-2">总用户数</div>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-4xl font-bold">{{ stats.questions.total }}</div>
          <div class="text-sm text-purple-100 mt-2">总题目数</div>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-4xl font-bold">{{ stats.exams.total }}</div>
          <div class="text-sm text-green-100 mt-2">总考试数</div>
        </div>
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div class="text-4xl font-bold">{{ stats.subscriptions.total }}</div>
          <div class="text-sm text-orange-100 mt-2">活跃订阅</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref<any>(null)

const loadStats = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/stats', {
      headers: authStore.getAuthHeader()
    })
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Failed to load admin stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
