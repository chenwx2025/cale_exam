<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="cancel"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white">
                {{ title }}
              </h3>
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 py-4">
            <p class="text-gray-700 mb-4 whitespace-pre-line">{{ message }}</p>
            <input
              ref="inputRef"
              v-model="inputValue"
              type="text"
              :placeholder="placeholder"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              @keyup.enter="confirm"
              @keyup.esc="cancel"
            >
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <button
              class="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
              @click="cancel"
            >
              {{ cancelText }}
            </button>
            <button
              class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
              @click="confirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  isOpen: boolean
  message: string
  title?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '输入',
  placeholder: '请输入...',
  defaultValue: '',
  confirmText: '确定',
  cancelText: '取消'
})

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

const inputValue = ref(props.defaultValue)
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    inputValue.value = props.defaultValue
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }
})

const confirm = () => {
  emit('confirm', inputValue.value)
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
