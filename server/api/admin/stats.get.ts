import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    // 1. 用户统计
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { status: 'active' }
    })
    const adminUsers = await prisma.user.count({
      where: { role: 'admin' }
    })

    // 最近7天新注册用户
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newUsersLast7Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // 2. 题目统计
    const totalQuestions = await prisma.question.count()
    const questionsByExamType = await prisma.question.groupBy({
      by: ['examType'],
      _count: true
    })

    const questionsByDifficulty = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: true
    })

    // 3. 考试统计
    const totalExams = await prisma.exam.count()
    const completedExams = await prisma.exam.count({
      where: { status: 'completed' }
    })
    const inProgressExams = await prisma.exam.count({
      where: { status: 'in_progress' }
    })

    // 4. 订阅统计
    const totalSubscriptions = await prisma.userExamSubscription.count({
      where: { isActive: true }
    })
    const subscriptionsByExamType = await prisma.userExamSubscription.groupBy({
      by: ['examType'],
      where: { isActive: true },
      _count: true
    })

    // 5. 最近注册的用户
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        subscribedExams: {
          where: { isActive: true },
          select: {
            examType: true
          }
        }
      }
    })

    // 6. 最活跃用户 (按答题数量)
    const mostActiveUsers = await prisma.userAnswer.groupBy({
      by: ['userId'],
      _count: true,
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 5
    })

    // 获取活跃用户的详细信息
    const activeUserIds = mostActiveUsers.map(u => u.userId)
    const activeUserDetails = await prisma.user.findMany({
      where: {
        id: {
          in: activeUserIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            userAnswers: true
          }
        }
      }
    })

    // 7. 学习活动统计 (最近30天)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await prisma.studySession.findMany({
      where: {
        startTime: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        startTime: true,
        duration: true,
        questionsCount: true
      }
    })

    // 按天分组统计
    const activityByDay: Record<string, { sessions: number; questions: number }> = {}
    recentActivity.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0]
      if (!activityByDay[date]) {
        activityByDay[date] = { sessions: 0, questions: 0 }
      }
      activityByDay[date].sessions++
      activityByDay[date].questions += session.questionsCount
    })

    return {
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          newLast7Days: newUsersLast7Days,
          recentUsers: recentUsers.map(u => ({
            ...u,
            subscribedExams: u.subscribedExams.map(s => s.examType)
          })),
          mostActive: activeUserDetails
        },
        questions: {
          total: totalQuestions,
          byExamType: questionsByExamType.map(q => ({
            examType: q.examType,
            count: q._count
          })),
          byDifficulty: questionsByDifficulty.map(q => ({
            difficulty: q.difficulty,
            count: q._count
          }))
        },
        exams: {
          total: totalExams,
          completed: completedExams,
          inProgress: inProgressExams
        },
        subscriptions: {
          total: totalSubscriptions,
          byExamType: subscriptionsByExamType.map(s => ({
            examType: s.examType,
            count: s._count
          }))
        },
        activity: {
          last30Days: activityByDay
        }
      }
    }
  } catch (error) {
    console.error('Admin stats error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch admin statistics'
    })
  }
})
