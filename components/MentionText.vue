<template>
  <div class="mention-text" v-html="renderedContent"></div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: String,
    required: true
  },
  groupId: {
    type: String,
    required: false
  }
})

const renderedContent = computed(() => {
  if (!props.content) return ''

  let text = props.content

  // 转义HTML以防XSS攻击
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // 将换行符转换为<br>
  text = text.replace(/\n/g, '<br>')

  // 识别并转换@mention
  // 支持 @username 和 @"username with spaces"
  text = text.replace(
    /@([a-zA-Z0-9_\u4e00-\u9fa5]+)|@&quot;([^&]+)&quot;/g,
    (match, username1, username2) => {
      const username = username1 || username2
      return `<span class="mention">@${username}</span>`
    }
  )

  return text
})
</script>

<style scoped>
.mention-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.mention-text :deep(.mention) {
  color: #2563eb;
  font-weight: 500;
  background-color: #eff6ff;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s;
}

.mention-text :deep(.mention:hover) {
  background-color: #dbeafe;
  text-decoration: underline;
}
</style>
