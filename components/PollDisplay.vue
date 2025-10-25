<template>
  <!-- 加载状态 -->
  <div v-if="!poll" class="poll-display">
    <div class="flex items-center justify-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <span class="ml-3 text-gray-600">加载投票中...</span>
    </div>
  </div>

  <!-- 投票内容 -->
  <div v-else class="poll-display">
    <!-- 投票标题和状态 -->
    <div class="poll-header mb-4">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span class="text-2xl">📊</span>
        {{ poll.question }}
      </h3>
      <div class="flex items-center gap-3 mt-2 text-sm text-gray-600">
        <span>{{ poll.totalVotes }} 人已投票</span>
        <span v-if="poll.endAt" class="flex items-center gap-1">
          <span v-if="poll.isEnded" class="text-red-500">已结束</span>
          <span v-else class="text-green-600">还有 {{ timeRemaining }}</span>
        </span>
      </div>
    </div>

    <!-- 投票选项 -->
    <div class="poll-options space-y-3">
      <div
        v-for="option in poll.options"
        :key="option.id"
        :class="[
          'poll-option',
          option.isVoted && 'voted',
          poll.isEnded && 'ended',
          !poll.isEnded && !hasVoted && 'clickable'
        ]"
        @click="!poll.isEnded && !isVoting && toggleOption(option.id)"
      >
        <!-- 选项内容 -->
        <div class="option-content">
          <div class="flex items-center gap-2">
            <!-- 单选/多选图标 -->
            <span class="option-icon">
              <template v-if="poll.allowMultiple">
                <span v-if="option.isVoted" class="text-blue-600">☑</span>
                <span v-else class="text-gray-400">☐</span>
              </template>
              <template v-else>
                <span v-if="option.isVoted" class="text-blue-600">●</span>
                <span v-else class="text-gray-400">○</span>
              </template>
            </span>

            <span class="option-text">{{ option.text }}</span>

            <span v-if="option.isVoted" class="voted-badge">✓</span>
          </div>

          <!-- 进度条和百分比 -->
          <div class="option-stats">
            <div class="progress-bar-container">
              <div
                class="progress-bar"
                :style="{ width: `${option.percentage}%` }"
              ></div>
            </div>
            <div class="stats-text">
              <span class="percentage">{{ option.percentage }}%</span>
              <span class="vote-count">({{ option.voteCount }} 票)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="poll-actions mt-4 flex gap-2">
      <button
        v-if="hasVoted && !poll.isEnded"
        @click="handleChangeVote"
        :disabled="isVoting"
        class="action-btn btn-primary"
      >
        {{ isVoting ? '处理中...' : '更改投票' }}
      </button>

      <button
        v-if="hasVoted && !poll.isEnded"
        @click="handleCancelVote"
        :disabled="isVoting"
        class="action-btn btn-secondary"
      >
        取消投票
      </button>

      <button
        v-if="!hasVoted && !poll.isEnded && selectedOptions.length > 0"
        @click="handleSubmitVote"
        :disabled="isVoting"
        class="action-btn btn-primary"
      >
        {{ isVoting ? '提交中...' : '提交投票' }}
      </button>

      <button
        v-if="poll.allowAddOption && !poll.isEnded"
        @click="showAddOption = true"
        class="action-btn btn-secondary"
      >
        添加选项
      </button>
    </div>

    <!-- 添加选项模态框 -->
    <div v-if="showAddOption" class="modal-overlay" @click.self="showAddOption = false">
      <div class="modal-content">
        <h4 class="text-lg font-semibold mb-4">添加新选项</h4>
        <input
          v-model="newOptionText"
          type="text"
          placeholder="输入选项内容"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          maxlength="100"
          @keyup.enter="handleAddOption"
        />
        <div class="flex gap-2">
          <button
            @click="showAddOption = false"
            class="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="handleAddOption"
            :disabled="!newOptionText.trim() || isAddingOption"
            class="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {{ isAddingOption ? '添加中...' : '添加' }}
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
  },
  postId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['updated'])

const authStore = useAuthStore()
const poll = ref(null)
const selectedOptions = ref([])
const isVoting = ref(false)
const showAddOption = ref(false)
const newOptionText = ref('')
const isAddingOption = ref(false)

// 是否已投票
const hasVoted = computed(() => {
  return poll.value && poll.value.userVotes && poll.value.userVotes.length > 0
})

// 剩余时间
const timeRemaining = computed(() => {
  if (!poll.value || !poll.value.endAt) return ''

  const now = new Date()
  const end = new Date(poll.value.endAt)
  const diff = end - now

  if (diff <= 0) return '已结束'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}天`
  if (hours > 0) return `${hours}小时`
  return '不到1小时'
})

// 加载投票数据
const loadPoll = async () => {
  try {
    const result = await $fetch(`/api/study-groups/${props.groupId}/posts/${props.postId}/polls`, {
      headers: authStore.getAuthHeader()
    })

    if (result && result.data) {
      poll.value = result.data
      selectedOptions.value = [...(poll.value.userVotes || [])]
    }
  } catch (error) {
    console.error('加载投票失败:', error)
  }
}

// 切换选项
const toggleOption = (optionId) => {
  if (poll.value.isEnded || isVoting.value) return

  // 如果已经投过票，不允许直接修改
  if (hasVoted.value) return

  const index = selectedOptions.value.indexOf(optionId)

  if (poll.value.allowMultiple) {
    // 多选模式
    if (index > -1) {
      selectedOptions.value.splice(index, 1)
    } else {
      selectedOptions.value.push(optionId)
    }
  } else {
    // 单选模式
    selectedOptions.value = [optionId]
  }
}

// 提交投票
const handleSubmitVote = async () => {
  if (isVoting.value || selectedOptions.value.length === 0) return

  isVoting.value = true

  try {
    await $fetch(`/api/study-groups/${props.groupId}/posts/${props.postId}/polls/vote`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        optionIds: selectedOptions.value
      }
    })

    await loadPoll()
    emit('updated')
  } catch (error) {
    console.error('投票失败:', error)
    alert(error.data?.message || '投票失败，请重试')
  } finally {
    isVoting.value = false
  }
}

// 更改投票
const handleChangeVote = () => {
  // 允许重新选择
  selectedOptions.value = []
}

// 取消投票
const handleCancelVote = async () => {
  if (isVoting.value) return

  if (!confirm('确定要取消投票吗？')) return

  isVoting.value = true

  try {
    await $fetch(`/api/study-groups/${props.groupId}/posts/${props.postId}/polls/vote`, {
      method: 'DELETE',
      headers: authStore.getAuthHeader()
    })

    selectedOptions.value = []
    await loadPoll()
    emit('updated')
  } catch (error) {
    console.error('取消投票失败:', error)
    alert(error.data?.message || '取消投票失败，请重试')
  } finally {
    isVoting.value = false
  }
}

// 添加选项
const handleAddOption = async () => {
  if (!newOptionText.value.trim() || isAddingOption.value) return

  isAddingOption.value = true

  try {
    await $fetch(`/api/study-groups/${props.groupId}/posts/${props.postId}/polls/options`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        text: newOptionText.value.trim()
      }
    })

    newOptionText.value = ''
    showAddOption.value = false
    await loadPoll()
    emit('updated')
  } catch (error) {
    console.error('添加选项失败:', error)
    alert(error.data?.message || '添加选项失败，请重试')
  } finally {
    isAddingOption.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadPoll()
})

// 暴露刷新方法
defineExpose({
  refresh: loadPoll
})
</script>

<style scoped>
.poll-display {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.poll-option {
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
  background: white;
}

.poll-option.clickable {
  cursor: pointer;
}

.poll-option.clickable:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateX(4px);
}

.poll-option.voted {
  border-color: #3b82f6;
  background: #eff6ff;
}

.poll-option.ended {
  cursor: default;
}

.option-content {
  width: 100%;
}

.option-icon {
  font-size: 1.25rem;
}

.option-text {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.voted-badge {
  color: #3b82f6;
  font-weight: bold;
  font-size: 1.1rem;
}

.option-stats {
  margin-top: 12px;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stats-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.percentage {
  font-weight: 600;
  color: #3b82f6;
}

.vote-count {
  color: #6b7280;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
