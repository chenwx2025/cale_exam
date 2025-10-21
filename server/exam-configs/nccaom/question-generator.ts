import { PrismaClient } from '@prisma/client'
import type { MockExamConfig, QuestionGenerator } from '../../../types/exam-configs'

const prisma = new PrismaClient()

/**
 * NCCAOM 题目生成器
 * 实现 NCCAOM 考试特定的题目选择逻辑
 *
 * NCCAOM 可能有不同的题目选择策略，例如：
 * - 按难度分层抽取
 * - 确保每个子主题都被覆盖
 * - 避免连续出现相似题目
 */
export class NCCAAOMQuestionGenerator implements QuestionGenerator {
  /**
   * 根据 NCCAOM 配置生成题目列表
   */
  async generateQuestions(config: MockExamConfig) {
    const selectedQuestionIds: string[] = []
    const breakdown: Record<string, number> = {}

    // 按 Module 占比从题库中抽取题目
    for (const [moduleCode, percentage] of Object.entries(config.domainDistribution)) {
      const questionCount = Math.round((percentage / 100) * config.totalQuestions)

      // 获取该 Module 的分类
      const category = await prisma.category.findFirst({
        where: {
          code: moduleCode,
          examType: 'nccaom'
        }
      })

      if (!category) {
        console.warn(`[NCCAOM] Category not found for module: ${moduleCode}`)
        continue
      }

      // 获取该 Module 的所有可用题目
      const availableQuestions = await prisma.question.findMany({
        where: {
          examType: 'nccaom',
          categoryId: category.id
        },
        select: {
          id: true,
          difficulty: true  // NCCAOM 可能需要考虑难度
        }
      })

      if (availableQuestions.length < questionCount) {
        throw new Error(
          `[NCCAOM] ${moduleCode} 题目不足：需要 ${questionCount} 道，但只有 ${availableQuestions.length} 道`
        )
      }

      // NCCAOM 特定逻辑：按难度分层抽取
      const selected = this.selectByDifficulty(availableQuestions, questionCount)

      selectedQuestionIds.push(...selected.map(q => q.id))
      breakdown[moduleCode] = questionCount
    }

    return {
      questionIds: selectedQuestionIds,
      breakdown
    }
  }

  /**
   * NCCAOM 特定：按难度分层选择题目
   * 确保难度分布合理：简单30%、中等40%、困难30%
   */
  private selectByDifficulty<T extends { id: string; difficulty: string | null }>(
    questions: T[],
    count: number
  ): T[] {
    // 按难度分组
    const easy = questions.filter(q => q.difficulty === 'easy')
    const medium = questions.filter(q => q.difficulty === 'medium')
    const hard = questions.filter(q => q.difficulty === 'hard')
    const unspecified = questions.filter(q => !q.difficulty)

    // 计算每个难度需要的题目数
    const easyCount = Math.round(count * 0.3)
    const mediumCount = Math.round(count * 0.4)
    const hardCount = count - easyCount - mediumCount

    // 从每个难度池中随机抽取
    const selected: T[] = []

    selected.push(...this.shuffleAndTake(easy, easyCount))
    selected.push(...this.shuffleAndTake(medium, mediumCount))
    selected.push(...this.shuffleAndTake(hard, hardCount))

    // 如果某个难度池题目不足，从未指定难度的题目中补充
    const shortage = count - selected.length
    if (shortage > 0) {
      selected.push(...this.shuffleAndTake(unspecified, shortage))
    }

    return selected.slice(0, count)
  }

  /**
   * 洗牌并取前 n 个
   */
  private shuffleAndTake<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, array.length))
  }
}

// 导出单例实例
export const nccaomQuestionGenerator = new NCCAAOMQuestionGenerator()
