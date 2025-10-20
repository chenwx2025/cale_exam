<script setup lang="ts">
// 练习模式直接使用exam页面，功能完全相同
const route = useRoute()
const router = useRouter()
const practiceId = route.params.id as string

// 重定向到exam页面
navigateTo(`/exam/${practiceId}`, { replace: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">正在进入练习...</p>
    </div>
  </div>
</template>
