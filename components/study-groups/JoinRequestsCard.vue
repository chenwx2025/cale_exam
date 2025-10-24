<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">加入申请 ({{ requests.length }})</h3>
      <button
        v-if="requests.length > 0"
        @click="loadRequests"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="刷新"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="requests.length === 0" class="text-center py-8 text-gray-500">
      <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p class="text-sm">暂无待审批的加入申请</p>
    </div>

    <!-- Requests List -->
    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="request in requests"
        :key="request.id"
        class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {{ request.user?.name?.charAt(0) || request.user?.email?.charAt(0) }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-900 truncate">
            {{ request.user?.name || request.user?.email }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ formatTime(request.createdAt) }}
          </div>
          <div v-if="request.message" class="text-sm text-gray-600 mt-2 line-clamp-2">
            {{ request.message }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 flex-shrink-0">
          <button
            @click="approveRequest(request.id)"
            :disabled="processing"
            class="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
            title="批准"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </button>
          <button
            @click="rejectRequest(request.id)"
            :disabled="processing"
            class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="拒绝"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  groupId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['request-processed'])

const authStore = useAuthStore()
const requests = ref([])
const loading = ref(false)
const processing = ref(false)

// Load requests on mount
onMounted(async () => {
  await loadRequests()
})

// Load join requests
async function loadRequests() {
  loading.value = true
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/join-requests`, {
      headers: authStore.getAuthHeader()
    })

    if (response && response.data) {
      requests.value = response.data
    }
  } catch (error) {
    console.error('加载加入申请失败:', error)
  } finally {
    loading.value = false
  }
}

// Approve request
async function approveRequest(requestId) {
  if (!confirm('确定要批准这个加入申请吗？')) return

  processing.value = true
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/join-requests/${requestId}/approve`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    if (response && response.success) {
      alert('已批准加入申请')
      await loadRequests()
      emit('request-processed')
    }
  } catch (error) {
    console.error('批准申请失败:', error)
    alert('批准申请失败: ' + (error.data?.message || error.message))
  } finally {
    processing.value = false
  }
}

// Reject request
async function rejectRequest(requestId) {
  if (!confirm('确定要拒绝这个加入申请吗？')) return

  processing.value = true
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/join-requests/${requestId}/reject`, {
      method: 'POST',
      headers: authStore.getAuthHeader()
    })

    if (response && response.success) {
      alert('已拒绝加入申请')
      await loadRequests()
      emit('request-processed')
    }
  } catch (error) {
    console.error('拒绝申请失败:', error)
    alert('拒绝申请失败: ' + (error.data?.message || error.message))
  } finally {
    processing.value = false
  }
}

// Format time
function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// Expose methods
defineExpose({
  loadRequests
})
</script>
