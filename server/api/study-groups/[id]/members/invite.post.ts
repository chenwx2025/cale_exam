import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { inviteeId, message } = body

  if (!groupId || !inviteeId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  if (inviteeId === user.userId) {
    throw createError({
      statusCode: 400,
      message: '不能邀请自己'
    })
  }

  try {
    // 验证当前用户是否是小组成员且有权限邀请
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能邀请其他用户'
      })
    }

    // 只有owner和admin可以邀请
    if (!['owner', 'admin'].includes(membership.role)) {
      throw createError({
        statusCode: 403,
        message: '只有小组管理员才能邀请新成员'
      })
    }

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

    // 检查是否已达到最大成员数
    if (group.members.length >= group.maxMembers) {
      throw createError({
        statusCode: 400,
        message: '小组成员已满'
      })
    }

    // 检查被邀请者是否存在
    const invitee = await prisma.user.findUnique({
      where: { id: inviteeId }
    })

    if (!invitee) {
      throw createError({
        statusCode: 404,
        message: '被邀请用户不存在'
      })
    }

    // 检查是否已经是成员
    const existingMember = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: inviteeId
      }
    })

    if (existingMember) {
      throw createError({
        statusCode: 400,
        message: '该用户已经是小组成员'
      })
    }

    // 检查是否有未处理的邀请
    const existingInvitation = await prisma.studyGroupInvitation.findFirst({
      where: {
        groupId,
        inviteeId,
        status: 'pending'
      }
    })

    if (existingInvitation) {
      throw createError({
        statusCode: 400,
        message: '该用户已有待处理的邀请'
      })
    }

    // 创建邀请（7天后过期）
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.studyGroupInvitation.create({
      data: {
        groupId,
        inviterId: user.userId,
        inviteeId,
        message: message || '',
        expiresAt,
        status: 'pending'
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            nickname: true
          }
        },
        invitee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            nickname: true
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            examType: true
          }
        }
      }
    })

    // TODO: 创建通知给被邀请者

    return {
      success: true,
      data: invitation,
      message: '邀请已发送'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('发送邀请失败:', error)
    throw createError({
      statusCode: 500,
      message: '发送邀请失败'
    })
  }
})
