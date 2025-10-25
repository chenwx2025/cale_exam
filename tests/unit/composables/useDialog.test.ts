import { describe, it, expect, beforeEach } from 'vitest'
import { useDialog } from '../../../composables/useDialog'

describe('useDialog Composable', () => {
  let dialog: ReturnType<typeof useDialog>

  beforeEach(() => {
    dialog = useDialog()
    // 重置状态
    dialog.state.value = {
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
    }
  })

  describe('alert', () => {
    it('应该显示 alert 对话框（字符串参数）', async () => {
      const alertPromise = dialog.alert('这是一个提示消息')

      expect(dialog.state.value.type).toBe('alert')
      expect(dialog.state.value.isOpen).toBe(true)
      expect(dialog.state.value.message).toBe('这是一个提示消息')
      expect(dialog.state.value.title).toBe('提示')
      expect(dialog.state.value.variant).toBe('info')

      dialog.handleAlertClose()
      await alertPromise
    })

    it('应该显示 alert 对话框（对象参数）', async () => {
      const alertPromise = dialog.alert({
        message: '自定义消息',
        title: '自定义标题',
        type: 'success',
        okText: '好的'
      })

      expect(dialog.state.value.type).toBe('alert')
      expect(dialog.state.value.isOpen).toBe(true)
      expect(dialog.state.value.message).toBe('自定义消息')
      expect(dialog.state.value.title).toBe('自定义标题')
      expect(dialog.state.value.variant).toBe('success')
      expect(dialog.state.value.okText).toBe('好的')

      dialog.handleAlertClose()
      await alertPromise
    })

    it('应该支持不同的类型', async () => {
      const types: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info']

      for (const type of types) {
        const alertPromise = dialog.alert({
          message: `${type} message`,
          type
        })

        expect(dialog.state.value.variant).toBe(type)

        dialog.handleAlertClose()
        await alertPromise
      }
    })

    it('应该在关闭时 resolve promise', async () => {
      const alertPromise = dialog.alert('测试')
      let resolved = false

      alertPromise.then(() => {
        resolved = true
      })

      expect(resolved).toBe(false)
      expect(dialog.state.value.isOpen).toBe(true)

      dialog.handleAlertClose()
      await alertPromise

      expect(resolved).toBe(true)
      expect(dialog.state.value.isOpen).toBe(false)
    })
  })

  describe('confirm', () => {
    it('应该显示 confirm 对话框（字符串参数）', async () => {
      const confirmPromise = dialog.confirm('确认操作吗？')

      expect(dialog.state.value.type).toBe('confirm')
      expect(dialog.state.value.isOpen).toBe(true)
      expect(dialog.state.value.message).toBe('确认操作吗？')
      expect(dialog.state.value.title).toBe('确认')

      dialog.handleCancel()
      await confirmPromise
    })

    it('应该显示 confirm 对话框（对象参数）', async () => {
      const confirmPromise = dialog.confirm({
        message: '确认删除吗？',
        title: '危险操作',
        type: 'danger',
        confirmText: '删除',
        cancelText: '放弃'
      })

      expect(dialog.state.value.type).toBe('confirm')
      expect(dialog.state.value.message).toBe('确认删除吗？')
      expect(dialog.state.value.title).toBe('危险操作')
      expect(dialog.state.value.variant).toBe('danger')
      expect(dialog.state.value.confirmText).toBe('删除')
      expect(dialog.state.value.cancelText).toBe('放弃')

      dialog.handleCancel()
      await confirmPromise
    })

    it('应该在确认时返回 true', async () => {
      const confirmPromise = dialog.confirm('确认吗？')

      expect(dialog.state.value.isOpen).toBe(true)

      dialog.handleConfirm()
      const result = await confirmPromise

      expect(result).toBe(true)
      expect(dialog.state.value.isOpen).toBe(false)
    })

    it('应该在取消时返回 false', async () => {
      const confirmPromise = dialog.confirm('确认吗？')

      expect(dialog.state.value.isOpen).toBe(true)

      dialog.handleCancel()
      const result = await confirmPromise

      expect(result).toBe(false)
      expect(dialog.state.value.isOpen).toBe(false)
    })
  })

  describe('prompt', () => {
    it('应该显示 prompt 对话框（字符串参数）', async () => {
      const promptPromise = dialog.prompt('请输入您的名字')

      expect(dialog.state.value.type).toBe('prompt')
      expect(dialog.state.value.isOpen).toBe(true)
      expect(dialog.state.value.message).toBe('请输入您的名字')
      expect(dialog.state.value.title).toBe('输入')
      expect(dialog.state.value.placeholder).toBe('请输入...')

      dialog.handlePromptCancel()
      await promptPromise
    })

    it('应该显示 prompt 对话框（对象参数）', async () => {
      const promptPromise = dialog.prompt({
        message: '请输入密码',
        title: '验证身份',
        placeholder: '输入密码',
        defaultValue: 'default123',
        confirmText: '提交',
        cancelText: '跳过'
      })

      expect(dialog.state.value.message).toBe('请输入密码')
      expect(dialog.state.value.title).toBe('验证身份')
      expect(dialog.state.value.placeholder).toBe('输入密码')
      expect(dialog.state.value.defaultValue).toBe('default123')
      expect(dialog.state.value.confirmText).toBe('提交')
      expect(dialog.state.value.cancelText).toBe('跳过')

      dialog.handlePromptCancel()
      await promptPromise
    })

    it('应该在确认时返回输入的值', async () => {
      const promptPromise = dialog.prompt('请输入')

      expect(dialog.state.value.isOpen).toBe(true)

      const userInput = '用户输入的内容'
      dialog.handlePromptConfirm(userInput)
      const result = await promptPromise

      expect(result).toBe(userInput)
      expect(dialog.state.value.isOpen).toBe(false)
    })

    it('应该在取消时返回 null', async () => {
      const promptPromise = dialog.prompt('请输入')

      expect(dialog.state.value.isOpen).toBe(true)

      dialog.handlePromptCancel()
      const result = await promptPromise

      expect(result).toBeNull()
      expect(dialog.state.value.isOpen).toBe(false)
    })

    it('应该支持空字符串作为有效输入', async () => {
      const promptPromise = dialog.prompt('请输入')

      dialog.handlePromptConfirm('')
      const result = await promptPromise

      expect(result).toBe('')
      expect(result).not.toBeNull()
    })
  })

  describe('状态管理', () => {
    it('应该正确清理 resolve 回调', async () => {
      const confirmPromise = dialog.confirm('测试')

      expect(dialog.state.value.resolve).not.toBeNull()

      dialog.handleConfirm()
      await confirmPromise

      expect(dialog.state.value.resolve).toBeNull()
    })

    it('应该在每次调用时重置状态', async () => {
      // 第一次 alert
      const alert1 = dialog.alert({
        message: '消息1',
        title: '标题1',
        type: 'success'
      })
      dialog.handleAlertClose()
      await alert1

      // 第二次 confirm
      const confirm1 = dialog.confirm({
        message: '消息2',
        title: '标题2',
        type: 'danger'
      })

      // 状态应该完全更新
      expect(dialog.state.value.type).toBe('confirm')
      expect(dialog.state.value.message).toBe('消息2')
      expect(dialog.state.value.title).toBe('标题2')
      expect(dialog.state.value.variant).toBe('danger')

      dialog.handleCancel()
      await confirm1
    })

    it('应该支持连续的对话框调用', async () => {
      const results: any[] = []

      // 第一个 alert
      const p1 = dialog.alert('Alert 1')
      dialog.handleAlertClose()
      results.push(await p1)

      // 第二个 confirm
      const p2 = dialog.confirm('Confirm 1')
      dialog.handleConfirm()
      results.push(await p2)

      // 第三个 prompt
      const p3 = dialog.prompt('Prompt 1')
      dialog.handlePromptConfirm('answer')
      results.push(await p3)

      expect(results).toHaveLength(3)
      expect(results[0]).toBeUndefined()
      expect(results[1]).toBe(true)
      expect(results[2]).toBe('answer')
    })
  })

  describe('边界情况', () => {
    it('应该处理空消息', async () => {
      const alertPromise = dialog.alert('')

      expect(dialog.state.value.message).toBe('')

      dialog.handleAlertClose()
      await alertPromise
    })

    it('应该处理很长的消息', async () => {
      const longMessage = 'A'.repeat(1000)
      const alertPromise = dialog.alert(longMessage)

      expect(dialog.state.value.message).toBe(longMessage)
      expect(dialog.state.value.message).toHaveLength(1000)

      dialog.handleAlertClose()
      await alertPromise
    })

    it('应该处理特殊字符', async () => {
      const specialMessage = '特殊字符: <>&"\'😀\n\t'
      const alertPromise = dialog.alert(specialMessage)

      expect(dialog.state.value.message).toBe(specialMessage)

      dialog.handleAlertClose()
      await alertPromise
    })

    it('应该处理 undefined title（使用默认值）', async () => {
      const alertPromise = dialog.alert({
        message: '测试',
        title: undefined
      })

      expect(dialog.state.value.title).toBe('提示')

      dialog.handleAlertClose()
      await alertPromise
    })

    it('应该在没有 resolve 时安全处理关闭', () => {
      dialog.state.value.resolve = null
      dialog.state.value.isOpen = true

      // 应该不抛出错误
      expect(() => dialog.handleAlertClose()).not.toThrow()
      expect(() => dialog.handleConfirm()).not.toThrow()
      expect(() => dialog.handleCancel()).not.toThrow()
      expect(() => dialog.handlePromptConfirm('test')).not.toThrow()
      expect(() => dialog.handlePromptCancel()).not.toThrow()
    })
  })

  describe('多实例', () => {
    it('不同实例应该共享状态（单例模式）', () => {
      const dialog1 = useDialog()
      const dialog2 = useDialog()

      dialog1.alert('测试消息')

      // 两个实例应该看到相同的状态
      expect(dialog2.state.value.message).toBe('测试消息')
      expect(dialog2.state.value.isOpen).toBe(true)
    })

    it('任一实例都可以关闭对话框', async () => {
      const dialog1 = useDialog()
      const dialog2 = useDialog()

      const alertPromise = dialog1.alert('测试')

      expect(dialog1.state.value.isOpen).toBe(true)
      expect(dialog2.state.value.isOpen).toBe(true)

      // 使用 dialog2 关闭
      dialog2.handleAlertClose()
      await alertPromise

      expect(dialog1.state.value.isOpen).toBe(false)
      expect(dialog2.state.value.isOpen).toBe(false)
    })
  })
})
