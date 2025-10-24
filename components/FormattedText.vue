<template>
  <div class="formatted-text">
    <div v-for="(block, index) in formattedBlocks" :key="index" :class="block.class">
      <!-- 列表块 -->
      <ul v-if="block.type === 'list'" :class="block.innerClass">
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex" class="text-gray-700">
          {{ item.content }}
        </li>
      </ul>
      <!-- 其他块 -->
      <component :is="block.tag" v-else-if="block.tag" :class="block.innerClass">
        {{ block.content }}
      </component>
      <div v-else>
        {{ block.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const formattedBlocks = computed(() => {
  if (!props.text) return []

  // Debug: log the first 200 characters of the text to see what we're working with
  console.log('[FormattedText] Received text (first 200 chars):', props.text.substring(0, 200))

  const blocks = []
  const lines = props.text.split('\n')

  let currentBlock = null

  for (let line of lines) {
    const trimmed = line.trim()

    // 空行 - 段落分隔
    if (!trimmed) {
      if (currentBlock) {
        blocks.push(currentBlock)
        currentBlock = null
      }
      continue
    }

    // 检测标题（以【】或一、二、三、等开头）
    if (trimmed.match(/^【.+】$/) || trimmed.match(/^[一二三四五六七八九十]+、/)) {
      if (currentBlock) {
        blocks.push(currentBlock)
      }
      blocks.push({
        content: trimmed,
        class: 'font-bold text-gray-900 mt-4 mb-2 text-base',
        tag: 'h4'
      })
      currentBlock = null
      continue
    }

    // 检测列表项（以 • 或 - 或数字. 开头）
    if (trimmed.match(/^[•\-\*]\s/) || trimmed.match(/^\d+[\.\)、]/)) {
      if (currentBlock && currentBlock.type !== 'list') {
        blocks.push(currentBlock)
        currentBlock = null
      }

      if (!currentBlock) {
        currentBlock = {
          type: 'list',
          items: [],
          class: 'space-y-1 ml-4'
        }
      }

      currentBlock.items.push({
        content: trimmed,
        class: 'flex items-start gap-2'
      })
      continue
    }

    // 检测强调文本（包含 → 或 ：的行）
    if (trimmed.includes('→') || trimmed.includes('：')) {
      if (currentBlock) {
        blocks.push(currentBlock)
        currentBlock = null
      }
      blocks.push({
        content: trimmed,
        class: 'my-2 pl-4 border-l-2 border-blue-400 text-gray-700'
      })
      continue
    }

    // 普通段落
    if (!currentBlock || currentBlock.type === 'list') {
      if (currentBlock) {
        blocks.push(currentBlock)
      }
      currentBlock = {
        type: 'paragraph',
        content: trimmed,
        class: 'my-2 text-gray-700 leading-relaxed'
      }
    } else if (currentBlock.type === 'paragraph') {
      currentBlock.content += ' ' + trimmed
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock)
  }

  // 返回blocks，列表块保持原有的items结构
  return blocks
})
</script>

<style scoped>
.formatted-text {
  @apply text-sm leading-relaxed;
}

.formatted-text ul {
  @apply pl-4;
}

.formatted-text li {
  @apply text-gray-700;
}
</style>
