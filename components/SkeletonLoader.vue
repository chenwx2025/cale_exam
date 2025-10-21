<template>
  <div class="animate-pulse">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="bg-white rounded-2xl shadow-lg p-6">
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div class="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>

    <!-- Stats Grid Skeleton -->
    <div v-else-if="type === 'stats-grid'" class="space-y-4">
      <div v-for="i in count" :key="i" class="p-4 bg-gray-50 rounded-xl">
        <div class="flex items-center justify-between mb-2">
          <div class="h-3 bg-gray-200 rounded w-20"></div>
          <div class="h-6 bg-gray-200 rounded w-12"></div>
        </div>
        <div class="h-2 bg-gray-200 rounded w-16"></div>
      </div>
    </div>

    <!-- List Skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div v-for="i in count" :key="i" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <div class="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-3/4"></div>
          <div class="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Table Skeleton -->
    <div v-else-if="type === 'table'" class="space-y-2">
      <div v-for="i in count" :key="i" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/5"></div>
        <div class="h-4 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>

    <!-- Dashboard Skeleton -->
    <div v-else-if="type === 'dashboard'" class="space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Primary Actions -->
          <div class="grid md:grid-cols-2 gap-6">
            <div v-for="i in 2" :key="i" class="bg-white rounded-2xl p-8 shadow-lg">
              <div class="flex items-start justify-between mb-4">
                <div class="w-14 h-14 bg-gray-200 rounded-xl"></div>
                <div class="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <div class="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div class="grid md:grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <div v-for="i in 2" :key="i" class="bg-white rounded-2xl shadow-lg p-6">
            <div class="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div class="space-y-4">
              <div v-for="j in 4" :key="j" class="p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center justify-between mb-1">
                  <div class="h-3 bg-gray-200 rounded w-20"></div>
                  <div class="h-6 bg-gray-200 rounded w-12"></div>
                </div>
                <div class="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Default: Simple Loading -->
    <div v-else class="flex items-center justify-center py-12">
      <div class="space-y-4 w-full max-w-md">
        <div class="h-4 bg-gray-200 rounded w-full"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        <div class="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'stats-grid' | 'list' | 'table' | 'dashboard' | 'default'
  count?: number
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  count: 5
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
