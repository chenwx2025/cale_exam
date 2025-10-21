import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const questionId = event.context.params?.id

    if (!questionId) {
      throw createError({
        statusCode: 400,
        message: 'Question ID is required'
      })
    }

    // 获取题目详细信息
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
            examType: true
          }
        },
        _count: {
          select: {
            userAnswers: true,
            wrongQuestions: true,
            studyPlans: true,
            examAnswers: true
          }
        }
      }
    })

    if (!question) {
      throw createError({
        statusCode: 404,
        message: 'Question not found'
      })
    }

    // 获取答题统计
    const answerStats = await prisma.userAnswer.groupBy({
      by: ['isCorrect'],
      where: { questionId },
      _count: true
    })

    const totalAnswers = question._count.userAnswers
    const correctAnswers = answerStats.find(s => s.isCorrect)?._count || 0
    const wrongAnswers = answerStats.find(s => !s.isCorrect)?._count || 0

    return {
      success: true,
      data: {
        ...question,
        stats: {
          totalAnswers,
          correctAnswers,
          wrongAnswers,
          accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
          wrongQuestionsCount: question._count.wrongQuestions,
          inStudyPlansCount: question._count.studyPlans,
          inExamsCount: question._count.examAnswers
        }
      }
    }
  } catch (error: any) {
    console.error('Admin get question detail error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch question details'
    })
  }
})
