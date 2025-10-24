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
      },
      include: {
        group: true
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

    // 检查小组是否已满
    const memberCount = await prisma.studyGroupMember.count({
      where: { groupId }
    })

    if (memberCount >= request.group.maxMembers) {
      throw createError({
        statusCode: 400,
        message: '小组成员已满'
      })
    }

    // 检查申请人是否已经是成员
    const existingMember = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: request.userId
      }
    })

    if (existingMember) {
      throw createError({
        statusCode: 400,
        message: '该用户已经是小组成员'
      })
    }

    // 使用事务：更新申请状态 + 添加成员
    const result = await prisma.$transaction([
      // 更新申请状态
      prisma.studyGroupJoinRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          reviewedBy: user.userId,
          reviewedAt: new Date()
        }
      }),
      // 添加成员
      prisma.studyGroupMember.create({
        data: {
          groupId,
          userId: request.userId,
          role: 'member'
        }
      })
    ])

    return {
      success: true,
      data: {
        request: result[0],
        member: result[1]
      },
      message: '已批准加入申请'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('审批申请失败:', error)
    throw createError({
      statusCode: 500,
      message: '审批申请失败'
    })
  }
})
