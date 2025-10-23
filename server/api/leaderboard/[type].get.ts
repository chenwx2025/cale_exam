import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

/**
 * 获取排行榜
 * GET /api/leaderboard/:type
 * type: all_time | weekly | monthly
 */
export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const type = getRouterParam(event, 'type') || 'all_time'

  if (!['all_time', 'weekly', 'monthly'].includes(type)) {
    throw createError({
      statusCode: 400,
      message: '无效的排行榜类型'
    })
  }

  try {
    const query = getQuery(event)
    const limit = Math.min(parseInt(query.limit as string) || 100, 100)
    const offset = parseInt(query.offset as string) || 0
    const examType = (query.examType as string) || 'all' // 支持 examType 参数

    // 根据类型选择排序字段
    let orderByField: 'totalPoints' | 'weeklyPoints' | 'monthlyPoints'
    if (type === 'weekly') {
      orderByField = 'weeklyPoints'
    } else if (type === 'monthly') {
      orderByField = 'monthlyPoints'
    } else {
      orderByField = 'totalPoints'
    }

    // 获取排行榜数据（按考试类型过滤）
    const leaderboard = await prisma.userPoints.findMany({
      where: {
        examType // 按考试类型过滤
      },
      take: limit,
      skip: offset,
      orderBy: { [orderByField]: 'desc' },
      select: {
        userId: true,
        examType: true,
        totalPoints: true,
        weeklyPoints: true,
        monthlyPoints: true,
        questionsAnswered: true,
        correctAnswers: true,
        studyTimeMinutes: true,
        streakDays: true
      }
    })

    // 获取用户信息（通过单独查询避免性能问题）
    const userIds = leaderboard.map(entry => entry.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true
      }
    })

    const userMap = new Map(users.map(u => [u.id, u]))

    // 合并数据
    const result = leaderboard.map((entry, index) => {
      const user = userMap.get(entry.userId)
      const points = type === 'weekly'
        ? entry.weeklyPoints
        : type === 'monthly'
        ? entry.monthlyPoints
        : entry.totalPoints

      return {
        rank: offset + index + 1,
        userId: entry.userId,
        username: user?.nickname || user?.name || '未知用户',
        avatar: user?.avatar,
        points,
        stats: {
          questionsAnswered: entry.questionsAnswered,
          correctAnswers: entry.correctAnswers,
          studyTimeMinutes: entry.studyTimeMinutes,
          streakDays: entry.streakDays
        },
        isCurrentUser: entry.userId === userId
      }
    })

    // 获取当前用户的排名（按考试类型）
    const userPoints = await prisma.userPoints.findUnique({
      where: {
        userId_examType: {
          userId,
          examType
        }
      }
    })

    let currentUserRank = null
    if (userPoints) {
      const higherRanked = await prisma.userPoints.count({
        where: {
          examType,
          [orderByField]: { gt: userPoints[orderByField] }
        }
      })
      currentUserRank = higherRanked + 1
    }

    return {
      success: true,
      type,
      examType, // 返回考试类型
      leaderboard: result,
      currentUser: {
        rank: currentUserRank,
        userId,
        points: userPoints?.[orderByField] || 0
      },
      pagination: {
        limit,
        offset,
        total: await prisma.userPoints.count({ where: { examType } })
      }
    }
  } catch (error: any) {
    console.error('获取排行榜失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取排行榜失败'
    })
  }
})
