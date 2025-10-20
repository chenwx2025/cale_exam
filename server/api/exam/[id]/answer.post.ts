import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const examId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { answerId, userAnswer, timeSpent, isMarked } = body

    if (!examId || !answerId) {
      throw createError({
        statusCode: 400,
        message: '缺少必填参数'
      })
    }

    // Update answer
    const answer = await prisma.examAnswer.update({
      where: { id: answerId },
      data: {
        userAnswer: userAnswer || null,
        timeSpent: timeSpent || null,
        isMarked: isMarked !== undefined ? isMarked : undefined
      }
    })

    return {
      success: true,
      answer
    }
  } catch (error: any) {
    console.error('Submit answer error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '提交答案失败'
    })
  }
})
