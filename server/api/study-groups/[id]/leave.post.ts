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
    // 获取用户的成员信息
    const member = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!member) {
      throw createError({
        statusCode: 404,
        message: '你不是该小组成员'
      })
    }

    // owner不能直接离开，需要先转让所有权
    if (member.role === 'owner') {
      // 检查是否有其他成员
      const memberCount = await prisma.studyGroupMember.count({
        where: { groupId }
      })

      if (memberCount > 1) {
        throw createError({
          statusCode: 400,
          message: '所有者需要先转让所有权或删除小组'
        })
      }

      // 如果是唯一成员，可以离开（相当于删除小组）
      await prisma.$transaction([
        prisma.studyGroupMember.delete({
          where: { id: member.id }
        }),
        prisma.studyGroup.delete({
          where: { id: groupId }
        })
      ])

      return {
        success: true,
        message: '已离开小组（小组已删除）'
      }
    }

    // 普通成员直接删除
    await prisma.studyGroupMember.delete({
      where: {
        id: member.id
      }
    })

    return {
      success: true,
      message: '已离开小组'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('离开小组失败:', error)
    throw createError({
      statusCode: 500,
      message: '离开小组失败'
    })
  }
})
