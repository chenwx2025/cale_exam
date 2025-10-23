import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

/**
 * 获取用户积分信息
 * GET /api/points
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  try {
    const query = getQuery(event)
    const examType = (query.examType as string) || 'all' // 支持 examType 参数

    // 获取或创建用户积分记录（按考试类型）
    let userPoints = await prisma.userPoints.findUnique({
      where: {
        userId_examType: {
          userId,
          examType
        }
      }
    })

    if (!userPoints) {
      userPoints = await prisma.userPoints.create({
        data: { userId, examType }
      })
    }

    // 计算当前排名（按考试类型）
    const higherRanked = await prisma.userPoints.count({
      where: {
        examType,
        totalPoints: { gt: userPoints.totalPoints }
      }
    })
    const currentRank = higherRanked + 1

    // 更新排名（如果变化）
    if (currentRank !== userPoints.currentRank) {
      await prisma.userPoints.update({
        where: {
          userId_examType: {
            userId,
            examType
          }
        },
        data: {
          previousRank: userPoints.currentRank,
          currentRank
        }
      })
    }

    // 获取周排行前10（按考试类型）
    const weeklyTop = await prisma.userPoints.findMany({
      where: { examType },
      take: 10,
      orderBy: { weeklyPoints: 'desc' },
      include: {
        _count: true
      }
    })

    // 获取用户在周榜的排名（按考试类型）
    const weeklyHigherRanked = await prisma.userPoints.count({
      where: {
        examType,
        weeklyPoints: { gt: userPoints.weeklyPoints }
      }
    })
    const weeklyRank = weeklyHigherRanked + 1

    return {
      success: true,
      points: {
        total: userPoints.totalPoints,
        weekly: userPoints.weeklyPoints,
        monthly: userPoints.monthlyPoints,
        rank: currentRank,
        previousRank: userPoints.previousRank,
        weeklyRank
      },
      stats: {
        questionsAnswered: userPoints.questionsAnswered,
        correctAnswers: userPoints.correctAnswers,
        studyTimeMinutes: userPoints.studyTimeMinutes,
        streakDays: userPoints.streakDays,
        lastActivityAt: userPoints.lastActivityAt
      },
      weeklyLeaderboard: weeklyTop.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        points: entry.weeklyPoints,
        isCurrentUser: entry.userId === userId
      }))
    }
  } catch (error: any) {
    console.error('获取积分信息失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取积分信息失败'
    })
  }
})
