<template>
  <div class="poll-creator">
    <div class="poll-header mb-4">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span class="text-2xl">📊</span>
        创建投票
      </h3>
    </div>

    <div class="poll-form space-y-4">
      <!-- 投票问题 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          投票问题 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="pollData.question"
          type="text"
          placeholder="例如：你最喜欢的学习时间是？"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxlength="200"
        />
        <div class="text-xs text-gray-500 mt-1">
          {{ pollData.question.length }}/200
        </div>
      </div>

      <!-- 投票选项 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          投票选项 <span class="text-red-500">*</span> (至少2个)
        </label>
        <div class="space-y-2">
          <div
            v-for="(option, index) in pollData.options"
            :key="index"
            class="flex items-center gap-2"
          >
            <input
              v-model="pollData.options[index]"
              type="text"
              :placeholder="`选项 ${index + 1}`"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxlength="100"
            />
            <button
              v-if="pollData.options.length > 2"
              @click="removeOption(index)"
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
        <button
          @click="addOption"
          class="mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
          type="button"
        >
          <span class="text-lg">+</span>
          添加选项
        </button>
      </div>

      <!-- 投票设置 -->
      <div class="space-y-3 p-4 bg-gray-50 rounded-lg">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="pollData.allowMultiple"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">允许多选</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="pollData.allowAddOption"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">允许用户添加选项</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="enableEndTime"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">设置截止时间</span>
        </label>

        <!-- 截止时间选择器 -->
        <div v-if="enableEndTime" class="pl-6">
          <input
            v-model="pollData.endAt"
            type="datetime-local"
            :min="minDateTime"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- 操作按钮 (仅在非嵌入模式显示) -->
      <div v-if="!embedded" class="flex gap-2 pt-2">
        <button
          @click="handleCancel"
          type="button"
          class="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          @click="handleCreate"
          type="button"
          :disabled="!isValid || isCreating"
          :class="[
            'flex-1 px-4 py-2 text-white rounded-lg transition-colors',
            isValid && !isCreating
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 cursor-not-allowed'
          ]"
        >
          {{ isCreating ? '创建中...' : '创建投票' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  embedded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create', 'cancel'])

const pollData = ref({
  question: '',
  options: ['', ''],
  allowMultiple: false,
  allowAddOption: false,
  endAt: null
})

const enableEndTime = ref(false)
const isCreating = ref(false)

// 最小时间（当前时间 + 1小时）
const minDateTime = computed(() => {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  return now.toISOString().slice(0, 16)
})

// 验证表单是否有效
const isValid = computed(() => {
  // 问题不能为空
  if (!pollData.value.question.trim()) return false

  // 至少需要2个有效选项
  const validOptions = pollData.value.options.filter(opt => opt.trim())
  if (validOptions.length < 2) return false

  // 如果启用了截止时间，必须选择时间
  if (enableEndTime.value && !pollData.value.endAt) return false

  return true
})

// 添加选项
const addOption = () => {
  if (pollData.value.options.length < 10) {
    pollData.value.options.push('')
  }
}

// 删除选项
const removeOption = (index) => {
  if (pollData.value.options.length > 2) {
    pollData.value.options.splice(index, 1)
  }
}

// 创建投票
const handleCreate = () => {
  if (!isValid.value || isCreating.value) return

  isCreating.value = true

  // 过滤空选项
  const validOptions = pollData.value.options.filter(opt => opt.trim())

  const data = {
    question: pollData.value.question.trim(),
    options: validOptions,
    allowMultiple: pollData.value.allowMultiple,
    allowAddOption: pollData.value.allowAddOption,
    endAt: enableEndTime.value ? pollData.value.endAt : null
  }

  emit('create', data)

  // 重置状态（由父组件决定是否关闭）
  setTimeout(() => {
    isCreating.value = false
  }, 1000)
}

// 取消创建
const handleCancel = () => {
  emit('cancel')
}

// 重置表单
const reset = () => {
  pollData.value = {
    question: '',
    options: ['', ''],
    allowMultiple: false,
    allowAddOption: false,
    endAt: null
  }
  enableEndTime.value = false
  isCreating.value = false
}

// 在embedded模式下，监听数据变化并自动触发create事件
watch(
  () => [pollData.value, enableEndTime.value],
  () => {
    if (props.embedded && isValid.value) {
      // 过滤空选项
      const validOptions = pollData.value.options.filter(opt => opt.trim())

      const data = {
        question: pollData.value.question.trim(),
        options: validOptions,
        allowMultiple: pollData.value.allowMultiple,
        allowAddOption: pollData.value.allowAddOption,
        endAt: enableEndTime.value ? pollData.value.endAt : null
      }

      emit('create', data)
    }
  },
  { deep: true }
)

// 暴露重置方法
defineExpose({
  reset
})
</script>

<style scoped>
.poll-creator {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.poll-form input[type="text"],
.poll-form input[type="datetime-local"] {
  transition: all 0.2s;
}

.poll-form input[type="text"]:focus,
.poll-form input[type="datetime-local"]:focus {
  outline: none;
}

.poll-form input[type="checkbox"] {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
