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
          <div
            class="px-6 py-4 rounded-t-2xl"
            :class="headerClass"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                :class="iconBgClass"
              >
                <svg
                  v-if="type === 'danger'"
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
            <p class="text-gray-700 whitespace-pre-line">{{ message }}</p>
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
              class="px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
              :class="confirmButtonClass"
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
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  message: string
  type?: 'danger' | 'warning' | 'info'
  title?: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '确认',
  confirmText: '确定',
  cancelText: '取消'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const headerClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-gradient-to-r from-red-500 to-red-600'
    case 'warning':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    default:
      return 'bg-gradient-to-r from-blue-500 to-blue-600'
  }
})

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600'
    case 'warning':
      return 'bg-yellow-600'
    default:
      return 'bg-blue-600'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700 text-white'
    default:
      return 'bg-blue-600 hover:bg-blue-700 text-white'
  }
})

const confirm = () => {
  emit('confirm')
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
