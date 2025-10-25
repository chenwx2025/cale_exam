import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExamStore, examTypes, type ExamType } from '../../../stores/exam'

// Mock localStorage using vi.hoisted
const { localStorageMock } = vi.hoisted(() => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {}

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString()
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      }
    }
  })()

  return { localStorageMock }
})

vi.stubGlobal('localStorage', localStorageMock)

// Mock process.client
Object.defineProperty(process, 'client', {
  value: true,
  writable: true,
  configurable: true
})

describe('Exam Store', () => {
  let examStore: ReturnType<typeof useExamStore>

  beforeEach(() => {
    // 设置 Pinia
    setActivePinia(createPinia())
    examStore = useExamStore()

    // 清除所有 mocks
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  describe('初始状态', () => {
    it('应该有默认的 currentExamType 为 cale', () => {
      expect(examStore.currentExamType).toBe('cale')
    })

    it('应该有正确的 examTypes 配置', () => {
      expect(examTypes.cale).toEqual({
        type: 'cale',
        name: 'Cale',
        fullName: '加州中医执照考试',
        description: '加州针灸执照考试（California Acupuncture Licensing Examination）'
      })

      expect(examTypes.nccaom).toEqual({
        type: 'nccaom',
        name: 'NCCAOM',
        fullName: '全国中医针灸认证考试',
        description: '美国国家中医针灸认证委员会（National Certification Commission for Acupuncture and Oriental Medicine）'
      })
    })
  })

  describe('getters', () => {
    describe('currentExam', () => {
      it('应该返回当前 CALE 考试信息', () => {
        examStore.currentExamType = 'cale'

        const current = examStore.currentExam

        expect(current).toMatchObject({
          type: 'cale',
          name: 'Cale',
          fullName: '加州中医执照考试',
          description: '加州针灸执照考试（California Acupuncture Licensing Examination）'
        })
      })

      it('应该返回当前 NCCAOM 考试信息', () => {
        examStore.currentExamType = 'nccaom'

        const current = examStore.currentExam

        expect(current).toMatchObject({
          type: 'nccaom',
          name: 'NCCAOM',
          fullName: '全国中医针灸认证考试',
          description: '美国国家中医针灸认证委员会（National Certification Commission for Acupuncture and Oriental Medicine）'
        })
      })

      it('应该返回考试信息对象', () => {
        const exam = examStore.currentExam

        // 验证返回的对象包含所有必要字段
        expect(exam).toHaveProperty('type')
        expect(exam).toHaveProperty('name')
        expect(exam).toHaveProperty('fullName')
        expect(exam).toHaveProperty('description')
      })
    })

    describe('isCale', () => {
      it('当 currentExamType 是 cale 时应该返回 true', () => {
        examStore.currentExamType = 'cale'

        expect(examStore.isCale).toBe(true)
      })

      it('当 currentExamType 是 nccaom 时应该返回 false', () => {
        examStore.currentExamType = 'nccaom'

        expect(examStore.isCale).toBe(false)
      })
    })

    describe('isNccaom', () => {
      it('当 currentExamType 是 nccaom 时应该返回 true', () => {
        examStore.currentExamType = 'nccaom'

        expect(examStore.isNccaom).toBe(true)
      })

      it('当 currentExamType 是 cale 时应该返回 false', () => {
        examStore.currentExamType = 'cale'

        expect(examStore.isNccaom).toBe(false)
      })
    })
  })

  describe('actions', () => {
    describe('setExamType', () => {
      it('应该设置 examType 为 cale', () => {
        examStore.setExamType('cale')

        expect(examStore.currentExamType).toBe('cale')
      })

      it('应该设置 examType 为 nccaom', () => {
        examStore.setExamType('nccaom')

        expect(examStore.currentExamType).toBe('nccaom')
      })

      it('应该保存到 localStorage', () => {
        examStore.setExamType('nccaom')

        expect(localStorageMock.getItem('examType')).toBe('nccaom')
      })

      it('应该在切换考试类型时更新 localStorage', () => {
        examStore.setExamType('cale')
        expect(localStorageMock.getItem('examType')).toBe('cale')

        examStore.setExamType('nccaom')
        expect(localStorageMock.getItem('examType')).toBe('nccaom')
      })
    })

    describe('initExamType', () => {
      it('应该从 localStorage 恢复 cale', () => {
        localStorageMock.setItem('examType', 'cale')

        examStore.initExamType()

        expect(examStore.currentExamType).toBe('cale')
      })

      it('应该从 localStorage 恢复 nccaom', () => {
        localStorageMock.setItem('examType', 'nccaom')

        examStore.initExamType()

        expect(examStore.currentExamType).toBe('nccaom')
      })

      it('应该在 localStorage 为空时保持默认值', () => {
        // localStorage 是空的
        examStore.initExamType()

        // 应该保持默认的 'cale'
        expect(examStore.currentExamType).toBe('cale')
      })

      it('应该在 localStorage 有无效值时保持默认值', () => {
        localStorageMock.setItem('examType', 'invalid')

        examStore.initExamType()

        // 应该保持默认的 'cale'，因为 'invalid' 不是有效的 examType
        expect(examStore.currentExamType).toBe('cale')
      })

      it('应该忽略非 cale/nccaom 的值', () => {
        localStorageMock.setItem('examType', 'some-random-value')

        examStore.initExamType()

        expect(examStore.currentExamType).toBe('cale')
      })
    })
  })

  describe('完整工作流', () => {
    it('应该支持完整的设置-初始化流程', () => {
      // 1. 清空 localStorage 并重置 store
      localStorageMock.clear()
      setActivePinia(createPinia())
      const freshStore = useExamStore()

      // 2. 设置考试类型
      freshStore.setExamType('nccaom')
      expect(freshStore.currentExamType).toBe('nccaom')
      expect(freshStore.isNccaom).toBe(true)
      expect(localStorageMock.getItem('examType')).toBe('nccaom')

      // 3. 模拟页面刷新 - 创建新的 Pinia 实例
      setActivePinia(createPinia())
      const afterRefreshStore = useExamStore()

      // 新 store 应该是默认值
      expect(afterRefreshStore.currentExamType).toBe('cale')

      // 4. 初始化（从 localStorage 恢复）
      afterRefreshStore.initExamType()
      expect(afterRefreshStore.currentExamType).toBe('nccaom')
      expect(afterRefreshStore.isNccaom).toBe(true)
    })

    it('应该在切换多次后正确保存最后的值', () => {
      examStore.setExamType('nccaom')
      examStore.setExamType('cale')
      examStore.setExamType('nccaom')
      examStore.setExamType('cale')

      expect(examStore.currentExamType).toBe('cale')
      expect(localStorageMock.getItem('examType')).toBe('cale')
    })
  })

  describe('边界情况', () => {
    it('应该处理 localStorage 中的空字符串', () => {
      localStorageMock.setItem('examType', '')

      examStore.initExamType()

      // 空字符串不是有效的 examType，应该保持默认值
      expect(examStore.currentExamType).toBe('cale')
    })

    it('应该正确处理多个 store 实例', () => {
      const store1 = useExamStore()
      const store2 = useExamStore()

      // Pinia 应该返回同一个实例
      expect(store1).toBe(store2)

      store1.setExamType('nccaom')
      expect(store2.currentExamType).toBe('nccaom')
    })
  })

  describe('process.client 检查', () => {
    it('应该在 process.client 为 true 时操作 localStorage', () => {
      // process.client 已在全局设置为 true
      examStore.setExamType('nccaom')

      expect(localStorageMock.getItem('examType')).toBe('nccaom')
    })

    it('应该在 process.client 为 false 时跳过 localStorage', () => {
      // 临时设置为 false
      Object.defineProperty(process, 'client', {
        value: false,
        writable: true,
        configurable: true
      })

      examStore.setExamType('nccaom')

      // state 应该更新
      expect(examStore.currentExamType).toBe('nccaom')

      // 但 localStorage 不应该被调用
      expect(localStorageMock.getItem('examType')).toBeNull()

      // 恢复为 true
      Object.defineProperty(process, 'client', {
        value: true,
        writable: true,
        configurable: true
      })
    })
  })
})
