import type { ExamConfigProvider } from '../../../types/exam-configs'
import { NCCAAOMockExamConfig } from './mock-exam-config'
import { nccaomQuestionGenerator } from './question-generator'
import { nccaomScoringRules } from './scoring-rules'

/**
 * NCCAOM 考试配置提供者
 * 集中管理所有 NCCAOM 相关的配置和逻辑
 */
export const nccaomExamConfig: ExamConfigProvider = {
  examType: 'nccaom',
  mockExamConfig: NCCAAOMockExamConfig,
  questionGenerator: nccaomQuestionGenerator,
  scoringRules: nccaomScoringRules
}

// 便捷导出
export { NCCAAOMockExamConfig } from './mock-exam-config'
export { nccaomQuestionGenerator } from './question-generator'
export { nccaomScoringRules } from './scoring-rules'
