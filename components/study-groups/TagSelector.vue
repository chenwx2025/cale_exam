<template>
  <div class="tag-selector">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      标签 (最多选择3个)
    </label>

    <!-- 已选标签 -->
    <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2 mb-3">
      <span
        v-for="tag in selectedTags"
        :key="tag.id"
        :style="{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }"
        class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border cursor-pointer hover:opacity-80"
        @click="removeTag(tag.id)"
      >
        {{ tag.name }}
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </span>
    </div>

    <!-- 标签下拉选择 -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索或选择标签..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        @focus="showDropdown = true"
        @blur="handleBlur"
      />

      <!-- 下拉列表 -->
      <div
        v-if="showDropdown && filteredTags.length > 0"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      >
        <div
          v-for="tag in filteredTags"
          :key="tag.id"
          class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
          @mousedown.prevent="selectTag(tag)"
        >
          <div class="flex items-center gap-2">
            <span
              :style="{ backgroundColor: tag.color }"
              class="w-3 h-3 rounded-full"
            ></span>
            <span class="text-sm font-medium">{{ tag.name }}</span>
          </div>
          <span class="text-xs text-gray-400">{{ tag.postCount }} 篇</span>
        </div>
      </div>
    </div>

    <!-- 管理员创建标签 -->
    <div v-if="canManageTags" class="mt-2">
      <button
        @click="showCreateModal = true"
        class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        创建新标签
      </button>
    </div>

    <!-- 创建标签模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">创建新标签</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标签名称</label>
            <input
              v-model="newTagName"
              type="text"
              maxlength="20"
              placeholder="输入标签名称"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标签颜色</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="color in colorOptions"
                :key="color"
                :style="{ backgroundColor: color }"
                :class="[
                  'w-8 h-8 rounded-full border-2 transition-all',
                  newTagColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                ]"
                @click="newTagColor = color"
              ></button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述 (可选)</label>
            <textarea
              v-model="newTagDescription"
              rows="2"
              maxlength="100"
              placeholder="标签描述"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <div class="flex gap-2 mt-6">
          <button
            @click="createTag"
            :disabled="!newTagName.trim() || isCreating"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isCreating ? '创建中...' : '创建' }}
          </button>
          <button
            @click="closeCreateModal"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  groupId: {
    type: String,
    required: true
  },
  canManageTags: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()

const availableTags = ref([])
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedTags = ref([])
const isLoading = ref(false)

// 创建标签相关
const showCreateModal = ref(false)
const newTagName = ref('')
const newTagColor = ref('#3B82F6')
const newTagDescription = ref('')
const isCreating = ref(false)

const colorOptions = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316'  // orange
]

// 加载标签列表
const loadTags = async () => {
  isLoading.value = true
  try {
    const data = await $fetch(`/api/study-groups/${props.groupId}/tags`, {
      headers: authStore.getAuthHeader()
    })
    availableTags.value = data.data || []
  } catch (error) {
    console.error('加载标签失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 过滤标签
const filteredTags = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const selectedIds = selectedTags.value.map(t => t.id)

  return availableTags.value
    .filter(tag => !selectedIds.includes(tag.id))
    .filter(tag => !query || tag.name.toLowerCase().includes(query))
    .slice(0, 10)
})

// 选择标签
const selectTag = (tag) => {
  if (selectedTags.value.length >= 3) {
    alert('最多只能选择3个标签')
    return
  }

  selectedTags.value.push(tag)
  searchQuery.value = ''
  showDropdown.value = false

  // 发送更新事件
  emit('update:modelValue', selectedTags.value.map(t => t.id))
}

// 移除标签
const removeTag = (tagId) => {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tagId)
  emit('update:modelValue', selectedTags.value.map(t => t.id))
}

// 处理失焦
const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// 创建新标签
const createTag = async () => {
  if (!newTagName.value.trim()) return

  isCreating.value = true
  try {
    const result = await $fetch(`/api/study-groups/${props.groupId}/tags`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        name: newTagName.value.trim(),
        color: newTagColor.value,
        description: newTagDescription.value.trim() || null
      }
    })

    // 添加到可用标签列表
    availableTags.value.unshift(result.tag)

    // 自动选择新创建的标签
    if (selectedTags.value.length < 3) {
      selectTag(result.tag)
    }

    closeCreateModal()
    alert('标签创建成功！')
  } catch (error) {
    console.error('创建标签失败:', error)
    alert(error.data?.message || '创建标签失败')
  } finally {
    isCreating.value = false
  }
}

// 关闭创建模态框
const closeCreateModal = () => {
  showCreateModal.value = false
  newTagName.value = ''
  newTagColor.value = '#3B82F6'
  newTagDescription.value = ''
}

// 初始化
onMounted(() => {
  loadTags()

  // 如果有初始值，加载对应的标签
  if (props.modelValue && props.modelValue.length > 0) {
    // 等待标签加载完成后设置选中的标签
    watch(availableTags, (tags) => {
      if (tags.length > 0 && selectedTags.value.length === 0) {
        selectedTags.value = tags.filter(t => props.modelValue.includes(t.id))
      }
    }, { immediate: true })
  }
})
</script>

<style scoped>
.tag-selector {
  position: relative;
}
</style>
