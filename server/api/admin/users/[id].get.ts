import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/admin-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const userId = event.context.params?.id

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }

    // 获取用户详细信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscribedExams: {
          select: {
            id: true,
            examType: true,
            isActive: true,
            subscribedAt: true,
            expiresAt: true
          }
        },
        _count: {
          select: {
            userAnswers: true,
            exams: true,
            studyPlans: true,
            wrongQuestions: true,
            studySessions: true
          }
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // 获取详细统计数据
    const [
      examStats,
      recentExams,
      studyPlanStats,
      recentStudySessions,
      answerStats
    ] = await Promise.all([
      // 考试统计
      prisma.exam.groupBy({
        by: ['status', 'examType'],
        where: { userId },
        _count: true
      }),

      // 最近的考试
      prisma.exam.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          examType: true,
          status: true,
          score: true,
          percentage: true,
          passed: true,
          createdAt: true,
          completedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // 学习计划统计
      prisma.studyPlan.groupBy({
        by: ['isActive', 'examType'],
        where: { userId },
        _count: true
      }),

      // 最近学习会话
      prisma.studySession.findMany({
        where: { userId },
        select: {
          id: true,
          examType: true,
          type: true,
          startTime: true,
          endTime: true,
          duration: true,
          questionsCount: true,
          correctCount: true
        },
        orderBy: { startTime: 'desc' },
        take: 10
      }),

      // 答题统计
      prisma.userAnswer.groupBy({
        by: ['isCorrect'],
        where: { userId },
        _count: true
      })
    ])

    // 格式化统计数据
    const stats = {
      answers: {
        total: user._count.userAnswers,
        correct: answerStats.find(s => s.isCorrect)?._count || 0,
        wrong: answerStats.find(s => !s.isCorrect)?._count || 0,
        accuracy: user._count.userAnswers > 0
          ? Math.round(((answerStats.find(s => s.isCorrect)?._count || 0) / user._count.userAnswers) * 100)
          : 0
      },
      exams: {
        total: user._count.exams,
        byStatus: examStats.reduce((acc, stat) => {
          acc[stat.status] = (acc[stat.status] || 0) + stat._count
          return acc
        }, {} as Record<string, number>),
        byExamType: examStats.reduce((acc, stat) => {
          acc[stat.examType] = (acc[stat.examType] || 0) + stat._count
          return acc
        }, {} as Record<string, number>)
      },
      studyPlans: {
        total: user._count.studyPlans,
        active: studyPlanStats.filter(s => s.isActive).reduce((sum, s) => sum + s._count, 0),
        completed: studyPlanStats.filter(s => !s.isActive).reduce((sum, s) => sum + s._count, 0)
      },
      wrongQuestions: {
        total: user._count.wrongQuestions
      },
      studySessions: {
        total: user._count.studySessions
      }
    }

    // 移除密码字段
    const { password, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        ...userWithoutPassword,
        stats,
        recentExams,
        recentStudySessions
      }
    }
  } catch (error: any) {
    console.error('Admin get user detail error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user details'
    })
  }
})
