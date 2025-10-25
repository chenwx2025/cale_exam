<template>
  <div class="mention-textarea-wrapper" ref="wrapperRef">
    <textarea
      ref="textareaRef"
      v-model="localValue"
      @input="handleInput"
      @keydown="handleKeydown"
      @blur="handleBlur"
      :placeholder="placeholder"
      :rows="rows"
      :class="textareaClass"
    ></textarea>

    <!-- @mention autocomplete dropdown -->
    <div
      v-if="showMentionDropdown && filteredMembers.length > 0"
      class="mention-dropdown"
      :style="dropdownStyle"
    >
      <div
        v-for="(member, index) in filteredMembers"
        :key="member.id"
        @mousedown.prevent="selectMention(member)"
        :class="[
          'mention-item',
          { 'mention-item-active': index === selectedIndex }
        ]"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {{ member.displayName.charAt(0) }}
          </div>
          <div>
            <div class="font-medium text-sm">{{ member.displayName }}</div>
            <div class="text-xs text-gray-500">@{{ member.username }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 4
  },
  groupId: {
    type: String,
    required: true
  },
  textareaClass: {
    type: String,
    default: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
  }
})

const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()
const textareaRef = ref(null)
const wrapperRef = ref(null)
const localValue = ref(props.modelValue)
const showMentionDropdown = ref(false)
const mentionQuery = ref('')
const mentionStartPos = ref(0)
const selectedIndex = ref(0)
const groupMembers = ref([])
const dropdownStyle = ref({})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== localValue.value) {
    localValue.value = newVal
  }
})

// 监听本地值变化，触发emit
watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
})

// 加载小组成员
const loadGroupMembers = async () => {
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/members`, {
      headers: authStore.getAuthHeader()
    })

    if (response && response.data) {
      groupMembers.value = response.data.map(member => ({
        id: member.user.id,
        displayName: member.user.nickname || member.user.name || member.user.email.split('@')[0],
        username: member.user.name || member.user.email.split('@')[0],
        email: member.user.email
      }))
    }
  } catch (error) {
    console.error('加载小组成员失败:', error)
  }
}

// 过滤成员列表
const filteredMembers = computed(() => {
  if (!mentionQuery.value) {
    return groupMembers.value.slice(0, 5);
  }
  const query = mentionQuery.value.toLowerCase();
  return groupMembers.value.filter(member =>
    member.displayName.toLowerCase().includes(query) ||
    member.username.toLowerCase().includes(query) ||
    member.email.toLowerCase().includes(query)
  ).slice(0, 5);
});

// 处理输入
const handleInput = (event) => {
  const value = event.target.value
  const cursorPos = event.target.selectionStart

  // 检查是否输入了 @
  const textBeforeCursor = value.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex !== -1) {
    // 检查@之前是否是空格或开头
    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '
    if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
      // 提取@后面的查询字符串
      const queryAfterAt = textBeforeCursor.substring(lastAtIndex + 1)

      // 检查@后面是否有空格或换行（如果有，不显示下拉）
      if (!queryAfterAt.includes(' ') && !queryAfterAt.includes('\n')) {
        showMentionDropdown.value = true
        mentionQuery.value = queryAfterAt
        mentionStartPos.value = lastAtIndex
        selectedIndex.value = 0

        // 计算下拉框位置
        updateDropdownPosition()
        return
      }
    }
  }

  // 关闭下拉框
  showMentionDropdown.value = false
  mentionQuery.value = ''
}

// 更新下拉框位置
const updateDropdownPosition = () => {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
  const paddingTop = parseInt(getComputedStyle(textarea).paddingTop)

  // 简单计算：基于光标位置估算行数
  const textBeforeCursor = localValue.value.substring(0, mentionStartPos.value)
  const lines = textBeforeCursor.split('\n').length

  dropdownStyle.value = {
    top: `${paddingTop + (lines) * lineHeight}px`,
    left: '10px'
  }
}

// 处理键盘事件
const handleKeydown = (event) => {
  if (!showMentionDropdown.value) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredMembers.value.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (event.key === 'Enter' && filteredMembers.value.length > 0) {
    event.preventDefault()
    selectMention(filteredMembers.value[selectedIndex.value])
  } else if (event.key === 'Escape') {
    event.preventDefault()
    showMentionDropdown.value = false
  }
}

// 选择提及
const selectMention = (member) => {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  const cursorPos = textarea.selectionStart

  // 替换@xxx为@username
  const textBefore = localValue.value.substring(0, mentionStartPos.value)
  const textAfter = localValue.value.substring(cursorPos)

  const mentionText = member.displayName.includes(' ')
    ? `@"${member.displayName}" `
    : `@${member.username} `

  localValue.value = textBefore + mentionText + textAfter

  // 关闭下拉框
  showMentionDropdown.value = false
  mentionQuery.value = ''

  // 将光标移到插入文本后
  nextTick(() => {
    const newCursorPos = mentionStartPos.value + mentionText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  })
}

// 处理失焦
const handleBlur = () => {
  // 延迟关闭，允许点击下拉项
  setTimeout(() => {
    showMentionDropdown.value = false
  }, 200)
}

// 组件挂载时加载成员
onMounted(() => {
  loadGroupMembers()
})
</script>

<style scoped>
.mention-textarea-wrapper {
  position: relative;
}

.mention-dropdown {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 300px;
  max-height: 200px;
  overflow-y: auto;
}

.mention-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.mention-item:hover,
.mention-item-active {
  background-color: #f3f4f6;
}

.mention-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}
</style>
