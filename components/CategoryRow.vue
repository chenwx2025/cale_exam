<template>
  <tr class="hover:bg-gray-50">
    <td class="px-6 py-4">
      <div :style="{ paddingLeft: `${level * 24}px` }" class="flex items-center gap-2">
        <span v-if="category.childrenCount > 0" class="text-gray-400">└</span>
        <div>
          <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
          <div v-if="category.nameEn" class="text-xs text-gray-500">{{ category.nameEn }}</div>
        </div>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{{ category.code }}</span>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <span :class="['px-2 py-1 rounded text-xs font-semibold', getTypeClass(category.type)]">
        {{ getTypeText(category.type) }}
      </span>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
      {{ category.weight ? category.weight + '%' : '-' }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm">
        <span class="font-semibold text-gray-900">{{ category.actualQuestionCount }}</span>
        <span v-if="category.questionCount" class="text-gray-500"> / {{ category.questionCount }}</span>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
      {{ category.childrenCount || 0 }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
      <button @click="$emit('edit', category)" class="text-green-600 hover:text-green-900">编辑</button>
    </td>
  </tr>
  <!-- 递归渲染子分类 -->
  <template v-if="category.children && category.children.length > 0">
    <CategoryRow
      v-for="child in category.children"
      :key="child.id"
      :category="child"
      :level="level + 1"
      @edit="$emit('edit', $event)"
    />
  </template>
</template>

<script setup lang="ts">
defineProps<{
  category: any
  level: number
}>()

defineEmits<{
  edit: [category: any]
}>()

const getTypeText = (type: string) => {
  const map: any = {
    organization: '组织',
    content: '内容',
    review: '复习'
  }
  return map[type] || type
}

const getTypeClass = (type: string) => {
  const map: any = {
    organization: 'bg-blue-100 text-blue-700',
    content: 'bg-green-100 text-green-700',
    review: 'bg-purple-100 text-purple-700'
  }
  return map[type] || 'bg-gray-100 text-gray-700'
}
</script>
