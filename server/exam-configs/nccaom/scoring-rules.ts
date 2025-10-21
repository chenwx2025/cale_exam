import type { ScoringRules } from '../../../types/exam-configs'

/**
 * NCCAOM 评分规则
 * 实现 NCCAOM 考试特定的评分逻辑
 */
class NCCAAOMScoringRules implements ScoringRules {
  /**
   * 计算 NCCAOM 考试分数
   * NCCAOM 使用标准化评分，每题1分，70分及格
   */
  calculateScore(answers: any[]) {
    let correctCount = 0
    let wrongCount = 0
    const breakdown: Record<string, any> = {
      byModule: {}
    }

    // 统计各题得分
    for (const answer of answers) {
      const isCorrect = answer.userAnswer === answer.question?.correctAnswer

      if (isCorrect) {
        correctCount++
      } else {
        wrongCount++
      }

      // 按 Module 统计
      const moduleCode = answer.question?.category?.code
      if (moduleCode) {
        if (!breakdown.byModule[moduleCode]) {
          breakdown.byModule[moduleCode] = {
            total: 0,
            correct: 0,
            wrong: 0,
            percentage: 0
          }
        }
        breakdown.byModule[moduleCode].total++
        if (isCorrect) {
          breakdown.byModule[moduleCode].correct++
        } else {
          breakdown.byModule[moduleCode].wrong++
        }
      }
    }

    // 计算每个 Module 的得分率
    for (const moduleCode in breakdown.byModule) {
      const module = breakdown.byModule[moduleCode]
      module.percentage = module.total > 0
        ? Math.round((module.correct / module.total) * 100)
        : 0
    }

    // NCCAOM 总分 = 正确题目数
    const totalScore = correctCount

    // 计算百分比
    const percentage = answers.length > 0
      ? Math.round((correctCount / answers.length) * 100)
      : 0

    // 判断是否通过 (70分及格，假设总分100)
    const passed = totalScore >= 70

    // NCCAOM 特定：计算标准分 (scaled score 300-800，及格线500)
    const scaledScore = this.calculateScaledScore(correctCount, answers.length)

    return {
      totalScore,
      correctCount,
      wrongCount,
      breakdown: {
        ...breakdown,
        percentage,
        passed,
        passingScore: 70,
        totalQuestions: answers.length,
        scaledScore,  // NCCAOM 特有的标准分
        performanceLevel: this.getPerformanceLevel(percentage)
      }
    }
  }

  /**
   * NCCAOM 特定：计算标准分 (300-800分制)
   * 这是一个简化的模拟，实际 NCCAOM 使用更复杂的心理测量学方法
   */
  private calculateScaledScore(correctCount: number, totalQuestions: number): number {
    const rawPercentage = totalQuestions > 0 ? correctCount / totalQuestions : 0

    // 将原始百分比映射到 300-800 分制
    // 及格线 70% 对应 500 分
    const minScore = 300
    const maxScore = 800
    const passingScore = 500
    const passingPercentage = 0.7

    let scaledScore: number

    if (rawPercentage >= passingPercentage) {
      // 70%-100% 映射到 500-800
      const range = maxScore - passingScore
      const percentageAbovePassing = (rawPercentage - passingPercentage) / (1 - passingPercentage)
      scaledScore = passingScore + (range * percentageAbovePassing)
    } else {
      // 0%-70% 映射到 300-500
      const range = passingScore - minScore
      const percentageBelowPassing = rawPercentage / passingPercentage
      scaledScore = minScore + (range * percentageBelowPassing)
    }

    return Math.round(scaledScore)
  }

  /**
   * NCCAOM 特定：获取表现等级
   */
  private getPerformanceLevel(percentage: number): string {
    if (percentage >= 90) return 'Excellent'
    if (percentage >= 80) return 'Very Good'
    if (percentage >= 70) return 'Good'
    if (percentage >= 60) return 'Fair'
    return 'Needs Improvement'
  }
}

// 导出单例实例
export const nccaomScoringRules = new NCCAAOMScoringRules()
