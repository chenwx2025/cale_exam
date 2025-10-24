<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="close">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">邀请成员</h2>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Search Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索用户</label>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="输入邮箱、姓名或昵称..."
            @input="debouncedSearch"
          />
        </div>

        <!-- Search Results -->
        <div v-if="searching" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
          <p class="mt-2 text-sm text-gray-600">搜索中...</p>
        </div>

        <div v-else-if="searchQuery && searchResults.length === 0" class="text-center py-4">
          <p class="text-gray-500">未找到用户</p>
        </div>

        <div v-else-if="searchResults.length > 0" class="mb-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
            @click="selectUser(user)"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {{ user.name?.charAt(0) || user.email.charAt(0) }}
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ user.name || user.email }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>

        <!-- Selected User -->
        <div v-if="selectedUser" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {{ selectedUser.name?.charAt(0) || selectedUser.email.charAt(0) }}
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ selectedUser.name || selectedUser.email }}</div>
                <div class="text-sm text-gray-600">{{ selectedUser.email }}</div>
              </div>
            </div>
            <button
              @click="selectedUser = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Invitation Message -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">邀请消息 (可选)</label>
            <textarea
              v-model="invitationMessage"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="添加一条个性化的邀请消息..."
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            type="button"
            @click="close"
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="sendInvitation"
            :disabled="!selectedUser || isInviting"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ isInviting ? '发送中...' : '发送邀请' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  groupId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'invited'])

const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const selectedUser = ref(null)
const invitationMessage = ref('')
const isInviting = ref(false)

let searchTimeout = null

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// Debounced search
function debouncedSearch() {
  clearTimeout(searchTimeout)
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(() => {
    searchUsers()
  }, 300)
}

// Search users
async function searchUsers() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searching.value = true
  try {
    const { data, error } = await useFetch('/api/users/search', {
      params: { q: searchQuery.value }
    })

    if (error.value) {
      console.error('搜索用户失败:', error.value)
      searchResults.value = []
    } else if (data.value) {
      searchResults.value = data.value.data || []
    }
  } catch (err) {
    console.error('搜索用户异常:', err)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// Select user
function selectUser(user) {
  selectedUser.value = user
  searchQuery.value = ''
  searchResults.value = []
}

// Send invitation
async function sendInvitation() {
  if (!selectedUser.value || isInviting.value) return

  isInviting.value = true
  try {
    const { data, error } = await useFetch(`/api/study-groups/${props.groupId}/members/invite`, {
      method: 'POST',
      body: {
        inviteeId: selectedUser.value.id,
        message: invitationMessage.value || undefined
      }
    })

    if (error.value) {
      console.error('发送邀请失败:', error.value)
      const errorMsg = error.value.data?.message || error.value.message || '发送邀请失败'
      alert(errorMsg)
    } else {
      emit('invited', data.value.data)
      close()
    }
  } catch (err) {
    console.error('发送邀请异常:', err)
    alert('发送邀请失败')
  } finally {
    isInviting.value = false
  }
}

// Reset form
function resetForm() {
  searchQuery.value = ''
  searchResults.value = []
  selectedUser.value = null
  invitationMessage.value = ''
}

// Close modal
function close() {
  emit('close')
}
</script>
