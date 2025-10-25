import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  console.log('[FLAT CHALLENGE DETAIL] ========== 请求到达 ==========')

  try {
    // 验证用户身份
    const user = await requireAuth(event)
    console.log('[FLAT CHALLENGE DETAIL] 用户:', user.userId)

    const query = getQuery(event)
    const groupId = query.groupId as string
    const challengeId = query.challengeId as string

    console.log('[FLAT CHALLENGE DETAIL] groupId:', groupId, 'challengeId:', challengeId)

    if (!groupId || !challengeId) {
      throw createError({
        statusCode: 400,
        message: '缺少小组ID或挑战ID'
      })
    }

    console.log('[FLAT CHALLENGE DETAIL] 开始验证用户权限')

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        isActive: true
      }
    })

    if (!membership) {
      console.log('[FLAT CHALLENGE DETAIL] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '你不是该小组的成员'
      })
    }

    console.log('[FLAT CHALLENGE DETAIL] 用户是小组成员，开始获取挑战详情')

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
                email: true,
                nickname: true,
                avatar: true
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
      console.log('[FLAT CHALLENGE DETAIL] 挑战不存在')
      throw createError({
        statusCode: 404,
        message: '挑战不存在'
      })
    }

    // 检查挑战是否属于该小组
    if (challenge.groupId !== groupId) {
      console.log('[FLAT CHALLENGE DETAIL] 挑战不属于此小组')
      throw createError({
        statusCode: 403,
        message: '该挑战不属于此小组'
      })
    }

    console.log('[FLAT CHALLENGE DETAIL] 获取挑战详情成功，参与者数量:', challenge.participants.length)
    console.log('[FLAT CHALLENGE DETAIL] 准备返回响应...')

    return {
      success: true,
      data: challenge
    }
  } catch (error: any) {
    console.error('[FLAT CHALLENGE DETAIL] 获取挑战详情失败:', error)
    console.error('[FLAT CHALLENGE DETAIL] 错误详情:', {
      message: error.message,
      code: error.code,
      meta: error.meta
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
