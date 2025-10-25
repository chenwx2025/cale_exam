<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <PersonalNoteEditor
        mode="create"
        @saved="handleSaved"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import PersonalNoteEditor from '~/components/PersonalNoteEditor.vue'

const router = useRouter()

const handleSaved = (status) => {
  router.push('/dashboard/notes')
}

const handleCancel = () => {
  router.push('/dashboard/notes')
}
</script>
