import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  try {
    // 检查用户是否有权限查看申请（owner, admin, moderator）
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        role: {
          in: ['owner', 'admin', 'moderator']
        }
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '你没有权限查看加入申请'
      })
    }

    // 获取待审批的申请
    const requests = await prisma.studyGroupJoinRequest.findMany({
      where: {
        groupId,
        status: 'pending'
      },
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 获取申请人的信息
    const userIds = requests.map(r => r.userId)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        nickname: true
      }
    })

    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u
      return acc
    }, {} as Record<string, any>)

    // 组合数据
    const requestsWithUser = requests.map(req => ({
      ...req,
      user: userMap[req.userId]
    }))

    return {
      success: true,
      data: requestsWithUser
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取加入申请失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取加入申请失败'
    })
  }
})
