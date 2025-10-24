import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const query = getQuery(event)

  const { period = '30' } = query // 统计周期，默认30天

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    // 检查是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能查看统计数据'
      })
    }

    // 计算日期范围
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period as string))

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // 获取周期内的每日一题
    const dailyQuestions = await prisma.studyGroupDailyQuestion.findMany({
      where: {
        groupId,
        questionDate: {
          gte: startDateStr,
          lte: endDateStr
        }
      },
      include: {
        question: {
          include: {
            domain: true
          }
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                nickname: true
              }
            }
          }
        }
      },
      orderBy: {
        questionDate: 'desc'
      }
    })

    // 统计总数据
    const totalQuestions = dailyQuestions.length
    const totalAnswers = dailyQuestions.reduce((sum, dq) => sum + dq.answers.length, 0)
    const totalCorrectAnswers = dailyQuestions.reduce(
      (sum, dq) => sum + dq.answers.filter(a => a.isCorrect).length,
      0
    )
    const overallCorrectRate = totalAnswers > 0 ? (totalCorrectAnswers / totalAnswers) * 100 : 0

    // 统计用户参与情况
    const userStats = new Map<string, {
      userId: string
      user: any
      totalAnswered: number
      correctAnswers: number
      correctRate: number
      totalTimeSpent: number
      averageTimeSpent: number
    }>()

    dailyQuestions.forEach(dq => {
      dq.answers.forEach(answer => {
        if (!userStats.has(answer.userId)) {
          userStats.set(answer.userId, {
            userId: answer.userId,
            user: answer.user,
            totalAnswered: 0,
            correctAnswers: 0,
            correctRate: 0,
            totalTimeSpent: 0,
            averageTimeSpent: 0
          })
        }
        const stats = userStats.get(answer.userId)!
        stats.totalAnswered++
        if (answer.isCorrect) stats.correctAnswers++
        stats.totalTimeSpent += answer.timeSpent || 0
      })
    })

    // 计算正确率和平均用时
    userStats.forEach(stats => {
      stats.correctRate = stats.totalAnswered > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswered) * 10000) / 100
        : 0
      stats.averageTimeSpent = stats.totalAnswered > 0
        ? Math.round(stats.totalTimeSpent / stats.totalAnswered)
        : 0
    })

    // 排行榜 - 按正确数量排序
    const leaderboardByCorrect = Array.from(userStats.values())
      .sort((a, b) => b.correctAnswers - a.correctAnswers)
      .slice(0, 10)

    // 排行榜 - 按正确率排序（至少答题5道）
    const leaderboardByRate = Array.from(userStats.values())
      .filter(s => s.totalAnswered >= 5)
      .sort((a, b) => b.correctRate - a.correctRate)
      .slice(0, 10)

    // 统计各知识点的答题情况
    const domainStats = new Map<string, {
      domainId: string
      domainName: string
      totalQuestions: number
      totalAnswers: number
      correctAnswers: number
      correctRate: number
    }>()

    dailyQuestions.forEach(dq => {
      const domainId = dq.question.domainId
      const domainName = dq.question.domain?.name || '未分类'

      if (!domainStats.has(domainId)) {
        domainStats.set(domainId, {
          domainId,
          domainName,
          totalQuestions: 0,
          totalAnswers: 0,
          correctAnswers: 0,
          correctRate: 0
        })
      }

      const stats = domainStats.get(domainId)!
      stats.totalQuestions++
      stats.totalAnswers += dq.answers.length
      stats.correctAnswers += dq.answers.filter(a => a.isCorrect).length
      stats.correctRate = stats.totalAnswers > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 10000) / 100
        : 0
    })

    // 每日参与趋势
    const dailyTrends = dailyQuestions.map(dq => ({
      date: dq.questionDate,
      totalAnswers: dq.answers.length,
      correctAnswers: dq.answers.filter(a => a.isCorrect).length,
      correctRate: dq.answers.length > 0
        ? Math.round((dq.answers.filter(a => a.isCorrect).length / dq.answers.length) * 10000) / 100
        : 0,
      question: {
        id: dq.question.id,
        text: dq.question.questionText,
        domain: dq.question.domain?.name
      }
    }))

    // 当前用户的统计
    const currentUserStats = userStats.get(user.userId) || {
      userId: user.userId,
      user: null,
      totalAnswered: 0,
      correctAnswers: 0,
      correctRate: 0,
      totalTimeSpent: 0,
      averageTimeSpent: 0
    }

    return {
      success: true,
      data: {
        summary: {
          totalQuestions,
          totalAnswers,
          totalCorrectAnswers,
          overallCorrectRate: Math.round(overallCorrectRate * 100) / 100,
          activeUsers: userStats.size
        },
        currentUserStats,
        leaderboards: {
          byCorrectCount: leaderboardByCorrect,
          byCorrectRate: leaderboardByRate
        },
        domainStats: Array.from(domainStats.values()),
        dailyTrends
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取每日一题统计失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取每日一题统计失败'
    })
  }
})
