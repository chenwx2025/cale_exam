import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  const memberId = getRouterParam(event, 'memberId')
  const body = await readBody(event)

  const { role } = body

  if (!groupId || !memberId || !role) {
    throw createError({
      statusCode: 400,
      message: '缺少参数'
    })
  }

  // 验证角色值
  const validRoles = ['member', 'moderator', 'admin', 'owner']
  if (!validRoles.includes(role)) {
    throw createError({
      statusCode: 400,
      message: '无效的角色'
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
        message: '只有小组成员才能修改角色'
      })
    }

    // 获取目标成员信息
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
    // owner 可以修改任何人的角色（除了自己）
    // admin 可以将 member 提升为 moderator
    // 其他角色不能修改角色

    const roleHierarchy: { [key: string]: number } = {
      member: 0,
      moderator: 1,
      admin: 2,
      owner: 3
    }

    const currentRole = roleHierarchy[currentMember.role]
    const targetRole = roleHierarchy[targetMember.role]
    const newRole = roleHierarchy[role]

    // 不能修改自己的角色
    if (memberId === user.userId) {
      throw createError({
        statusCode: 400,
        message: '不能修改自己的角色'
      })
    }

    // 只有owner可以设置owner角色
    if (role === 'owner' && currentMember.role !== 'owner') {
      throw createError({
        statusCode: 403,
        message: '只有当前所有者可以转让所有权'
      })
    }

    // owner可以修改任何人的角色（除了设置owner，需要使用转让所有权功能）
    if (currentMember.role === 'owner') {
      if (role === 'owner') {
        throw createError({
          statusCode: 400,
          message: '请使用转让所有权功能'
        })
      }
      // 允许修改
    } 
    // admin可以将member提升为moderator或降级moderator为member
    else if (currentMember.role === 'admin') {
      if (targetRole >= roleHierarchy.admin || newRole >= roleHierarchy.admin) {
        throw createError({
          statusCode: 403,
          message: '没有权限修改该成员的角色'
        })
      }
    }
    // 其他角色不能修改角色
    else {
      throw createError({
        statusCode: 403,
        message: '只有管理员才能修改成员角色'
      })
    }

    // 更新角色
    const updatedMember = await prisma.studyGroupMember.update({
      where: {
        id: targetMember.id
      },
      data: {
        role
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

    // TODO: 创建通知给角色被修改的用户

    return {
      success: true,
      data: {
        ...updatedMember,
        user: undefined
      },
      message: '角色已更新'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('更新角色失败:', error)
    throw createError({
      statusCode: 500,
      message: '更新角色失败'
    })
  }
})
