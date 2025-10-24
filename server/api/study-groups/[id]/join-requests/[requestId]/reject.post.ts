import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const requestId = getRouterParam(event, 'requestId')

  if (!groupId || !requestId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  try {
    // 检查用户是否有权限审批（owner, admin, moderator）
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
        message: '你没有权限审批加入申请'
      })
    }

    // 查找申请
    const request = await prisma.studyGroupJoinRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw createError({
        statusCode: 404,
        message: '申请不存在'
      })
    }

    if (request.groupId !== groupId) {
      throw createError({
        statusCode: 400,
        message: '申请不属于该小组'
      })
    }

    if (request.status !== 'pending') {
      throw createError({
        statusCode: 400,
        message: '该申请已经被处理'
      })
    }

    // 更新申请状态为拒绝
    const updatedRequest = await prisma.studyGroupJoinRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        reviewedBy: user.userId,
        reviewedAt: new Date()
      }
    })

    return {
      success: true,
      data: updatedRequest,
      message: '已拒绝加入申请'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('拒绝申请失败:', error)
    throw createError({
      statusCode: 500,
      message: '拒绝申请失败'
    })
  }
})
