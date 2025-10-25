import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT CHALLENGE JOIN] ========== 请求到达 ==========')

  const user = await requireAuth(event)
  console.log('[FLAT CHALLENGE JOIN] 用户:', user.userId)

  const body = await readBody(event)
  const { groupId, challengeId } = body

  console.log('[FLAT CHALLENGE JOIN] groupId:', groupId, 'challengeId:', challengeId)

  if (!groupId || !challengeId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  try {
    console.log('[FLAT CHALLENGE JOIN] 开始验证用户权限')

    // 验证用户是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      console.log('[FLAT CHALLENGE JOIN] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能参加挑战'
      })
    }

    console.log('[FLAT CHALLENGE JOIN] 用户是小组成员，开始获取挑战信息')

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
      console.log('[FLAT CHALLENGE JOIN] 挑战不存在')
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

    console.log('[FLAT CHALLENGE JOIN] 检查是否已参加')

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

    console.log('[FLAT CHALLENGE JOIN] 开始创建参与记录')

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

    console.log('[FLAT CHALLENGE JOIN] 参与记录创建成功')
    console.log('[FLAT CHALLENGE JOIN] 准备返回响应...')

    return {
      success: true,
      data: participation,
      message: '成功加入挑战'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT CHALLENGE JOIN] 加入挑战失败:', error)
    throw createError({
      statusCode: 500,
      message: '加入挑战失败'
    })
  }
})
