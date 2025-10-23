import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    // 1. 总错题记录数
    const totalWrongQuestions = await prisma.wrongQuestion.count()

    // 2. 独立错题数（不同的题目）
    const uniqueQuestions = await prisma.wrongQuestion.groupBy({
      by: ['questionId'],
      _count: {
        id: true
      }
    })
    const uniqueQuestionCount = uniqueQuestions.length

    // 3. 错题用户数（有错题的用户）
    const uniqueUsers = await prisma.wrongQuestion.groupBy({
      by: ['userId'],
      _count: {
        id: true
      }
    })
    const uniqueUserCount = uniqueUsers.length

    // 4. 平均每个用户错题数
    const avgWrongQuestionsPerUser = uniqueUserCount > 0
      ? Math.round(totalWrongQuestions / uniqueUserCount)
      : 0

    // 5. 按考试类型统计
    const wrongQuestionsByExamType = await prisma.wrongQuestion.findMany({
      include: {
        question: {
          select: {
            examType: true
          }
        }
      }
    })

    const examTypeStats = wrongQuestionsByExamType.reduce((acc, wq) => {
      const examType = wq.question.examType
      if (!acc[examType]) {
        acc[examType] = 0
      }
      acc[examType]++
      return acc
    }, {} as Record<string, number>)

    // 6. 按领域统计
    const wrongQuestionsByDomain = await prisma.wrongQuestion.findMany({
      include: {
        question: {
          select: {
            domain: true
          }
        }
      }
    })

    const domainStats = wrongQuestionsByDomain.reduce((acc, wq) => {
      const domain = wq.question.domain
      if (!acc[domain]) {
        acc[domain] = 0
      }
      acc[domain]++
      return acc
    }, {} as Record<string, number>)

    // 7. 按难度统计
    const wrongQuestionsByDifficulty = await prisma.wrongQuestion.findMany({
      include: {
        question: {
          select: {
            difficulty: true
          }
        }
      }
    })

    const difficultyStats = wrongQuestionsByDifficulty.reduce((acc, wq) => {
      const difficulty = wq.question.difficulty
      if (!acc[difficulty]) {
        acc[difficulty] = 0
      }
      acc[difficulty]++
      return acc
    }, {} as Record<string, number>)

    // 8. 错误次数最多的题目（Top 10）
    const topWrongQuestions = await prisma.wrongQuestion.groupBy({
      by: ['questionId'],
      _sum: {
        errorCount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          errorCount: 'desc'
        }
      },
      take: 10
    })

    // 获取这些题目的详细信息
    const topQuestionIds = topWrongQuestions.map(q => q.questionId)
    const topQuestionDetails = await prisma.question.findMany({
      where: {
        id: {
          in: topQuestionIds
        }
      },
      select: {
        id: true,
        chineseQuestion: true,
        englishQuestion: true,
        domain: true,
        difficulty: true,
        examType: true
      }
    })

    const topWrongQuestionsWithDetails = topWrongQuestions.map(stat => {
      const question = topQuestionDetails.find(q => q.id === stat.questionId)
      return {
        questionId: stat.questionId,
        totalErrors: Number(stat._sum.errorCount || 0),
        userCount: Number(stat._count.id),
        question: question || null
      }
    })

    // 9. 最近30天新增错题
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentWrongQuestions = await prisma.wrongQuestion.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // 10. 已掌握的错题数（errorCount为0或已删除）
    const masteredCount = await prisma.wrongQuestion.count({
      where: {
        isMastered: true
      }
    })

    return {
      success: true,
      data: {
        totalWrongQuestions,
        uniqueQuestionCount,
        uniqueUserCount,
        avgWrongQuestionsPerUser,
        recentWrongQuestions,
        masteredCount,
        examTypeStats: Object.entries(examTypeStats).map(([examType, count]) => ({
          examType,
          count
        })),
        domainStats: Object.entries(domainStats).map(([domain, count]) => ({
          domain,
          count
        })),
        difficultyStats: Object.entries(difficultyStats).map(([difficulty, count]) => ({
          difficulty,
          count
        })),
        topWrongQuestions: topWrongQuestionsWithDetails
      }
    }
  } catch (error: any) {
    console.error('Get wrong questions summary error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get wrong questions summary: ' + error.message
    })
  }
})
