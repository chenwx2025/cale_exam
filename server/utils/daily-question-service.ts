import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 智能选题服务 - 为学习小组选择每日一题
 */
export async function selectDailyQuestion(groupId: string): Promise<string | null> {
  try {
    console.log(`[DailyQuestion] 开始为小组 ${groupId} 选择每日一题`)

    // 1. 获取小组配置
    const config = await prisma.studyGroupDailyQuestionConfig.findUnique({
      where: { groupId }
    })

    if (!config || !config.enabled) {
      console.log(`[DailyQuestion] 小组 ${groupId} 未启用自动生成`)
      return null
    }

    // 2. 获取小组信息（examType）
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      select: { examType: true }
    })

    if (!group) {
      console.log(`[DailyQuestion] 小组 ${groupId} 不存在`)
      return null
    }

    // 3. 获取最近出现过的题目ID（排除重复）
    const excludeRecent = config.excludeRecent || 7
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - excludeRecent)
    const recentDateStr = recentDate.toISOString().split('T')[0]

    const recentQuestions = await prisma.studyGroupDailyQuestion.findMany({
      where: {
        groupId,
        questionDate: { gte: recentDateStr }
      },
      select: { questionId: true }
    })

    const excludeQuestionIds = recentQuestions.map(q => q.questionId)
    console.log(`[DailyQuestion] 排除最近${excludeRecent}天的${excludeQuestionIds.length}道题目`)

    // 4. 获取小组成员ID
    const members = await prisma.studyGroupMember.findMany({
      where: { groupId, isActive: true },
      select: { userId: true }
    })

    const memberIds = members.map(m => m.userId)
    console.log(`[DailyQuestion] 小组有${memberIds.length}名活跃成员`)

    // 5. 如果启用了"优先错题"，获取成员错题统计
    let weakDomains: string[] = []
    if (config.prioritizeWeak && memberIds.length > 0) {
      weakDomains = await getWeakDomains(memberIds)
      console.log(`[DailyQuestion] 成员薄弱领域:`, weakDomains)
    }

    // 6. 解析关注领域
    let focusDomains: string[] = []
    if (config.focusDomains) {
      try {
        focusDomains = JSON.parse(config.focusDomains)
      } catch (e) {
        console.error(`[DailyQuestion] 解析focusDomains失败:`, e)
      }
    }

    // 7. 构建查询条件
    const whereConditions: any = {
      examType: group.examType,
      id: { notIn: excludeQuestionIds }
    }

    // 优先选择薄弱领域或关注领域
    const targetDomains = weakDomains.length > 0 ? weakDomains : focusDomains
    if (targetDomains.length > 0) {
      whereConditions.domain = { in: targetDomains }
    }

    // 8. 根据难度配置筛选
    if (config.difficulty && config.difficulty !== 'mixed') {
      whereConditions.difficulty = config.difficulty
    }

    // 9. 查询候选题目
    let candidates = await prisma.question.findMany({
      where: whereConditions,
      select: { id: true, domain: true, difficulty: true },
      take: 50 // 获取50道候选题目
    })

    console.log(`[DailyQuestion] 找到${candidates.length}道候选题目`)

    // 10. 如果候选题目不足，放宽条件重新查询
    if (candidates.length === 0) {
      console.log(`[DailyQuestion] 候选题目不足，放宽条件重新查询`)
      candidates = await prisma.question.findMany({
        where: {
          examType: group.examType,
          id: { notIn: excludeQuestionIds }
        },
        select: { id: true, domain: true, difficulty: true },
        take: 50
      })
      console.log(`[DailyQuestion] 放宽条件后找到${candidates.length}道候选题目`)
    }

    if (candidates.length === 0) {
      console.log(`[DailyQuestion] 没有可用的题目`)
      return null
    }

    // 11. 随机选择一道题目
    const randomIndex = Math.floor(Math.random() * candidates.length)
    const selectedQuestion = candidates[randomIndex]

    console.log(`[DailyQuestion] 选中题目: ${selectedQuestion.id} (${selectedQuestion.domain}, ${selectedQuestion.difficulty})`)

    return selectedQuestion.id
  } catch (error) {
    console.error('[DailyQuestion] 选题失败:', error)
    return null
  }
}

/**
 * 获取成员薄弱领域
 */
async function getWeakDomains(userIds: string[]): Promise<string[]> {
  try {
    // 查询用户错题记录
    const wrongAnswers = await prisma.examResult.findMany({
      where: {
        userId: { in: userIds },
        score: { lt: 60 } // 分数低于60分的考试
      },
      select: {
        answers: true
      },
      take: 100
    })

    // 统计每个领域的错误率
    const domainStats: Map<string, { total: number; wrong: number }> = new Map()

    for (const result of wrongAnswers) {
      if (!result.answers) continue

      let answers: any
      try {
        answers = typeof result.answers === 'string'
          ? JSON.parse(result.answers)
          : result.answers
      } catch (e) {
        continue
      }

      if (Array.isArray(answers)) {
        for (const answer of answers) {
          if (answer.domain) {
            const stats = domainStats.get(answer.domain) || { total: 0, wrong: 0 }
            stats.total++
            if (!answer.isCorrect) {
              stats.wrong++
            }
            domainStats.set(answer.domain, stats)
          }
        }
      }
    }

    // 计算错误率并排序
    const domainErrorRates: Array<{ domain: string; rate: number }> = []
    for (const [domain, stats] of domainStats.entries()) {
      if (stats.total > 0) {
        domainErrorRates.push({
          domain,
          rate: stats.wrong / stats.total
        })
      }
    }

    // 按错误率降序排序，取前3个
    domainErrorRates.sort((a, b) => b.rate - a.rate)
    const weakDomains = domainErrorRates.slice(0, 3).map(d => d.domain)

    return weakDomains
  } catch (error) {
    console.error('[DailyQuestion] 获取薄弱领域失败:', error)
    return []
  }
}

/**
 * 为小组生成每日一题
 */
export async function generateDailyQuestionForGroup(groupId: string): Promise<boolean> {
  try {
    console.log(`[DailyQuestion] 为小组 ${groupId} 生成每日一题`)

    // 检查今天是否已经有题目
    const today = new Date().toISOString().split('T')[0]
    const existing = await prisma.studyGroupDailyQuestion.findUnique({
      where: {
        groupId_questionDate: {
          groupId,
          questionDate: today
        }
      }
    })

    if (existing) {
      console.log(`[DailyQuestion] 小组 ${groupId} 今天已有每日一题`)
      return false
    }

    // 选择题目
    const questionId = await selectDailyQuestion(groupId)
    if (!questionId) {
      console.log(`[DailyQuestion] 未能为小组 ${groupId} 选择题目`)
      return false
    }

    // 创建每日一题记录
    await prisma.studyGroupDailyQuestion.create({
      data: {
        groupId,
        questionId,
        questionDate: today
      }
    })

    console.log(`[DailyQuestion] ✅ 成功为小组 ${groupId} 生成每日一题: ${questionId}`)
    return true
  } catch (error) {
    console.error(`[DailyQuestion] 为小组 ${groupId} 生成每日一题失败:`, error)
    return false
  }
}

/**
 * 为所有启用的小组生成每日一题
 */
export async function generateDailyQuestionsForAllGroups(): Promise<void> {
  try {
    console.log('[DailyQuestion] 开始为所有启用的小组生成每日一题')

    // 获取所有启用自动生成的小组
    const configs = await prisma.studyGroupDailyQuestionConfig.findMany({
      where: { enabled: true },
      select: { groupId: true }
    })

    console.log(`[DailyQuestion] 找到${configs.length}个启用自动生成的小组`)

    let successCount = 0
    for (const config of configs) {
      const success = await generateDailyQuestionForGroup(config.groupId)
      if (success) {
        successCount++
      }
      // 避免数据库压力，间隔100ms
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`[DailyQuestion] ✅ 完成! 成功生成 ${successCount}/${configs.length} 个小组的每日一题`)
  } catch (error) {
    console.error('[DailyQuestion] 批量生成每日一题失败:', error)
  }
}
