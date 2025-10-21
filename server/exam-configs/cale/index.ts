import type { ExamConfigProvider } from '../../../types/exam-configs'
import { CALEMockExamConfig } from './mock-exam-config'
import { caleQuestionGenerator } from './question-generator'
import { caleScoringRules } from './scoring-rules'

/**
 * CALE 考试配置提供者
 * 集中管理所有 CALE 相关的配置和逻辑
 */
export const caleExamConfig: ExamConfigProvider = {
  examType: 'cale',
  mockExamConfig: CALEMockExamConfig,
  questionGenerator: caleQuestionGenerator,
  scoringRules: caleScoringRules
}

// 便捷导出
export { CALEMockExamConfig } from './mock-exam-config'
export { caleQuestionGenerator } from './question-generator'
export { caleScoringRules } from './scoring-rules'
