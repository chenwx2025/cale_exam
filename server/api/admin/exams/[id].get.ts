import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    const examId = getRouterParam(event, 'id')

    if (!examId) {
      throw createError({
        statusCode: 400,
        message: 'Exam ID is required'
      })
    }

    // 查询考试详情
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
            avatar: true,
            role: true,
            status: true
          }
        },
        userAnswers: {
          include: {
            question: {
              select: {
                id: true,
                type: true,
                domain: true,
                chineseQuestion: true,
                englishQuestion: true,
                chineseOptions: true,
                englishOptions: true,
                correctAnswer: true,
                difficulty: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            userAnswers: true
          }
        }
      }
    })

    if (!exam) {
      throw createError({
        statusCode: 404,
        message: 'Exam not found'
      })
    }

    // 计算统计数据
    const stats = {
      totalAnswers: exam._count.userAnswers,
      correctCount: exam.userAnswers.filter(a => a.isCorrect).length,
      wrongCount: exam.userAnswers.filter(a => !a.isCorrect).length,
      duration: exam.completedAt && exam.startedAt
        ? Math.round((exam.completedAt.getTime() - exam.startedAt.getTime()) / 1000)
        : null,
      // 按难度统计
      byDifficulty: {
        easy: {
          total: exam.userAnswers.filter(a => a.question.difficulty === 'easy').length,
          correct: exam.userAnswers.filter(a => a.question.difficulty === 'easy' && a.isCorrect).length
        },
        medium: {
          total: exam.userAnswers.filter(a => a.question.difficulty === 'medium').length,
          correct: exam.userAnswers.filter(a => a.question.difficulty === 'medium' && a.isCorrect).length
        },
        hard: {
          total: exam.userAnswers.filter(a => a.question.difficulty === 'hard').length,
          correct: exam.userAnswers.filter(a => a.question.difficulty === 'hard' && a.isCorrect).length
        }
      },
      // 按题型统计
      byType: exam.userAnswers.reduce((acc, answer) => {
        const type = answer.question.type
        if (!acc[type]) {
          acc[type] = { total: 0, correct: 0 }
        }
        acc[type].total++
        if (answer.isCorrect) {
          acc[type].correct++
        }
        return acc
      }, {} as Record<string, { total: number; correct: number }>)
    }

    return {
      success: true,
      exam: {
        ...exam,
        stats
      }
    }
  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    console.error('Get exam detail error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get exam detail: ' + error.message
    })
  }
})
