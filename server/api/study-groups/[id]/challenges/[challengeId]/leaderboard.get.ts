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
        message: '只有小组成员才能查看排行榜'
      })
    }

    // 验证挑战是否存在
    const challenge = await prisma.groupChallenge.findFirst({
      where: {
        id: challengeId,
        groupId
      }
    })

    if (!challenge) {
      throw createError({
        statusCode: 404,
        message: '挑战不存在'
      })
    }

    // 获取参与者列表并排序
    const participants = await prisma.groupChallengeParticipant.findMany({
      where: {
        challengeId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true,
            email: true
          }
        }
      },
      orderBy: [
        { currentValue: 'desc' },
        { joinedAt: 'asc' }
      ]
    })

    // 计算排名
    let currentRank = 1
    let previousValue = -1
    const leaderboard = participants.map((participant, index) => {
      if (participant.currentValue !== previousValue) {
        currentRank = index + 1
        previousValue = participant.currentValue
      }

      return {
        rank: currentRank,
        userId: participant.user.id,
        name: participant.user.name,
        nickname: participant.user.nickname,
        avatar: participant.user.avatar,
        currentValue: participant.currentValue,
        targetValue: challenge.targetValue,
        progress: Math.min(100, (participant.currentValue / challenge.targetValue) * 100),
        isCompleted: participant.isCompleted,
        completedAt: participant.completedAt,
        rewardEarned: participant.rewardEarned,
        isCurrentUser: participant.userId === user.userId
      }
    })

    return {
      success: true,
      data: {
        challenge: {
          id: challenge.id,
          name: challenge.name,
          description: challenge.description,
          targetType: challenge.targetType,
          targetValue: challenge.targetValue,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          status: challenge.status,
          rewardPoints: challenge.rewardPoints
        },
        leaderboard,
        totalParticipants: participants.length
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取排行榜失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取排行榜失败'
    })
  }
})
