<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">分享笔记到小组</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <!-- Note Info -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-1">将要分享的笔记：</p>
          <p class="font-semibold text-gray-900">{{ noteTitle }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p class="mt-2 text-gray-600">加载小组列表...</p>
        </div>

        <!-- Groups List -->
        <div v-else-if="myGroups.length > 0">
          <p class="text-sm text-gray-600 mb-4">选择要分享到的小组：</p>

          <div class="space-y-3">
            <div
              v-for="group in myGroups"
              :key="group.id"
              class="p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="selectedGroup?.id === group.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
              @click="selectedGroup = group"
            >
              <div class="flex items-center gap-3">
                <div v-if="group.avatarUrl" class="w-12 h-12 rounded-full overflow-hidden">
                  <img :src="group.avatarUrl" :alt="group.name" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {{ group.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ group.name }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ group.examType === 'cale' ? 'CALE' : 'NCCAOM' }} · {{ group.memberCount }} 成员
                  </p>
                </div>
                <div v-if="group.isShared" class="flex items-center gap-1 text-green-600 text-sm">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  已分享
                </div>
              </div>
            </div>
          </div>

          <!-- Share Message -->
          <div v-if="selectedGroup" class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              分享附言 (可选)
            </label>
            <textarea
              v-model="shareMessage"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="向小组成员说点什么吧..."
            ></textarea>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <div class="text-6xl mb-4">📚</div>
          <p class="text-gray-500 text-lg mb-4">您还没有加入任何小组</p>
          <button
            @click="goToGroups"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            去加入小组
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="myGroups.length > 0" class="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          取消
        </button>
        <button
          @click="handleShare"
          :disabled="!selectedGroup || selectedGroup.isShared || sharing"
          class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {{ sharing ? '分享中...' : '确认分享' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  noteId: {
    type: String,
    required: true
  },
  noteTitle: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'shared'])

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const sharing = ref(false)
const myGroups = ref([])
const selectedGroup = ref(null)
const shareMessage = ref('')

// Load user's groups
const loadMyGroups = async () => {
  loading.value = true
  try {
    // Get user's groups
    const groupsResult = await $fetch('/api/study-groups', {
      headers: authStore.getAuthHeader()
    })

    if (groupsResult.success) {
      // Get shared status for each group
      const noteResult = await $fetch(`/api/personal-notes/${props.noteId}`, {
        headers: authStore.getAuthHeader()
      })

      const sharedGroupIds = noteResult.data.sharedGroups?.map(g => g.id) || []

      myGroups.value = groupsResult.data.map(group => ({
        ...group,
        isShared: sharedGroupIds.includes(group.id)
      }))
    }
  } catch (error) {
    console.error('加载小组列表失败:', error)
  } finally {
    loading.value = false
  }
}

// Handle share
const handleShare = async () => {
  if (!selectedGroup.value || selectedGroup.value.isShared) return

  sharing.value = true
  try {
    const result = await $fetch(`/api/personal-notes/${props.noteId}/share`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        groupId: selectedGroup.value.id,
        shareMessage: shareMessage.value
      }
    })

    if (result.success) {
      // Show success message
      alert(`笔记已成功分享到"${selectedGroup.value.name}"小组！`)
      emit('shared', result.data)
      emit('close')
    }
  } catch (error) {
    console.error('分享笔记失败:', error)
    alert(error.data?.message || '分享笔记失败')
  } finally {
    sharing.value = false
  }
}

// Go to groups page
const goToGroups = () => {
  router.push('/study-groups')
  emit('close')
}

// Load groups on mount
onMounted(() => {
  loadMyGroups()
})
</script>
