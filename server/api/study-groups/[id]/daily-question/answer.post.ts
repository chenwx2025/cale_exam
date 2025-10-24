import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { answer, timeSpent, questionDate } = body

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!answer) {
    throw createError({
      statusCode: 400,
      message: '缺少答案'
    })
  }

  try {
    // 检查是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能答题'
      })
    }

    // 使用提供的日期或今天的日期
    const targetDate = questionDate || new Date().toISOString().split('T')[0]

    // 获取每日一题
    const dailyQuestion = await prisma.studyGroupDailyQuestion.findUnique({
      where: {
        groupId_questionDate: {
          groupId,
          questionDate: targetDate
        }
      },
      include: {
        question: true
      }
    })

    if (!dailyQuestion) {
      throw createError({
        statusCode: 404,
        message: '今天还没有设置每日一题'
      })
    }

    // 检查用户是否已经回答过
    const existingAnswer = await prisma.studyGroupDailyQuestionAnswer.findUnique({
      where: {
        dailyQuestionId_userId: {
          dailyQuestionId: dailyQuestion.id,
          userId: user.userId
        }
      }
    })

    if (existingAnswer) {
      throw createError({
        statusCode: 400,
        message: '您已经回答过今天的题目了'
      })
    }

    // 检查答案是否正确
    const isCorrect = answer.trim().toUpperCase() === dailyQuestion.question.correctAnswer.trim().toUpperCase()

    // 创建答题记录
    const answerRecord = await prisma.studyGroupDailyQuestionAnswer.create({
      data: {
        dailyQuestionId: dailyQuestion.id,
        userId: user.userId,
        answer: answer.trim(),
        isCorrect,
        timeSpent: timeSpent || null
      },
      include: {
        dailyQuestion: {
          include: {
            question: {
              include: {
                domain: true
              }
            }
          }
        }
      }
    })

    // 获取更新后的统计数据
    const allAnswers = await prisma.studyGroupDailyQuestionAnswer.findMany({
      where: {
        dailyQuestionId: dailyQuestion.id
      }
    })

    const totalAnswers = allAnswers.length
    const correctAnswers = allAnswers.filter(a => a.isCorrect).length
    const correctRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0

    return {
      success: true,
      data: {
        answer: answerRecord,
        isCorrect,
        correctAnswer: dailyQuestion.question.correctAnswer,
        explanation: dailyQuestion.question.explanation,
        stats: {
          totalAnswers,
          correctAnswers,
          correctRate: Math.round(correctRate * 100) / 100
        }
      },
      message: isCorrect ? '回答正确！' : '回答错误，继续加油！'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('提交答案失败:', error)
    throw createError({
      statusCode: 500,
      message: '提交答案失败'
    })
  }
})
