import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const groupId = query.groupId as string

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: '缺少小组ID'
    })
  }

  try {
    console.log('[FLAT GET Members] 开始获取成员列表, groupId:', groupId, 'userId:', user.userId)

    // 检查用户是否是小组成员
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        groupId,
        userId: user.userId
      }
    })

    if (!membership) {
      console.log('[FLAT GET Members] 用户不是小组成员')
      throw createError({
        statusCode: 403,
        message: '只有小组成员可以查看成员列表'
      })
    }

    console.log('[FLAT GET Members] 用户是小组成员，开始查询成员')

    // 获取成员列表
    const members = await prisma.studyGroupMember.findMany({
      where: { groupId },
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
      orderBy: {
        joinedAt: 'asc'
      }
    })

    console.log('[FLAT GET Members] 查询到成员数量:', members.length)

    // 格式化数据
    const formattedMembers = members.map(member => ({
      id: member.id,
      userId: member.userId,
      groupId: member.groupId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user
    }))

    console.log('[FLAT GET Members] 格式化完成，返回数据')

    return {
      success: true,
      data: formattedMembers
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[FLAT GET Members] 获取成员列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取成员列表失败'
    })
  }
})
