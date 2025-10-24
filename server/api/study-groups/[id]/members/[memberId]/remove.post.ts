import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const memberId = getRouterParam(event, 'memberId')

  if (!groupId || !memberId) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  try {
    // 获取当前用户的成员信息
    const currentMember = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!currentMember) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能移除其他成员'
      })
    }

    // 获取要移除的成员信息
    const targetMember = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: memberId
      }
    })

    if (!targetMember) {
      throw createError({
        statusCode: 404,
        message: '该用户不是小组成员'
      })
    }

    // 权限检查
    // owner 可以移除任何人（除了自己）
    // admin 可以移除 member 和 moderator
    // moderator 可以移除 member
    // member 不能移除任何人

    if (memberId === user.userId) {
      // 不能移除自己，应该使用离开小组功能
      throw createError({
        statusCode: 400,
        message: '不能移除自己，请使用离开小组功能'
      })
    }

    const roleHierarchy: { [key: string]: number } = {
      member: 0,
      moderator: 1,
      admin: 2,
      owner: 3
    }

    const currentRole = roleHierarchy[currentMember.role]
    const targetRole = roleHierarchy[targetMember.role]

    // 检查权限等级
    if (currentRole <= targetRole) {
      throw createError({
        statusCode: 403,
        message: '没有权限移除该成员'
      })
    }

    // 至少需要moderator权限才能移除成员
    if (currentRole < roleHierarchy.moderator) {
      throw createError({
        statusCode: 403,
        message: '只有管理员才能移除成员'
      })
    }

    // 移除成员
    await prisma.studyGroupMember.delete({
      where: {
        id: targetMember.id
      }
    })

    // TODO: 创建通知给被移除的用户

    return {
      success: true,
      message: '已移除该成员'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('移除成员失败:', error)
    throw createError({
      statusCode: 500,
      message: '移除成员失败'
    })
  }
})
