import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)

    const groupId = getRouterParam(event, 'id')
    const challengeId = getRouterParam(event, 'challengeId')

    if (!groupId || !challengeId) {
      throw createError({
        statusCode: 400,
        message: '缺少小组ID或挑战ID'
      })
    }

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        isActive: true
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '你不是该小组的成员'
      })
    }

    // 获取挑战详情，包括参与者信息
    const challenge = await prisma.groupChallenge.findUnique({
      where: {
        id: challengeId
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            currentValue: 'desc'
          }
        }
      }
    })

    if (!challenge) {
      throw createError({
        statusCode: 404,
        message: '挑战不存在'
      })
    }

    // 检查挑战是否属于该小组
    if (challenge.groupId !== groupId) {
      throw createError({
        statusCode: 403,
        message: '该挑战不属于此小组'
      })
    }

    return {
      success: true,
      data: challenge
    }
  } catch (error: any) {
    console.error('获取挑战详情失败:', error)
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || '获取挑战详情失败'
    })
  }
})
