import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../../../utils/auth-helpers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  requireAdmin(event)

  try {
    // 1. 总通知数
    const totalNotifications = await prisma.notification.count()

    // 2. 未读通知数
    const unreadNotifications = await prisma.notification.count({
      where: { isRead: false }
    })

    // 3. 已读通知数
    const readNotifications = await prisma.notification.count({
      where: { isRead: true }
    })

    // 4. 按类型统计
    const typeStats = await prisma.notification.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    })

    // 5. 今日通知
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayNotifications = await prisma.notification.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    // 6. 最近7天通知
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentNotifications = await prisma.notification.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // 7. 阅读率
    const readRate = totalNotifications > 0
      ? Math.round((readNotifications / totalNotifications) * 100)
      : 0

    // 8. 按用户统计通知最多的前5名
    const topUsers = await prisma.notification.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    // 获取这些用户的详细信息
    const userIds = topUsers.map(u => u.userId)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true
      }
    })

    const topUsersWithDetails = topUsers.map(stat => {
      const user = users.find(u => u.id === stat.userId)
      return {
        userId: stat.userId,
        userName: user?.name || user?.nickname || user?.email || 'Unknown',
        count: Number(stat._count.id)
      }
    })

    return {
      success: true,
      data: {
        totalNotifications,
        unreadNotifications,
        readNotifications,
        todayNotifications,
        recentNotifications,
        readRate,
        typeStats: typeStats.map(stat => ({
          type: stat.type,
          count: Number(stat._count.id)
        })),
        topUsers: topUsersWithDetails
      }
    }
  } catch (error: any) {
    console.error('Get notifications summary error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get notifications summary: ' + error.message
    })
  }
})
