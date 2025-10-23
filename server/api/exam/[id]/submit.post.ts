import prisma from '../../../utils/prisma'
import { updateUserStats, updateStreakDays } from '../../../utils/achievement-service'

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

    // Calculate scores and prepare data
    let correctCount = 0
    const answerData = []
    const wrongQuestionsData = []

    // Prepare all data
    for (const answer of exam.answers) {
      const isCorrect = answer.userAnswer === answer.question.correctAnswer

      answerData.push({
        id: answer.id,
        isCorrect
      })

      if (isCorrect) {
        correctCount++
      }

      // Prepare wrong question data if incorrect
      if (!isCorrect && answer.userAnswer) {
        wrongQuestionsData.push({
          userId: exam.userId,
          questionId: answer.questionId
        })
      }
    }

    const totalQuestions = exam.answers.length
    const percentage = (correctCount / totalQuestions) * 100
    const passed = percentage >= 60 // 60% passing score

    console.log('[SUBMIT] 开始提交考试:', {
      examId,
      totalQuestions,
      correctCount,
      percentage: percentage.toFixed(2) + '%',
      passed
    })

    // Execute all updates in a transaction
    const updatedExam = await prisma.$transaction(async (tx) => {
      // Update all answers
      for (const data of answerData) {
        await tx.examAnswer.update({
          where: { id: data.id },
          data: { isCorrect: data.isCorrect }
        })
      }

      // Upsert all wrong questions
      for (const data of wrongQuestionsData) {
        await tx.wrongQuestion.upsert({
          where: {
            userId_questionId: {
              userId: data.userId,
              questionId: data.questionId
            }
          },
          create: {
            userId: data.userId,
            questionId: data.questionId,
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

      // Update exam status
      const updated = await tx.exam.update({
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

      console.log('[SUBMIT] 考试更新成功:', {
        id: updated.id,
        status: updated.status,
        score: updated.score,
        totalScore: updated.totalScore,
        percentage: updated.percentage,
        passed: updated.passed
      })

      return updated
    })

    // Update user stats and achievements (don't block the response)
    updateUserStats(exam.userId, {
      type: 'exam',
      examType: updatedExam.examType, // 传递考试类型
      questionsAnswered: totalQuestions,
      correctAnswers: correctCount,
      studyMinutes: timeSpent ? Math.ceil(timeSpent / 60) : 0
    }).catch(error => {
      console.error('更新用户统计失败:', error)
    })

    // Update streak days（传递考试类型）
    updateStreakDays(exam.userId, updatedExam.examType).catch(error => {
      console.error('更新连续学习天数失败:', error)
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
