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
    // 验证用户是小组管理员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw createError({
        statusCode: 403,
        message: '只有小组管理员才能分发奖励'
      })
    }

    // 获取挑战信息
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

    // 检查挑战是否已结束
    if (challenge.status !== 'completed') {
      throw createError({
        statusCode: 400,
        message: '挑战尚未结束'
      })
    }

    // 获取所有参与者并按成绩排序
    const participants = await prisma.groupChallengeParticipant.findMany({
      where: {
        challengeId
      },
      orderBy: [
        { currentValue: 'desc' },
        { completedAt: 'asc' },
        { joinedAt: 'asc' }
      ]
    })

    if (participants.length === 0) {
      return {
        success: true,
        message: '没有参与者,无需分发奖励'
      }
    }

    // 计算排名和奖励
    // 基础奖励分配规则:
    // - 完成挑战: 100% 基础奖励
    // - 前3名额外奖励: 第1名 +50%, 第2名 +30%, 第3名 +20%
    // - 未完成但有进度: 按进度比例给予奖励

    let currentRank = 1
    let previousValue = -1
    const updates = []

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i]
      
      // 计算排名
      if (participant.currentValue !== previousValue) {
        currentRank = i + 1
        previousValue = participant.currentValue
      }

      // 计算奖励
      let reward = 0
      
      if (participant.isCompleted) {
        // 完成者获得100%基础奖励
        reward = challenge.rewardPoints
        
        // 前三名额外奖励
        if (currentRank === 1) {
          reward = Math.floor(reward * 1.5) // +50%
        } else if (currentRank === 2) {
          reward = Math.floor(reward * 1.3) // +30%
        } else if (currentRank === 3) {
          reward = Math.floor(reward * 1.2) // +20%
        }
      } else {
        // 未完成者按进度比例
        const progress = participant.currentValue / challenge.targetValue
        reward = Math.floor(challenge.rewardPoints * progress * 0.5) // 最多50%
      }

      updates.push({
        id: participant.id,
        rank: currentRank,
        reward
      })
    }

    // 批量更新参与者记录
    for (const update of updates) {
      await prisma.groupChallengeParticipant.update({
        where: { id: update.id },
        data: {
          rank: update.rank,
          rewardEarned: update.reward
        }
      })
    }

    return {
      success: true,
      data: {
        totalParticipants: participants.length,
        completedCount: participants.filter(p => p.isCompleted).length,
        totalRewardsDistributed: updates.reduce((sum, u) => sum + u.reward, 0)
      },
      message: '奖励分发成功'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('分发奖励失败:', error)
    throw createError({
      statusCode: 500,
      message: '分发奖励失败'
    })
  }
})
