import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    // 获取过去30天的数据
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // 1. 用户增长趋势（过去30天）
    const userGrowth = await prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM User
      WHERE createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `

    // 2. 每日活跃用户（基于考试和答题记录）
    const dailyActiveUsers = await prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        COUNT(DISTINCT userId) as count
      FROM (
        SELECT userId, createdAt FROM Exam WHERE createdAt >= ${thirtyDaysAgo}
        UNION ALL
        SELECT userId, createdAt FROM UserAnswer WHERE createdAt >= ${thirtyDaysAgo}
      ) combined
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `

    // 3. 题目难度分布
    const difficultyDistribution = await prisma.question.groupBy({
      by: ['difficulty', 'examType'],
      _count: {
        id: true
      }
    })

    // 4. 分类题目数量（Top 10）
    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        questions: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // 5. 考试通过率趋势
    const examPassRate = await prisma.exam.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: {
        status: {
          in: ['completed', 'graded']
        }
      }
    })

    // 6. 每日考试数量
    const dailyExams = await prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM Exam
      WHERE createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `

    // 7. 用户订阅分布
    const subscriptionStats = await prisma.userExamSubscription.groupBy({
      by: ['examType', 'status'],
      _count: {
        id: true
      }
    })

    // 8. 题目答题统计（正确率最低的10个题目）
    const lowAccuracyQuestions = await prisma.question.findMany({
      select: {
        id: true,
        question: true,
        examType: true,
        difficulty: true,
        _count: {
          select: {
            userAnswers: true
          }
        }
      },
      where: {
        userAnswers: {
          some: {}
        }
      },
      orderBy: {
        userAnswers: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // 9. 管理员操作日志统计
    const adminActivityStats = await prisma.adminLog.groupBy({
      by: ['action'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    return {
      success: true,
      data: {
        userGrowth,
        dailyActiveUsers,
        difficultyDistribution,
        categoryStats: categoryStats.map(cat => ({
          id: cat.id,
          name: cat.name,
          code: cat.code,
          examType: cat.examType,
          questionCount: cat._count.questions
        })),
        examPassRate,
        dailyExams,
        subscriptionStats,
        lowAccuracyQuestions,
        adminActivityStats
      }
    }
  } catch (error: any) {
    console.error('Admin analytics error:', error)

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch analytics data'
    })
  }
})
