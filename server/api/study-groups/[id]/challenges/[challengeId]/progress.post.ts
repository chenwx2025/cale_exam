import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const challengeId = getRouterParam(event, 'challengeId')
  const body = await readBody(event)

  const { value } = body

  if (!groupId || !challengeId || value === undefined) {
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

    // 检查挑战状态
    if (participation.challenge.status !== 'active') {
      throw createError({
        statusCode: 400,
        message: '挑战未激活'
      })
    }

    // 检查是否已完成
    if (participation.isCompleted) {
      return {
        success: true,
        data: participation,
        message: '挑战已完成'
      }
    }

    // 更新进度
    const newValue = Math.max(participation.currentValue, parseInt(value))
    const isCompleted = newValue >= participation.challenge.targetValue

    const updated = await prisma.groupChallengeParticipant.update({
      where: {
        id: participation.id
      },
      data: {
        currentValue: newValue,
        isCompleted,
        ...(isCompleted && !participation.isCompleted ? { completedAt: new Date() } : {})
      },
      include: {
        challenge: {
          select: {
            name: true,
            targetType: true,
            targetValue: true,
            rewardPoints: true
          }
        }
      }
    })

    return {
      success: true,
      data: {
        ...updated,
        progress: Math.min(100, (newValue / participation.challenge.targetValue) * 100)
      },
      message: isCompleted && !participation.isCompleted ? '恭喜完成挑战!' : '进度已更新'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('更新挑战进度失败:', error)
    throw createError({
      statusCode: 500,
      message: '更新挑战进度失败'
    })
  }
})
