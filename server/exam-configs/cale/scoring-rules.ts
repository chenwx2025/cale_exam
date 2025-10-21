import type { ScoringRules } from '../../../types/exam-configs'

/**
 * CALE 评分规则
 * 实现 CALE 考试特定的评分逻辑
 */
class CALEScoringRules implements ScoringRules {
  /**
   * 计算 CALE 考试分数
   * CALE 使用简单的对错评分，每题1分
   */
  calculateScore(answers: any[]) {
    let correctCount = 0
    let wrongCount = 0
    const breakdown: Record<string, any> = {
      byDomain: {}
    }

    // 统计各题得分
    for (const answer of answers) {
      const isCorrect = answer.userAnswer === answer.question?.correctAnswer

      if (isCorrect) {
        correctCount++
      } else {
        wrongCount++
      }

      // 按 Domain 统计
      const domainCode = answer.question?.category?.code
      if (domainCode) {
        if (!breakdown.byDomain[domainCode]) {
          breakdown.byDomain[domainCode] = {
            total: 0,
            correct: 0,
            wrong: 0
          }
        }
        breakdown.byDomain[domainCode].total++
        if (isCorrect) {
          breakdown.byDomain[domainCode].correct++
        } else {
          breakdown.byDomain[domainCode].wrong++
        }
      }
    }

    // CALE 总分 = 正确题目数
    const totalScore = correctCount

    // 计算百分比
    const percentage = answers.length > 0
      ? Math.round((correctCount / answers.length) * 100)
      : 0

    // 判断是否通过 (70%及格线)
    const passed = percentage >= 70

    return {
      totalScore,
      correctCount,
      wrongCount,
      breakdown: {
        ...breakdown,
        percentage,
        passed,
        passingScore: Math.ceil(answers.length * 0.7), // 70%
        totalQuestions: answers.length
      }
    }
  }
}

// 导出单例实例
export const caleScoringRules = new CALEScoringRules()
