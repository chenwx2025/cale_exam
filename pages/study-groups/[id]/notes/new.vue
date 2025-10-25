<template>
  <div class="create-note-page min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <NoteEditor
        :group-id="groupId"
        mode="create"
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

const handleSaved = (status) => {
  // 跳转回笔记列表
  router.push(`/study-groups/${groupId}/notes`)
}

const handleCancel = () => {
  router.back()
}
</script>
