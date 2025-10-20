import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: '缺少考试ID'
      })
    }

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            question: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc' // Maintain question order
          }
        }
      }
    })

    if (!exam) {
      throw createError({
        statusCode: 404,
        message: '考试不存在'
      })
    }

    // If exam is not started, start it now
    if (exam.status === 'not_started') {
      await prisma.exam.update({
        where: { id },
        data: {
          status: 'in_progress',
          startedAt: new Date()
        }
      })
      exam.status = 'in_progress'
      exam.startedAt = new Date()
    }

    // Hide correct answers if exam is in progress (not completed)
    if (exam.status === 'in_progress') {
      exam.answers = exam.answers.map(answer => ({
        ...answer,
        question: {
          ...answer.question,
          correctAnswer: '', // Hide correct answer
          explanation: '' // Hide explanation
        }
      }))
    }

    return {
      success: true,
      exam
    }
  } catch (error: any) {
    console.error('Get exam error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '获取考试失败'
    })
  }
})
