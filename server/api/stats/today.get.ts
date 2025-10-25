import { requireAuth } from '~/server/utils/auth-helpers'
import prisma from '~/server/utils/prisma'

/**
 * 获取用户今日学习统计
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  let examType = String(query.examType || 'cale')

  try {
    // 获取今天的开始和结束时间（用户本地时区）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 获取今日答题数量
    const todayAnswersCount = await prisma.userAnswer.groupBy({
      by: ['questionId'],
      where: {
        userId: user.id,
        question: {
          examType
        },
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    }).then(result => result.length) // 去重后的题目数量

    // 获取今日答题用时（分钟）
    const todayAnswers = await prisma.userAnswer.findMany({
      where: {
        userId: user.id,
        question: {
          examType
        },
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        timeTaken: true
      }
    })

    const totalSeconds = todayAnswers.reduce((sum, answer) => sum + (answer.timeTaken || 0), 0)
    const todayMinutes = Math.round(totalSeconds / 60)

    // 获取今日正确率
    const todayCorrectCount = await prisma.userAnswer.count({
      where: {
        userId: user.id,
        question: {
          examType
        },
        isCorrect: true,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const accuracy = todayAnswersCount > 0
      ? Math.round((todayCorrectCount / todayAnswersCount) * 100)
      : 0

    return {
      success: true,
      data: {
        questionsAnswered: todayAnswersCount,
        minutesStudied: todayMinutes,
        accuracy,
        correctCount: todayCorrectCount,
        wrongCount: todayAnswersCount - todayCorrectCount
      }
    }
  } catch (error: any) {
    console.error('Error fetching today stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch today stats',
      message: error.message
    })
  }
})
