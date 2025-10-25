import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const query = getQuery(event)

  const { questionDate } = query

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
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
        message: '只有小组成员才能查看每日一题'
      })
    }

    // 使用提供的日期或今天的日期
    const targetDate = (questionDate as string) || new Date().toISOString().split('T')[0]

    // 获取每日一题
    const dailyQuestion = await prisma.studyGroupDailyQuestion.findUnique({
      where: {
        groupId_questionDate: {
          groupId,
          questionDate: targetDate
        }
      },
      include: {
        question: {
          include: {
            category: true
          }
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                nickname: true
              }
            }
          }
        }
      }
    })

    if (!dailyQuestion) {
      return {
        success: true,
        data: null,
        message: '今天还没有设置每日一题'
      }
    }

    // 检查当前用户是否已经回答
    const userAnswer = dailyQuestion.answers.find(a => a.userId === user.userId)

    // 统计答题情况
    const totalAnswers = dailyQuestion.answers.length
    const correctAnswers = dailyQuestion.answers.filter(a => a.isCorrect).length
    const correctRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0

    return {
      success: true,
      data: {
        ...dailyQuestion,
        userAnswer: userAnswer || null,
        hasAnswered: !!userAnswer,
        stats: {
          totalAnswers,
          correctAnswers,
          correctRate: Math.round(correctRate * 100) / 100
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取每日一题失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取每日一题失败'
    })
  }
})
