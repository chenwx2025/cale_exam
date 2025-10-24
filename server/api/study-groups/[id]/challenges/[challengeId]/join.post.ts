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
    // 验证用户是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能参加挑战'
      })
    }

    // 获取挑战信息
    const challenge = await prisma.groupChallenge.findFirst({
      where: {
        id: challengeId,
        groupId
      },
      include: {
        _count: {
          select: {
            participants: true
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

    // 检查挑战状态
    if (challenge.status === 'completed') {
      throw createError({
        statusCode: 400,
        message: '挑战已结束'
      })
    }

    if (challenge.status === 'cancelled') {
      throw createError({
        statusCode: 400,
        message: '挑战已取消'
      })
    }

    // 检查是否已参加
    const existingParticipation = await prisma.groupChallengeParticipant.findFirst({
      where: {
        challengeId,
        userId: user.userId
      }
    })

    if (existingParticipation) {
      throw createError({
        statusCode: 400,
        message: '你已参加此挑战'
      })
    }

    // 检查人数限制
    if (challenge.maxParticipants && challenge._count.participants >= challenge.maxParticipants) {
      throw createError({
        statusCode: 400,
        message: '挑战参与人数已满'
      })
    }

    // 创建参与记录
    const participation = await prisma.groupChallengeParticipant.create({
      data: {
        challengeId,
        userId: user.userId,
        currentValue: 0,
        isCompleted: false
      },
      include: {
        challenge: {
          select: {
            name: true,
            targetType: true,
            targetValue: true,
            startDate: true,
            endDate: true,
            rewardPoints: true
          }
        }
      }
    })

    return {
      success: true,
      data: participation,
      message: '成功加入挑战'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('加入挑战失败:', error)
    throw createError({
      statusCode: 500,
      message: '加入挑战失败'
    })
  }
})
