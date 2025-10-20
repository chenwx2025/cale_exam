import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const examId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { timeSpent } = body

    if (!examId) {
      throw createError({
        statusCode: 400,
        message: '缺少考试ID'
      })
    }

    // Get exam with answers
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        answers: {
          include: {
            question: true
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

    if (exam.status === 'completed') {
      throw createError({
        statusCode: 400,
        message: '考试已完成，不能重复提交'
      })
    }

    // Calculate scores
    let correctCount = 0

    // Update each answer with correctness
    for (const answer of exam.answers) {
      const isCorrect = answer.userAnswer === answer.question.correctAnswer

      await prisma.examAnswer.update({
        where: { id: answer.id },
        data: { isCorrect }
      })

      if (isCorrect) {
        correctCount++
      }

      // Add to wrong questions if incorrect
      if (!isCorrect && answer.userAnswer) {
        await prisma.wrongQuestion.upsert({
          where: {
            userId_questionId: {
              userId: exam.userId,
              questionId: answer.questionId
            }
          },
          create: {
            userId: exam.userId,
            questionId: answer.questionId,
            wrongCount: 1,
            lastWrong: new Date()
          },
          update: {
            wrongCount: { increment: 1 },
            lastWrong: new Date(),
            mastered: false
          }
        })
      }
    }

    const totalQuestions = exam.answers.length
    const percentage = (correctCount / totalQuestions) * 100
    const passed = percentage >= 60 // 60% passing score

    // Update exam
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        timeSpent: timeSpent || null,
        score: correctCount,
        totalScore: totalQuestions,
        percentage,
        passed
      }
    })

    return {
      success: true,
      exam: updatedExam,
      results: {
        correctCount,
        totalQuestions,
        percentage,
        passed
      }
    }
  } catch (error: any) {
    console.error('Submit exam error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '提交考试失败'
    })
  }
})
