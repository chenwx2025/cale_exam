<template>
  <div>
    <AlertModal
      v-if="dialog.state.value.type === 'alert'"
      :is-open="dialog.state.value.isOpen"
      :message="dialog.state.value.message"
      :type="dialog.state.value.variant as any"
      :title="dialog.state.value.title"
      :ok-text="dialog.state.value.okText"
      @close="dialog.handleAlertClose"
    />

    <ConfirmModal
      v-if="dialog.state.value.type === 'confirm'"
      :is-open="dialog.state.value.isOpen"
      :message="dialog.state.value.message"
      :type="dialog.state.value.variant as any"
      :title="dialog.state.value.title"
      :confirm-text="dialog.state.value.confirmText"
      :cancel-text="dialog.state.value.cancelText"
      @confirm="dialog.handleConfirm"
      @cancel="dialog.handleCancel"
    />

    <PromptModal
      v-if="dialog.state.value.type === 'prompt'"
      :is-open="dialog.state.value.isOpen"
      :message="dialog.state.value.message"
      :title="dialog.state.value.title"
      :placeholder="dialog.state.value.placeholder"
      :default-value="dialog.state.value.defaultValue"
      :confirm-text="dialog.state.value.confirmText"
      :cancel-text="dialog.state.value.cancelText"
      @confirm="dialog.handlePromptConfirm"
      @cancel="dialog.handlePromptCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '~/composables/useDialog'

const dialog = useDialog()
</script>
