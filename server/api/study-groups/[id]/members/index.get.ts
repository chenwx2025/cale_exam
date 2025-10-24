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
    // 验证用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      throw createError({
        statusCode: 403,
        message: '只有小组成员才能查看成员列表'
      })
    }

    // 获取成员列表
    const members = await prisma.studyGroupMember.findMany({
      where: {
        groupId,
        isActive: true
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
      },
      orderBy: [
        { role: 'desc' }, // owner, admin, moderator, member
        { joinedAt: 'asc' }
      ]
    })

    return {
      success: true,
      data: members.map(member => ({
        id: member.id,
        userId: member.user.id,
        name: member.user.name,
        nickname: member.user.nickname,
        email: member.user.email,
        avatar: member.user.avatar,
        role: member.role,
        joinedAt: member.joinedAt,
        isCurrentUser: member.userId === user.userId
      }))
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取成员列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取成员列表失败'
    })
  }
})
