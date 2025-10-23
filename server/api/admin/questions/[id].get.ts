import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const questionId = getRouterParam(event, 'id')

    if (!questionId) {
      throw createError({
        statusCode: 400,
        message: 'Question ID is required'
      })
    }

    // 查询题目详情
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            code: true,
            type: true
          }
        },
        _count: {
          select: {
            userAnswers: true,
            wrongQuestions: true
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

    // 计算答题统计
    const answers = await prisma.userAnswer.findMany({
      where: { questionId },
      select: { isCorrect: true }
    })

    const totalAnswers = answers.length
    const correctAnswers = answers.filter(a => a.isCorrect).length
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

    return {
      success: true,
      question: {
        ...question,
        stats: {
          totalAnswers,
          correctAnswers,
          wrongAnswers: totalAnswers - correctAnswers,
          accuracy,
          wrongQuestionCount: question._count.wrongQuestions
        }
      }
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    console.error('Get question detail error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get question detail: ' + error.message
    })
  }
})
