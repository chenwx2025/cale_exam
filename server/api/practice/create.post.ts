import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, questionIds, categoryId, mode, title } = body

    if (!userId || !questionIds || questionIds.length === 0) {
      throw createError({
        statusCode: 400,
        message: '缺少必填参数'
      })
    }

    // 创建一个练习session（复用Exam模型，但标记为practice模式）
    const practice = await prisma.exam.create({
      data: {
        userId,
        examType: 'cale',
        title: title || `练习 - ${questionIds.length}题`,
        categoryId: categoryId || null,
        questionCount: questionIds.length,
        duration: Math.max(questionIds.length * 2, 30), // 每题2分钟，最少30分钟
        difficulty: 'mixed',
        status: 'not_started',
        totalScore: questionIds.length,
        answers: {
          create: questionIds.map((questionId: string) => ({
            questionId
          }))
        }
      }
    })

    return {
      success: true,
      practiceId: practice.id,
      message: '练习创建成功'
    }
  } catch (error: any) {
    console.error('Create practice error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '创建练习失败'
    })
  }
})
