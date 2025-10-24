import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { questionId, questionDate } = body

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  if (!questionId) {
    throw createError({
      statusCode: 400,
      message: '缺少题目ID'
    })
  }

  try {
    // 检查是否是小组管理员或组长
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能操作'
      })
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: '只有组长和管理员才能设置每日一题'
      })
    }

    // 检查题目是否存在
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!question) {
      throw createError({
        statusCode: 404,
        message: '题目不存在'
      })
    }

    // 使用提供的日期或今天的日期
    const targetDate = questionDate || new Date().toISOString().split('T')[0]

    // 检查该日期是否已经设置过题目
    const existingDaily = await prisma.studyGroupDailyQuestion.findUnique({
      where: {
        groupId_questionDate: {
          groupId,
          questionDate: targetDate
        }
      }
    })

    if (existingDaily) {
      // 更新现有题目
      const updatedDaily = await prisma.studyGroupDailyQuestion.update({
        where: {
          id: existingDaily.id
        },
        data: {
          questionId
        },
        include: {
          question: {
            include: {
              domain: true
            }
          }
        }
      })

      return {
        success: true,
        data: updatedDaily,
        message: '每日一题已更新'
      }
    } else {
      // 创建新题目
      const dailyQuestion = await prisma.studyGroupDailyQuestion.create({
        data: {
          groupId,
          questionId,
          questionDate: targetDate
        },
        include: {
          question: {
            include: {
              domain: true
            }
          }
        }
      })

      return {
        success: true,
        data: dailyQuestion,
        message: '每日一题设置成功'
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('设置每日一题失败:', error)
    throw createError({
      statusCode: 500,
      message: '设置每日一题失败'
    })
  }
})
