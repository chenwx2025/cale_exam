import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const challengeId = getRouterParam(event, 'challengeId')

  if (!groupId || !challengeId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  try {
    // 获取参与记录
    const participation = await prisma.groupChallengeParticipant.findFirst({
      where: {
        challengeId,
        userId: user.userId
      },
      include: {
        challenge: true
      }
    })

    if (!participation) {
      throw createError({
        statusCode: 404,
        message: '你未参加此挑战'
      })
    }

    // 检查挑战状态 - 已完成的挑战不能退出
    if (participation.challenge.status === 'completed') {
      throw createError({
        statusCode: 400,
        message: '挑战已结束,不能退出'
      })
    }

    // 如果已完成挑战,不允许退出
    if (participation.isCompleted) {
      throw createError({
        statusCode: 400,
        message: '你已完成此挑战,不能退出'
      })
    }

    // 删除参与记录
    await prisma.groupChallengeParticipant.delete({
      where: {
        id: participation.id
      }
    })

    return {
      success: true,
      message: '已退出挑战'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('退出挑战失败:', error)
    throw createError({
      statusCode: 500,
      message: '退出挑战失败'
    })
  }
})
