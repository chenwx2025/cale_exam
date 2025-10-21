<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="close"
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
                  v-if="type === 'success'"
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else-if="type === 'error'"
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <svg
                  v-else-if="type === 'warning'"
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end">
            <button
              class="px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
              :class="buttonClass"
              @click="close"
            >
              {{ okText }}
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
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  okText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '提示',
  okText: '确定'
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const headerClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-gradient-to-r from-green-500 to-green-600'
    case 'error':
      return 'bg-gradient-to-r from-red-500 to-red-600'
    case 'warning':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    default:
      return 'bg-gradient-to-r from-blue-500 to-blue-600'
  }
})

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-600'
    case 'error':
      return 'bg-red-600'
    case 'warning':
      return 'bg-yellow-600'
    default:
      return 'bg-blue-600'
  }
})

const buttonClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-600 hover:bg-green-700 text-white'
    case 'error':
      return 'bg-red-600 hover:bg-red-700 text-white'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700 text-white'
    default:
      return 'bg-blue-600 hover:bg-blue-700 text-white'
  }
})

const close = () => {
  emit('close')
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
