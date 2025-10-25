<template>
  <div class="edit-note-page min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <NoteEditor
        :group-id="groupId"
        :note-id="noteId"
        mode="edit"
        @saved="handleSaved"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const groupId = route.params.id
const noteId = route.params.noteId

// 处理保存成功
const handleSaved = (status) => {
  // 保存成功后返回笔记详情页
  router.push(`/study-groups/${groupId}/notes/${noteId}`)
}

// 处理取消
const handleCancel = () => {
  // 取消后返回笔记详情页
  router.push(`/study-groups/${groupId}/notes/${noteId}`)
}
</script>

<style scoped>
/* 页面样式继承自全局 */
</style>
