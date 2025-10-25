import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT CHALLENGES GET] ========== 请求到达 ==========')

  const user = await requireAuth(event)
  console.log('[FLAT CHALLENGES GET] 用户:', user.userId)

  const query = getQuery(event)
  const groupId = query.groupId as string
  const status = query.status as string || 'all'

  console.log('[FLAT CHALLENGES GET] groupId:', groupId, 'status:', status)

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  try {
    console.log('[FLAT CHALLENGES GET] 开始验证用户权限')

    // 验证用户是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      console.log('[FLAT CHALLENGES GET] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能查看挑战'
      })
    }

    console.log('[FLAT CHALLENGES GET] 用户是小组成员，开始查询挑战')

    // 构建查询条件
    const whereClause: any = { groupId }
    if (status !== 'all') {
      whereClause.status = status
    }

    // 获取挑战列表
    const challenges = await prisma.groupChallenge.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            participants: true
          }
        },
        participants: {
          where: {
            userId: user.userId
          },
          select: {
            id: true,
            currentValue: true,
            isCompleted: true,
            joinedAt: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'desc' }
      ]
    })

    console.log('[FLAT CHALLENGES GET] 查询到挑战数量:', challenges.length)

    // 自动更新挑战状态
    const now = new Date()
    const challengesToUpdate = challenges.filter(c => {
      if (c.status === 'upcoming' && new Date(c.startDate) <= now) {
        return true
      }
      if (c.status === 'active' && new Date(c.endDate) <= now) {
        return true
      }
      return false
    })

    if (challengesToUpdate.length > 0) {
      console.log('[FLAT CHALLENGES GET] 需要更新状态的挑战数量:', challengesToUpdate.length)
      for (const challenge of challengesToUpdate) {
        const newStatus = new Date(challenge.endDate) <= now ? 'completed' : 'active'
        await prisma.groupChallenge.update({
          where: { id: challenge.id },
          data: { status: newStatus }
        })
        challenge.status = newStatus
      }
    }

    // 格式化返回数据
    const formattedChallenges = challenges.map(challenge => ({
      ...challenge,
      type: challenge.targetType,
      target: challenge.targetValue,
      participantCount: challenge._count.participants,
      isParticipating: challenge.participants.length > 0,
      myProgress: challenge.participants[0] || null,
      participants: undefined,
      _count: undefined
    }))

    console.log('[FLAT CHALLENGES GET] 准备返回响应，挑战数量:', formattedChallenges.length)

    return {
      success: true,
      data: formattedChallenges
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT CHALLENGES GET] 获取挑战列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取挑战列表失败'
    })
  }
})
