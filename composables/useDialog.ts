import { ref } from 'vue'

interface AlertOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  okText?: string
}

interface ConfirmOptions {
  message: string
  type?: 'danger' | 'warning' | 'info'
  title?: string
  confirmText?: string
  cancelText?: string
}

interface PromptOptions {
  message: string
  title?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}

interface DialogState {
  type: 'alert' | 'confirm' | 'prompt' | null
  isOpen: boolean
  message: string
  title: string
  variant: string
  okText: string
  confirmText: string
  cancelText: string
  placeholder: string
  defaultValue: string
  resolve: ((value: any) => void) | null
}

const state = ref<DialogState>({
  type: null,
  isOpen: false,
  message: '',
  title: '',
  variant: 'info',
  okText: '确定',
  confirmText: '确定',
  cancelText: '取消',
  placeholder: '请输入...',
  defaultValue: '',
  resolve: null
})

export function useDialog() {
  const alert = (options: string | AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options

      state.value = {
        type: 'alert',
        isOpen: true,
        message: opts.message,
        title: opts.title || '提示',
        variant: opts.type || 'info',
        okText: opts.okText || '确定',
        confirmText: '确定',
        cancelText: '取消',
        placeholder: '请输入...',
        defaultValue: '',
        resolve: resolve as any
      }
    })
  }

  const confirm = (options: string | ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options

      state.value = {
        type: 'confirm',
        isOpen: true,
        message: opts.message,
        title: opts.title || '确认',
        variant: opts.type || 'info',
        okText: '确定',
        confirmText: opts.confirmText || '确定',
        cancelText: opts.cancelText || '取消',
        placeholder: '请输入...',
        defaultValue: '',
        resolve: resolve as any
      }
    })
  }

  const prompt = (options: string | PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options

      state.value = {
        type: 'prompt',
        isOpen: true,
        message: opts.message,
        title: opts.title || '输入',
        variant: 'info',
        okText: '确定',
        confirmText: opts.confirmText || '确定',
        cancelText: opts.cancelText || '取消',
        placeholder: opts.placeholder || '请输入...',
        defaultValue: opts.defaultValue || '',
        resolve: resolve as any
      }
    })
  }

  const handleAlertClose = () => {
    state.value.isOpen = false
    if (state.value.resolve) {
      state.value.resolve(undefined)
      state.value.resolve = null
    }
  }

  const handleConfirm = () => {
    state.value.isOpen = false
    if (state.value.resolve) {
      state.value.resolve(true)
      state.value.resolve = null
    }
  }

  const handleCancel = () => {
    state.value.isOpen = false
    if (state.value.resolve) {
      state.value.resolve(false)
      state.value.resolve = null
    }
  }

  const handlePromptConfirm = (value: string) => {
    state.value.isOpen = false
    if (state.value.resolve) {
      state.value.resolve(value)
      state.value.resolve = null
    }
  }

  const handlePromptCancel = () => {
    state.value.isOpen = false
    if (state.value.resolve) {
      state.value.resolve(null)
      state.value.resolve = null
    }
  }

  return {
    state,
    alert,
    confirm,
    prompt,
    handleAlertClose,
    handleConfirm,
    handleCancel,
    handlePromptConfirm,
    handlePromptCancel
  }
}
