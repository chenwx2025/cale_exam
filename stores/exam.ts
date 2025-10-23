import { defineStore, skipHydrate } from 'pinia'

export type ExamType = 'cale' | 'nccaom'

export interface ExamInfo {
  type: ExamType
  name: string
  fullName: string
  description: string
}

export const examTypes: Record<ExamType, ExamInfo> = {
  cale: {
    type: 'cale',
    name: 'Cale',
    fullName: '加州中医执照考试',
    description: '加州针灸执照考试（California Acupuncture Licensing Examination）'
  },
  nccaom: {
    type: 'nccaom',
    name: 'NCCAOM',
    fullName: '全国中医针灸认证考试',
    description: '美国国家中医针灸认证委员会（National Certification Commission for Acupuncture and Oriental Medicine）'
  }
}

export const useExamStore = defineStore('exam', {
  state: () => ({
    currentExamType: 'cale' as ExamType
  }),

  getters: {
    currentExam: (state): ExamInfo => {
      // 跳过 SSR 水合以避免序列化问题
      return skipHydrate({ ...examTypes[state.currentExamType] })
    },

    isCale: (state): boolean => {
      return state.currentExamType === 'cale'
    },

    isNccaom: (state): boolean => {
      return state.currentExamType === 'nccaom'
    }
  },

  actions: {
    setExamType(examType: ExamType) {
      this.currentExamType = examType
      // 保存到 localStorage
      if (process.client) {
        localStorage.setItem('examType', examType)
      }
    },

    initExamType() {
      // 从 localStorage 加载
      if (process.client) {
        const saved = localStorage.getItem('examType')
        if (saved && (saved === 'cale' || saved === 'nccaom')) {
          this.currentExamType = saved as ExamType
        }
      }
    }
  }
})
