import { PrismaClient } from '@prisma/client'
import type { MockExamConfig, QuestionGenerator } from '../../../types/exam-configs'

const prisma = new PrismaClient()

/**
 * CALE 题目生成器
 * 实现 CALE 考试特定的题目选择逻辑
 */
export class CALEQuestionGenerator implements QuestionGenerator {
  /**
   * 根据 CALE 配置生成题目列表
   */
  async generateQuestions(config: MockExamConfig) {
    const selectedQuestionIds: string[] = []
    const breakdown: Record<string, number> = {}

    // 按 Domain 占比从题库中抽取题目
    for (const [domainCode, percentage] of Object.entries(config.domainDistribution)) {
      const questionCount = Math.round((percentage / 100) * config.totalQuestions)

      // 获取该 Domain 的分类
      const category = await prisma.category.findFirst({
        where: {
          code: domainCode,
          examType: 'cale'
        }
      })

      if (!category) {
        console.warn(`[CALE] Category not found for domain: ${domainCode}`)
        continue
      }

      // 获取该 Domain 的所有可用题目
      const availableQuestions = await prisma.question.findMany({
        where: {
          examType: 'cale',
          categoryId: category.id
        },
        select: {
          id: true
        }
      })

      if (availableQuestions.length < questionCount) {
        throw new Error(
          `[CALE] ${domainCode} 题目不足：需要 ${questionCount} 道，但只有 ${availableQuestions.length} 道`
        )
      }

      // CALE 特定逻辑：随机抽取题目
      const shuffled = this.shuffleArray(availableQuestions)
      const selected = shuffled.slice(0, questionCount)

      selectedQuestionIds.push(...selected.map(q => q.id))
      breakdown[domainCode] = questionCount
    }

    return {
      questionIds: selectedQuestionIds,
      breakdown
    }
  }

  /**
   * 洗牌算法 - Fisher-Yates shuffle
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

// 导出单例实例
export const caleQuestionGenerator = new CALEQuestionGenerator()
