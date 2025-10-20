import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, examType, title, categoryId, questionCount, duration, difficulty } = body

    // Validate input
    if (!userId || !examType || !title || !questionCount || !duration) {
      throw createError({
        statusCode: 400,
        message: '缺少必填参数'
      })
    }

    // Build query for fetching questions
    const where: any = {
      examType
    }

    // Filter by category if specified
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Filter by difficulty if not mixed
    if (difficulty && difficulty !== 'mixed') {
      where.difficulty = difficulty
    }

    // Get available questions
    const availableQuestions = await prisma.question.findMany({
      where,
      select: {
        id: true
      }
    })

    // Check if we have enough questions
    if (availableQuestions.length < questionCount) {
      throw createError({
        statusCode: 400,
        message: `题目不足，当前范围仅有 ${availableQuestions.length} 道题目`
      })
    }

    // Randomly select questions
    const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, questionCount)

    // Create exam
    const exam = await prisma.exam.create({
      data: {
        userId,
        examType,
        title,
        categoryId: categoryId || null,
        questionCount,
        duration,
        difficulty: difficulty || 'mixed',
        status: 'not_started',
        totalScore: questionCount, // 1 point per question
        answers: {
          create: selectedQuestions.map((q, index) => ({
            questionId: q.id,
          }))
        }
      },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    })

    return {
      success: true,
      examId: exam.id,
      message: '考试创建成功'
    }
  } catch (error: any) {
    console.error('Create exam error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '创建考试失败'
    })
  }
})
