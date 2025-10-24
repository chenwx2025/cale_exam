import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const invitationId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const { action } = body // 'accept' or 'reject'

  if (!invitationId || !action) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  if (!['accept', 'reject'].includes(action)) {
    throw createError({
      statusCode: 400,
      message: '无效的操作'
    })
  }

  try {
    // 获取邀请信息
    const invitation = await prisma.studyGroupInvitation.findUnique({
      where: { id: invitationId },
      include: {
        group: {
          include: {
            members: true
          }
        }
      }
    })

    if (!invitation) {
      throw createError({
        statusCode: 404,
        message: '邀请不存在'
      })
    }

    // 验证是否是被邀请者
    if (invitation.inviteeId !== user.userId) {
      throw createError({
        statusCode: 403,
        message: '只有被邀请者才能响应邀请'
      })
    }

    // 检查邀请状态
    if (invitation.status !== 'pending') {
      throw createError({
        statusCode: 400,
        message: '该邀请已被处理'
      })
    }

    // 检查是否已过期
    if (new Date() > invitation.expiresAt) {
      await prisma.studyGroupInvitation.update({
        where: { id: invitationId },
        data: { status: 'expired' }
      })
      throw createError({
        statusCode: 400,
        message: '邀请已过期'
      })
    }

    if (action === 'accept') {
      // 检查是否已是成员
      const existingMember = await prisma.studyGroupMember.findFirst({
        where: {
          groupId: invitation.groupId,
          userId: user.userId
        }
      })

      if (existingMember) {
        // 更新邀请状态但不加入小组
        await prisma.studyGroupInvitation.update({
          where: { id: invitationId },
          data: { status: 'accepted' }
        })

        return {
          success: true,
          message: '你已经是该小组成员'
        }
      }

      // 检查小组是否已满
      if (invitation.group.members.length >= invitation.group.maxMembers) {
        await prisma.studyGroupInvitation.update({
          where: { id: invitationId },
          data: { status: 'rejected' }
        })

        throw createError({
          statusCode: 400,
          message: '小组成员已满'
        })
      }

      // 接受邀请 - 使用事务确保数据一致性
      await prisma.$transaction([
        // 更新邀请状态
        prisma.studyGroupInvitation.update({
          where: { id: invitationId },
          data: { status: 'accepted' }
        }),
        // 添加成员
        prisma.studyGroupMember.create({
          data: {
            groupId: invitation.groupId,
            userId: user.userId,
            role: 'member'
          }
        })
      ])

      // TODO: 创建通知给邀请者

      return {
        success: true,
        message: '已成功加入小组',
        data: {
          groupId: invitation.groupId
        }
      }
    } else {
      // 拒绝邀请
      await prisma.studyGroupInvitation.update({
        where: { id: invitationId },
        data: { status: 'rejected' }
      })

      // TODO: 创建通知给邀请者

      return {
        success: true,
        message: '已拒绝邀请'
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('响应邀请失败:', error)
    throw createError({
      statusCode: 500,
      message: '响应邀请失败'
    })
  }
})
