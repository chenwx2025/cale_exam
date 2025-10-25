import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT CHALLENGE LEAVE] ========== 请求到达 ==========')

  const user = await requireAuth(event)
  console.log('[FLAT CHALLENGE LEAVE] 用户:', user.userId)

  const body = await readBody(event)
  const { groupId, challengeId } = body

  console.log('[FLAT CHALLENGE LEAVE] groupId:', groupId, 'challengeId:', challengeId)

  if (!groupId || !challengeId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  try {
    console.log('[FLAT CHALLENGE LEAVE] 开始获取参与记录')

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
      console.log('[FLAT CHALLENGE LEAVE] 用户未参加此挑战')
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

    console.log('[FLAT CHALLENGE LEAVE] 开始删除参与记录')

    // 删除参与记录
    await prisma.groupChallengeParticipant.delete({
      where: {
        id: participation.id
      }
    })

    console.log('[FLAT CHALLENGE LEAVE] 参与记录已删除')
    console.log('[FLAT CHALLENGE LEAVE] 准备返回响应...')

    return {
      success: true,
      message: '已退出挑战'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT CHALLENGE LEAVE] 退出挑战失败:', error)
    throw createError({
      statusCode: 500,
      message: '退出挑战失败'
    })
  }
})
