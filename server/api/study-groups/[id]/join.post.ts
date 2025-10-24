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
    // 检查小组是否存在
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        members: true
      }
    })

    if (!group) {
      throw createError({
        statusCode: 404,
        message: '小组不存在'
      })
    }

    // 检查是否已经是成员
    const existingMember = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (existingMember) {
      throw createError({
        statusCode: 400,
        message: '你已经是该小组成员'
      })
    }

    // 检查小组是否已满
    if (group.members.length >= group.maxMembers) {
      throw createError({
        statusCode: 400,
        message: '小组成员已满'
      })
    }

    // 如果是私密小组，不允许直接加入（需要通过邀请）
    if (!group.isPublic) {
      throw createError({
        statusCode: 403,
        message: '这是一个私密小组，需要管理员邀请才能加入'
      })
    }

    // 如果需要审批，创建加入申请
    if (group.requireApproval) {
      // 检查是否已经有pending的申请
      const existingRequest = await prisma.studyGroupJoinRequest.findFirst({
        where: {
          groupId,
          userId: user.userId,
          status: 'pending'
        }
      })

      if (existingRequest) {
        return {
          success: true,
          requiresApproval: true,
          data: {
            requestId: existingRequest.id,
            status: 'pending',
            createdAt: existingRequest.createdAt
          },
          message: '你已经提交过加入申请，请等待审批'
        }
      }

      // 创建新的加入申请
      const body = await readBody(event)
      const joinRequest = await prisma.studyGroupJoinRequest.create({
        data: {
          groupId,
          userId: user.userId,
          message: body.message || null,
          status: 'pending'
        }
      })

      return {
        success: true,
        requiresApproval: true,
        data: {
          requestId: joinRequest.id,
          status: 'pending',
          createdAt: joinRequest.createdAt
        },
        message: '加入申请已提交，请等待管理员审批'
      }
    }

    // 不需要审批，直接添加成员
    const newMember = await prisma.studyGroupMember.create({
      data: {
        groupId,
        userId: user.userId,
        role: 'member'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            nickname: true
          }
        }
      }
    })

    return {
      success: true,
      requiresApproval: false,
      data: {
        id: newMember.id,
        userId: newMember.userId,
        groupId: newMember.groupId,
        role: newMember.role,
        joinedAt: newMember.joinedAt
      },
      message: '成功加入小组'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('加入小组失败:', error)
    throw createError({
      statusCode: 500,
      message: '加入小组失败'
    })
  }
})
