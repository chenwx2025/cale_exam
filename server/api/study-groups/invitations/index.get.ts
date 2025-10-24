import { PrismaClient } from '@prisma/client'
import { requireAuth } from '~/server/utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const status = query.status as string || 'pending'

  try {
    // 获取用户收到的邀请
    const invitations = await prisma.studyGroupInvitation.findMany({
      where: {
        inviteeId: user.userId,
        ...(status && status !== 'all' ? { status } : {})
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
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            examType: true,
            avatarUrl: true,
            isPublic: true,
            maxMembers: true,
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 检查并更新过期的邀请
    const now = new Date()
    const expiredInvitations = invitations.filter(
      inv => inv.status === 'pending' && inv.expiresAt < now
    )

    if (expiredInvitations.length > 0) {
      await prisma.studyGroupInvitation.updateMany({
        where: {
          id: {
            in: expiredInvitations.map(inv => inv.id)
          }
        },
        data: {
          status: 'expired'
        }
      })

      // 更新内存中的状态
      expiredInvitations.forEach(inv => {
        inv.status = 'expired'
      })
    }

    return {
      success: true,
      data: invitations.map(inv => ({
        ...inv,
        group: {
          ...inv.group,
          memberCount: inv.group._count.members
        }
      }))
    }
  } catch (error: any) {
    console.error('获取邀请列表失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取邀请列表失败'
    })
  }
})
