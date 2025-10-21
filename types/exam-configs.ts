/**
 * 考试配置类型定义
 * 用于统一不同考试类型的配置接口
 */

export type ExamType = 'cale' | 'nccaom'

/**
 * Domain/Module 分布配置
 */
export interface DomainDistribution {
  [domainCode: string]: number  // domain代码 -> 占比百分比
}

/**
 * 模拟考试配置接口
 */
export interface MockExamConfig {
  examType: ExamType
  totalQuestions: number
  duration: number  // 分钟
  domainDistribution: DomainDistribution
  passingScore?: number  // 及格分数
  metadata?: Record<string, any>  // 额外元数据
}

/**
 * 题目生成器接口
 */
export interface QuestionGenerator {
  /**
   * 生成题目ID列表
   * @param config 考试配置
   * @returns 题目ID数组和分布详情
   */
  generateQuestions(config: MockExamConfig): Promise<{
    questionIds: string[]
    breakdown: Record<string, number>
  }>
}

/**
 * 评分规则接口
 */
export interface ScoringRules {
  /**
   * 计算考试分数
   * @param answers 用户答案
   * @returns 分数和详细信息
   */
  calculateScore(answers: any[]): {
    totalScore: number
    correctCount: number
    wrongCount: number
    breakdown: Record<string, any>
  }
}

/**
 * 考试配置提供者接口
 */
export interface ExamConfigProvider {
  examType: ExamType
  mockExamConfig: MockExamConfig
  questionGenerator: QuestionGenerator
  scoringRules: ScoringRules
}
