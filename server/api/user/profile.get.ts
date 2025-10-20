import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 要求用户登录
    const currentUser = requireAuth(event)

    // 查询用户详细信息
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: {
        subscribedExams: {
          where: { isActive: true },
          select: {
            examType: true,
            subscribedAt: true,
            expiresAt: true
          }
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: '用户不存在'
      })
    }

    // 获取用户统计数据
    const [studyPlansCount, examsCount, wrongQuestionsCount] = await Promise.all([
      prisma.studyPlan.count({
        where: { userId: user.id }
      }),
      prisma.exam.count({
        where: { userId: user.id }
      }),
      prisma.wrongQuestion.count({
        where: { userId: user.id }
      })
    ])

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        subscribedExams: user.subscribedExams,
        stats: {
          studyPlans: studyPlansCount,
          exams: examsCount,
          wrongQuestions: wrongQuestionsCount
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Get profile error:', error)
    throw createError({
      statusCode: 500,
      message: '获取用户信息失败'
    })
  }
})
